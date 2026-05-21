#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# ledens/infra/setup.sh
# One-time provisioning script: builds backend → ACR, creates Azure Container
# App, and links it as the /api/* backend for Azure Static Web Apps.
#
# Run once from the repo root on a machine that has:
#   • Azure CLI  (az) ≥ 2.57   → https://aka.ms/installazurecli
#   • Docker Engine             → https://docs.docker.com/get-docker/
#   • Bash 4+  (macOS: brew install bash)
#
# After this script completes:
#   1. Push to main to trigger CI/CD — it handles all future deployments.
#   2. Add AZURE_CREDENTIALS to GitHub Secrets (instructions printed at end).
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── ❶  CONFIGURATION — edit these before running ──────────────────────────
SUBSCRIPTION="REPLACE_WITH_YOUR_SUBSCRIPTION_ID"   # az account list -o table
RESOURCE_GROUP="rg-ledens-mvp"
LOCATION="westeurope"                              # az account list-locations -o table

ACR_NAME="cregledensmvp1-f0b3hcbabag9d3dp"
IMAGE_NAME="ledens-backend"
IMAGE_TAG="latest"

ACA_ENV_NAME="ledens-env"
ACA_NAME="ledens-backend"

# Your Static Web App name — find it with:
#   az staticwebapp list -g rg-ledens-mvp --query "[].name" -o tsv
SWA_NAME="REPLACE_WITH_YOUR_SWA_NAME"

# Storage account for leads.jsonl persistence (3–24 lowercase alphanumeric)
STORAGE_ACCOUNT="ledensdatamvp1"   # must be globally unique — change if taken

# GitHub repo (org/repo) for the service principal scope
GITHUB_SP_NAME="sp-ledens-github"
# ──────────────────────────────────────────────────────────────────────────

REGISTRY="${ACR_NAME}.azurecr.io"
IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

log()  { echo -e "\n\033[1;34m▶  $*\033[0m"; }
ok()   { echo -e "\033[1;32m✔  $*\033[0m"; }
warn() { echo -e "\033[1;33m⚠  $*\033[0m"; }

# ── ❷  Verify dependencies ────────────────────────────────────────────────
log "Checking dependencies"
command -v az     >/dev/null 2>&1 || { echo "Azure CLI not found"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker not found"; exit 1; }

# ── ❸  Azure login & subscription ────────────────────────────────────────
log "Setting active subscription"
az account set --subscription "$SUBSCRIPTION"
az extension add --name containerapp --upgrade --yes 2>/dev/null
ok "Subscription set"

# ── ❹  Build & push the initial Docker image to ACR ─────────────────────
log "Building and pushing ${IMAGE}"
az acr login --name "$ACR_NAME"

# Build from the backend directory (repo root assumed as CWD)
docker build \
  --label "provisioned-by=infra/setup.sh" \
  -t "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}" \
  ledens/backend

docker push "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
ok "Image pushed to ACR"

# ── ❺  Create ACA Environment (shared infrastructure layer) ──────────────
log "Creating Container Apps Environment: ${ACA_ENV_NAME}"
if az containerapp env show -n "$ACA_ENV_NAME" -g "$RESOURCE_GROUP" &>/dev/null; then
  warn "Environment already exists — skipping"
else
  az containerapp env create \
    --name            "$ACA_ENV_NAME" \
    --resource-group  "$RESOURCE_GROUP" \
    --location        "$LOCATION"
  ok "Environment created"
fi

# ── ❻  Azure Storage for persistent leads.jsonl ───────────────────────────
log "Creating Storage Account: ${STORAGE_ACCOUNT}"
if az storage account show -n "$STORAGE_ACCOUNT" -g "$RESOURCE_GROUP" &>/dev/null; then
  warn "Storage account already exists — skipping"
else
  az storage account create \
    --name               "$STORAGE_ACCOUNT" \
    --resource-group     "$RESOURCE_GROUP" \
    --location           "$LOCATION" \
    --sku                Standard_LRS \
    --kind               StorageV2 \
    --allow-blob-public-access false \
    --min-tls-version    TLS1_2
fi

STORAGE_KEY=$(az storage account keys list \
  --resource-group  "$RESOURCE_GROUP" \
  --account-name    "$STORAGE_ACCOUNT" \
  --query "[0].value" --output tsv)

az storage share create \
  --name          "ledens-data" \
  --account-name  "$STORAGE_ACCOUNT" \
  --account-key   "$STORAGE_KEY" \
  --quota         1 2>/dev/null || warn "File share already exists"

# Link the Azure Files share to the ACA Environment
az containerapp env storage set \
  --name                     "$ACA_ENV_NAME" \
  --resource-group           "$RESOURCE_GROUP" \
  --storage-name             "ledens-data" \
  --account-name             "$STORAGE_ACCOUNT" \
  --azure-file-account-key   "$STORAGE_KEY" \
  --azure-file-share-name    "ledens-data" \
  --access-mode              ReadWrite
ok "Storage linked to ACA environment"

# ── ❼  Retrieve SWA origin for CORS ──────────────────────────────────────
log "Looking up SWA hostname"
SWA_HOST=$(az staticwebapp show \
  --name           "$SWA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "defaultHostname" --output tsv)
SWA_ORIGIN="https://${SWA_HOST}"
ok "SWA origin: ${SWA_ORIGIN}"

# ── ❽  Create the Container App ──────────────────────────────────────────
log "Creating Container App: ${ACA_NAME}"
if az containerapp show -n "$ACA_NAME" -g "$RESOURCE_GROUP" &>/dev/null; then
  warn "Container App already exists — updating image instead"
  az containerapp update \
    --name           "$ACA_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image          "$IMAGE"
else
  az containerapp create \
    --name              "$ACA_NAME" \
    --resource-group    "$RESOURCE_GROUP" \
    --environment       "$ACA_ENV_NAME" \
    --image             "$IMAGE" \
    --registry-server   "$REGISTRY" \
    --target-port       4000 \
    --ingress           external \
    --min-replicas      1 \
    --max-replicas      3 \
    --cpu               0.25 \
    --memory            0.5Gi \
    --env-vars \
      "NODE_ENV=production" \
      "PORT=4000" \
      "CORS_ORIGIN=${SWA_ORIGIN}" \
      "DATA_DIR=/data"
  ok "Container App created"
fi

# ── ❾  Assign managed identity + AcrPull so CI can push without passwords ─
log "Configuring managed identity for ACR pull"
az containerapp identity assign \
  --name           "$ACA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --system-assigned \
  --output none

PRINCIPAL_ID=$(az containerapp identity show \
  --name           "$ACA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "principalId" --output tsv)

ACR_ID=$(az acr show \
  --name           "$ACR_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "id" --output tsv)

az role assignment create \
  --role       AcrPull \
  --assignee   "$PRINCIPAL_ID" \
  --scope      "$ACR_ID" \
  --output     none 2>/dev/null || warn "AcrPull role may already be assigned"
ok "Managed identity configured"

# ── ❿  Mount the Azure Files volume (requires YAML patch) ────────────────
log "Mounting /data volume (Azure Files)"
ACA_YAML=$(az containerapp show \
  --name           "$ACA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --output yaml)

# Only patch if volume not already present
if ! echo "$ACA_YAML" | grep -q "ledens-data"; then
  # Append volume definition via a minimal YAML patch written to a temp file
  PATCH=$(mktemp /tmp/aca-patch-XXXXXX.yaml)
  cat > "$PATCH" <<'YAML'
properties:
  template:
    volumes:
      - name: data
        storageType: AzureFile
        storageName: ledens-data
    containers:
      - name: ledens-backend
        volumeMounts:
          - volumeName: data
            mountPath: /data
YAML
  az containerapp update \
    --name           "$ACA_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --yaml           "$PATCH"
  rm -f "$PATCH"
  ok "Volume mounted at /data"
else
  warn "Volume already mounted — skipping"
fi

# ── ⓫  Link Container App as SWA backend (/api/* proxy) ─────────────────
log "Linking Container App as SWA backend"
ACA_RESOURCE_ID=$(az containerapp show \
  --name           "$ACA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "id" --output tsv)

az extension add --name staticwebapp --upgrade --yes 2>/dev/null

if az staticwebapp backends show \
    --name           "$SWA_NAME" \
    --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  warn "Backend already linked — skipping"
else
  az staticwebapp backends link \
    --name                 "$SWA_NAME" \
    --resource-group       "$RESOURCE_GROUP" \
    --backend-resource-id  "$ACA_RESOURCE_ID" \
    --backend-region       "$LOCATION"
  ok "SWA now forwards /api/* → Container App"
fi

# ── ⓬  Print Container App FQDN ──────────────────────────────────────────
ACA_FQDN=$(az containerapp show \
  --name           "$ACA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "properties.configuration.ingress.fqdn" --output tsv)

# ── ⓭  Create GitHub Actions service principal ───────────────────────────
log "Creating service principal for GitHub Actions: ${GITHUB_SP_NAME}"
SP_JSON=$(az ad sp create-for-rbac \
  --name   "$GITHUB_SP_NAME" \
  --role   Contributor \
  --scopes "/subscriptions/${SUBSCRIPTION}/resourceGroups/${RESOURCE_GROUP}" \
  --sdk-auth \
  --output json 2>/dev/null || echo "")

# ── ⓮  Summary ────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  PROVISIONING COMPLETE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  Backend FQDN : https://${ACA_FQDN}"
echo "  SWA origin   : ${SWA_ORIGIN}"
echo "  /api/* proxy : SWA → Container App (linked backend)"
echo ""
echo "  ── Next steps ──────────────────────────────────────────────"
echo ""
echo "  1. Add AZURE_CREDENTIALS to GitHub Secrets:"
echo "     https://github.com/AlvaroNS/Ledens-Frontend/settings/secrets/actions"
echo ""
if [ -n "$SP_JSON" ]; then
  echo "  Paste this JSON as the AZURE_CREDENTIALS secret value:"
  echo ""
  echo "$SP_JSON"
  echo ""
else
  echo "  Service principal already exists or creation failed."
  echo "  Run manually:"
  echo "    az ad sp create-for-rbac --name ${GITHUB_SP_NAME} \\"
  echo "      --role Contributor \\"
  echo "      --scopes /subscriptions/${SUBSCRIPTION}/resourceGroups/${RESOURCE_GROUP} \\"
  echo "      --sdk-auth"
  echo ""
fi
echo "  2. Push a change to ledens/backend/** to trigger the first CI run."
echo ""
echo "  3. Verify the health endpoint:"
echo "     curl https://${ACA_FQDN}/api/health"
echo ""
echo "════════════════════════════════════════════════════════════════"
