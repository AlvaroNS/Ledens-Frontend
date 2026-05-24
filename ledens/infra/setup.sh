#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# ledens/infra/setup.sh
# Provisioning script: builds backend → ACR, creates Azure Container App,
# and links it as the /api/* backend for Azure Static Web Apps.
# Uses existing resources where already provisioned.
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Locate the repository source ─────────────────────────────────────────────
# Works from a local clone, from inside infra/, or from Azure Cloud Shell
# (auto-clones the repo into /tmp if no local copy is present).
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

# ── ❶  CONFIGURATION ─────────────────────────────────────────────────────────
SUBSCRIPTION="550f2d00-7d8d-4699-8b84-6eccff979f88"
RESOURCE_GROUP="rg-ledens-mvp"
LOCATION="westeurope"

# ── Existing resources ────────────────────────────────────────────────────────
ACA_ENV_NAME="ledens-env"
STORAGE_ACCOUNT="stledensmvp1"
SWA_NAME="webapp-ledens-landing-1"
MANAGED_IDENTITY="id-ledens-api-acr-pull"
KEY_VAULT="kv-ledens-mvp-1"

# Log Analytics workspace that was auto-created by mistake — will be deleted.
DUPLICATE_LOG_WORKSPACE="workspace-rgledensmvpqCnL"

# ── New resources to create ───────────────────────────────────────────────────
IMAGE_NAME="ledens-backend"
IMAGE_TAG="latest"
ACA_NAME="ledens-backend"
GITHUB_SP_NAME="sp-ledens-github"
# ─────────────────────────────────────────────────────────────────────────────

log()  { echo -e "\n\033[1;34m▶  $*\033[0m"; }
ok()   { echo -e "\033[1;32m✔  $*\033[0m"; }
warn() { echo -e "\033[1;33m⚠  $*\033[0m"; }

# ── ❷  Check dependencies ─────────────────────────────────────────────────────
log "Checking dependencies"
command -v az >/dev/null 2>&1 || { echo "Azure CLI not found"; exit 1; }
ok "Azure CLI found"

# ── ❸  Set subscription & install extensions ──────────────────────────────────
log "Setting active subscription"
az account set --subscription "$SUBSCRIPTION"
az extension add --name containerapp --upgrade --yes 2>/dev/null
ok "Subscription set"

# ── ❹  Detect ACR — name AND login-server URL from the resource group ─────────
# This avoids hardcoding a name that may differ from the login-server hostname
# (Azure sometimes appends a unique suffix: cregledensmvp1-<hash>.azurecr.io).
log "Detecting ACR in ${RESOURCE_GROUP}"
ACR_NAME=$(az acr list \
  --resource-group "$RESOURCE_GROUP" \
  --query          "[0].name" --output tsv)
REGISTRY=$(az acr list \
  --resource-group "$RESOURCE_GROUP" \
  --query          "[0].loginServer" --output tsv)
IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
ok "ACR resource name : ${ACR_NAME}"
ok "ACR login server  : ${REGISTRY}"
ok "Image             : ${IMAGE}"

# ── ❺  Build & push Docker image to ACR (server-side, no local Docker needed) ─
log "Building and pushing ${IMAGE}"
az acr build \
  --registry    "$ACR_NAME" \
  --image       "${IMAGE_NAME}:${IMAGE_TAG}" \
  --platform    linux/amd64 \
  ledens/backend
ok "Image pushed to ACR"

# ── ❻  Get managed identity details (needed before container app creation) ─────
log "Reading managed identity: ${MANAGED_IDENTITY}"
MI_RESOURCE_ID=$(az identity show \
  --name           "$MANAGED_IDENTITY" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "id" --output tsv)
MI_PRINCIPAL_ID=$(az identity show \
  --name           "$MANAGED_IDENTITY" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "principalId" --output tsv)
MI_CLIENT_ID=$(az identity show \
  --name           "$MANAGED_IDENTITY" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "clientId" --output tsv)
ok "Identity resource ID : ${MI_RESOURCE_ID}"

# ── ❼  Grant AcrPull to the managed identity BEFORE creating the container app ─
# The container app needs this role in place at pull time. Role assignments can
# take up to 60 s to propagate through Azure AD.
log "Assigning AcrPull role to managed identity"
ACR_RESOURCE_ID="/subscriptions/${SUBSCRIPTION}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.ContainerRegistry/registries/${ACR_NAME}"
az role assignment create \
  --role       AcrPull \
  --assignee   "$MI_PRINCIPAL_ID" \
  --scope      "$ACR_RESOURCE_ID" \
  --output     none 2>/dev/null || warn "AcrPull role already assigned — skipping"
ok "AcrPull role assigned"

log "Waiting 45 s for role assignment to propagate through Azure AD..."
sleep 45

# ── ❽  Clean up the duplicate Log Analytics workspace ─────────────────────────
# The previous script run created ledens-env without specifying a workspace, so
# Azure auto-generated one. Delete it (and the environment linked to it) so we
# can recreate the environment pointing to the pre-existing workspace.
log "Checking for duplicate Log Analytics workspace: ${DUPLICATE_LOG_WORKSPACE}"
if az monitor log-analytics workspace show \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$DUPLICATE_LOG_WORKSPACE" &>/dev/null; then

  warn "Found duplicate workspace — cleaning up"

  # Delete the ACA environment that is linked to the duplicate workspace
  if az containerapp env show -n "$ACA_ENV_NAME" -g "$RESOURCE_GROUP" &>/dev/null; then
    warn "Deleting ACA environment ${ACA_ENV_NAME} (it will be recreated)"
    az containerapp env delete \
      --name           "$ACA_ENV_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --yes
    ok "ACA environment deleted"
  fi

  az monitor log-analytics workspace delete \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$DUPLICATE_LOG_WORKSPACE" \
    --yes --force 2>/dev/null || \
  az monitor log-analytics workspace delete \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$DUPLICATE_LOG_WORKSPACE" \
    --yes
  ok "Duplicate workspace deleted"
else
  ok "No duplicate workspace found — skipping cleanup"
fi

# ── ❾  Find the pre-existing Log Analytics workspace ──────────────────────────
log "Finding existing Log Analytics workspace"
EXISTING_WORKSPACE=$(az monitor log-analytics workspace list \
  --resource-group "$RESOURCE_GROUP" \
  --query          "[?name!='${DUPLICATE_LOG_WORKSPACE}'].name | [0]" \
  --output tsv)

if [ -z "$EXISTING_WORKSPACE" ]; then
  warn "No pre-existing workspace found — ACA environment will auto-create one"
  LOG_WS_ARGS=()
else
  LOG_WS_ID=$(az monitor log-analytics workspace show \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$EXISTING_WORKSPACE" \
    --query          "customerId" --output tsv)
  LOG_WS_KEY=$(az monitor log-analytics workspace get-shared-keys \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$EXISTING_WORKSPACE" \
    --query          "primarySharedKey" --output tsv)
  LOG_WS_ARGS=("--logs-workspace-id" "$LOG_WS_ID" "--logs-workspace-key" "$LOG_WS_KEY")
  ok "Using workspace: ${EXISTING_WORKSPACE} (${LOG_WS_ID})"
fi

# ── ❿  Create (or verify) the Container Apps Environment ──────────────────────
log "Provisioning Container Apps Environment: ${ACA_ENV_NAME}"
if az containerapp env show -n "$ACA_ENV_NAME" -g "$RESOURCE_GROUP" &>/dev/null; then
  ok "Environment already exists — skipping"
else
  az containerapp env create \
    --name           "$ACA_ENV_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location       "$LOCATION" \
    "${LOG_WS_ARGS[@]+"${LOG_WS_ARGS[@]}"}"
  ok "Environment created"
fi

# ── ⓫  Create Azure Files share & link to the environment ─────────────────────
log "Verifying storage: ${STORAGE_ACCOUNT}"
STORAGE_KEY=$(az storage account keys list \
  --resource-group  "$RESOURCE_GROUP" \
  --account-name    "$STORAGE_ACCOUNT" \
  --query           "[0].value" --output tsv)

az storage share create \
  --name          "ledens-data" \
  --account-name  "$STORAGE_ACCOUNT" \
  --account-key   "$STORAGE_KEY" \
  --quota         1 2>/dev/null || warn "File share already exists — skipping"

az containerapp env storage set \
  --name                   "$ACA_ENV_NAME" \
  --resource-group         "$RESOURCE_GROUP" \
  --storage-name           "ledens-data" \
  --account-name           "$STORAGE_ACCOUNT" \
  --azure-file-account-key "$STORAGE_KEY" \
  --azure-file-share-name  "ledens-data" \
  --access-mode            ReadWrite
ok "Storage linked to ACA environment"

# ── ⓬  Retrieve SWA origin (used for CORS) ────────────────────────────────────
log "Looking up SWA hostname: ${SWA_NAME}"
SWA_HOST=$(az staticwebapp show \
  --name           "$SWA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "defaultHostname" --output tsv)
SWA_ORIGIN="https://${SWA_HOST}"
ok "SWA origin: ${SWA_ORIGIN}"

# ── ⓭  Create the Container App ───────────────────────────────────────────────
# --registry-identity tells ACA to use the managed identity to pull from ACR.
# --user-assigned attaches the identity to the container app at creation time.
# Both must be set together so the pull works on the very first revision.
log "Creating Container App: ${ACA_NAME}"
if az containerapp show -n "$ACA_NAME" -g "$RESOURCE_GROUP" &>/dev/null; then
  warn "Container App already exists — updating image"
  az containerapp update \
    --name           "$ACA_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image          "$IMAGE"
  ok "Image updated"
else
  az containerapp create \
    --name              "$ACA_NAME" \
    --resource-group    "$RESOURCE_GROUP" \
    --environment       "$ACA_ENV_NAME" \
    --image             "$IMAGE" \
    --registry-server   "$REGISTRY" \
    --registry-identity "$MI_RESOURCE_ID" \
    --user-assigned     "$MI_RESOURCE_ID" \
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

# ── ⓮  Mount the Azure Files volume at /data ──────────────────────────────────
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
  ok "Volume already mounted — skipping"
fi

# ── ⓯  Link Container App as SWA backend (/api/* → Container App) ─────────────
log "Linking Container App as SWA backend"
az extension add --name staticwebapp --upgrade --yes 2>/dev/null

ACA_RESOURCE_ID=$(az containerapp show \
  --name           "$ACA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "id" --output tsv)

if az staticwebapp backends show \
    --name           "$SWA_NAME" \
    --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  ok "Backend already linked — skipping"
else
  az staticwebapp backends link \
    --name                "$SWA_NAME" \
    --resource-group      "$RESOURCE_GROUP" \
    --backend-resource-id "$ACA_RESOURCE_ID" \
    --backend-region      "$LOCATION"
  ok "SWA now forwards /api/* → Container App"
fi

# ── ⓰  Print Container App FQDN ───────────────────────────────────────────────
ACA_FQDN=$(az containerapp show \
  --name           "$ACA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query          "properties.configuration.ingress.fqdn" --output tsv)

# ── ⓱  Create GitHub Actions service principal ────────────────────────────────
log "Creating service principal for GitHub Actions: ${GITHUB_SP_NAME}"
SP_JSON=$(az ad sp create-for-rbac \
  --name   "$GITHUB_SP_NAME" \
  --role   Contributor \
  --scopes "/subscriptions/${SUBSCRIPTION}/resourceGroups/${RESOURCE_GROUP}" \
  --sdk-auth \
  --output json 2>/dev/null || echo "")

# ── ⓲  Summary ────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  PROVISIONING COMPLETE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  Backend FQDN : https://${ACA_FQDN}"
echo "  SWA origin   : ${SWA_ORIGIN}"
echo "  /api/* proxy : SWA → Container App (linked backend)"
echo ""
echo "  ── Resources used ──────────────────────────────────────────"
echo "  ACR              : ${ACR_NAME}  (${REGISTRY})"
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
  echo "  Service principal already exists or creation failed. Run manually:"
  echo "    az ad sp create-for-rbac --name ${GITHUB_SP_NAME} \\"
  echo "      --role Contributor \\"
  echo "      --scopes /subscriptions/${SUBSCRIPTION}/resourceGroups/${RESOURCE_GROUP} \\"
  echo "      --sdk-auth"
  echo ""
fi
echo "  2. Verify the health endpoint:"
echo "     curl https://${ACA_FQDN}/api/health"
echo ""
echo "  3. Push a change to ledens/backend/** to trigger the first CI run."
echo ""
echo "════════════════════════════════════════════════════════════════"
