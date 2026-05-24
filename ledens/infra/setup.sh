#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# ledens/infra/setup.sh
# Provisioning script: builds backend → ACR, creates Azure Container App,
# and links it as the /api/* backend for Azure Static Web Apps.
# Uses existing resources where already provisioned.
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Locate the repository source ─────────────────────────────────────────
GITHUB_REPO="https://github.com/AlvaroNS/Ledens-Frontend.git"

_locate_repo() {
  if [ -d "ledens/backend" ]; then
    echo "$(pwd)"; return
  fi

  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"
  if [ -n "$script_dir" ] && [ -d "${script_dir}/../../ledens/backend" ]; then
    echo "$(cd "${script_dir}/../.." && pwd)"; return
  fi

  local clone_dir
  clone_dir="$(mktemp -d /tmp/ledens-XXXXXX)"
  echo -e "\n\033[1;33m⚠  Repository not found locally — cloning into ${clone_dir}\033[0m" >&2
  git clone --depth 1 "$GITHUB_REPO" "$clone_dir" >&2
  echo "$clone_dir"
}

REPO_ROOT="$(_locate_repo)"
cd "$REPO_ROOT"
echo "Working directory: $REPO_ROOT"

# ── ❶  CONFIGURATION ──────────────────────────────────────────────────────
SUBSCRIPTION="550f2d00-7d8d-4699-8b84-6eccff979f88"
RESOURCE_GROUP="rg-ledens-mvp"
LOCATION="westeurope"

# ── Existing resources (from Azure Portal) ────────────────────────────────
ACR_NAME="cregledensmvp1"
ACA_ENV_NAME="ledens-env"
STORAGE_ACCOUNT="stledensmvp1"
SWA_NAME="webapp-ledens-landing-1"
MANAGED_IDENTITY="id-ledens-api-acr-pull"
KEY_VAULT="kv-ledens-mvp-1"

# ── New resources to create ───────────────────────────────────────────────
IMAGE_NAME="ledens-backend"
IMAGE_TAG="latest"
ACA_NAME="ledens-backend"
GITHUB_SP_NAME="sp-ledens-github"
# ─────────────────────────────────────────────────────────────────────────

REGISTRY="${ACR_NAME}.azurecr.io"
IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

log()  { echo -e "\n\033[1;34m▶  $*\033[0m"; }
ok()   { echo -e "\033[1;32m✔  $*\033[0m"; }
warn() { echo -e "\033[1;33m⚠  $*\033[0m"; }

# ── ❷  Verify dependencies ────────────────────────────────────────────────
log "Checking dependencies"
command -v az >/dev/null 2>&1 || { echo "Azure CLI not found"; exit 1; }
ok "Azure CLI found"

# ── ❸  Azure login & subscription ────────────────────────────────────────
log "Setting active subscription"
az account set --subscription "$SUBSCRIPTION"
az extension add --name containerapp --upgrade --yes 2>/dev/null
ok "Subscription set"

# ── ❹  Build & push Docker image to existing ACR ─────────────────────────
log "Building and pushing ${IMAGE} to existing ACR: ${ACR_NAME}"
az acr build \
  --registry    "$ACR_NAME" \
  --image       "${IMAGE_NAME}:${IMAGE_TAG}" \
  --platform    linux/amd64 \
  ledens/backend
ok "Image pushed to ACR"

# ── ❺  Container Apps Environment (already exists) ───────────────────────
log "Verifying Container Apps Environment: ${ACA_ENV_NAME}"
if az containerapp env show -n "$ACA_ENV_NAME" -g "$RESOURCE_GROUP" &>/dev/null; then
  ok "Environment already exists — skipping"
else
  az containerapp env create \
    --name            "$ACA_ENV_NAME" \
    --resource-group  "$RESOURCE_GROUP" \
    --location        "$LOCATION"
  ok "Environment created"
fi

# ── ❻  Storage Account (already exists) — create file share if needed ────
log "Verifying Storage Account: ${STORAGE_ACCOUNT}"
ok "Storage account already exists — skipping creation"

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
log "Looking up SWA hostname: ${SWA_NAME}"
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

# ── ❾  Use existing Managed Identity for AcrPull ─────────────────────────
log "Assigning existing Managed Identity to Container App"

# Get the principal ID of the existing managed identity
MI_PRINCIPAL_ID=$(az identity show \
  --name           "$MANAGED_IDENTITY" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "principalId" --output tsv)

MI_CLIENT_ID=$(az identity show \
  --name           "$MANAGED_IDENTITY" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "clientId" --output tsv)

MI_RESOURCE_ID=$(az identity show \
  --name           "$MANAGED_IDENTITY" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "id" --output tsv)

# Assign the existing user-assigned identity to the Container App
az containerapp identity assign \
  --name           "$ACA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --user-assigned  "$MI_RESOURCE_ID" \
  --output none

# Grant AcrPull role to the existing managed identity
ACR_ID="/subscriptions/${SUBSCRIPTION}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.ContainerRegistry/registries/${ACR_NAME}"

az role assignment create \
  --role       AcrPull \
  --assignee   "$MI_PRINCIPAL_ID" \
  --scope      "$ACR_ID" \
  --output     none 2>/dev/null || warn "AcrPull role may already be assigned"
ok "Managed identity configured"

# ── ❿  Mount the Azure Files volume ──────────────────────────────────────
log "Mounting /data volume (Azure Files)"
ACA_YAML=$(az containerapp show \
  --name           "$ACA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --output yaml)

if ! echo "$ACA_YAML" | grep -q "ledens-data"; then
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
echo "  ── Existing resources used ─────────────────────────────────"
echo "  ACR              : ${ACR_NAME}"
echo "  ACA Environment  : ${ACA_ENV_NAME}"
echo "  Storage Account  : ${STORAGE_ACCOUNT}"
echo "  Managed Identity : ${MANAGED_IDENTITY}"
echo "  Key Vault        : ${KEY_VAULT}"
echo "  Static Web App   : ${SWA_NAME}"
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
