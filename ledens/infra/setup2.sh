#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# ledens/infra/setup2.sh
# Targeted recovery script — fixes the partially-provisioned ACA environment.
#
# Assumes:
#   • The ACR image (ledens-backend:latest) is already built and pushed.
#   • The AcrPull role is already assigned to id-ledens-api-acr-pull.
#   • Log Analytics workspace-rgledensmvpxLsR already exists.
#
# Run from Azure Cloud Shell (no local repo clone needed):
#   bash <(curl -fsSL https://raw.githubusercontent.com/AlvaroNS/Ledens-Frontend/main/ledens/infra/setup2.sh)
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── CONFIG ────────────────────────────────────────────────────────────────────
SUBSCRIPTION="550f2d00-7d8d-4699-8b84-6eccff979f88"
RESOURCE_GROUP="rg-ledens-mvp"
LOCATION="westeurope"

ACA_ENV_NAME="ledens-env"
ACA_NAME="ledens-backend"
STORAGE_ACCOUNT="stledensmvp1"
SWA_NAME="webapp-ledens-landing-1"
MANAGED_IDENTITY="id-ledens-api-acr-pull"
LOG_WORKSPACE_NAME="workspace-rgledensmvpxLsR"   # the one that must be kept

IMAGE_NAME="ledens-backend"
IMAGE_TAG="latest"
# ─────────────────────────────────────────────────────────────────────────────

log()  { echo -e "\n\033[1;34m▶  $*\033[0m"; }
ok()   { echo -e "\033[1;32m✔  $*\033[0m"; }
warn() { echo -e "\033[1;33m⚠  $*\033[0m"; }

# ── ❶  Subscription & extensions ─────────────────────────────────────────────
log "Setting subscription"
az account set --subscription "$SUBSCRIPTION"
az extension add --name containerapp --upgrade --yes 2>/dev/null
ok "Ready"

# ── ❷  Detect ACR (name + login-server URL) ───────────────────────────────────
log "Detecting ACR in ${RESOURCE_GROUP}"
ACR_NAME=$(az acr list -g "$RESOURCE_GROUP" --query "[0].name"        -o tsv)
REGISTRY=$(az acr list -g "$RESOURCE_GROUP" --query "[0].loginServer" -o tsv)
IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
ok "ACR  : ${ACR_NAME}"
ok "URL  : ${REGISTRY}"
ok "Image: ${IMAGE}"

# ── ❸  Read managed identity ──────────────────────────────────────────────────
log "Reading managed identity: ${MANAGED_IDENTITY}"
MI_RESOURCE_ID=$(az identity show -n "$MANAGED_IDENTITY" -g "$RESOURCE_GROUP" \
  --query "id"          -o tsv)
MI_PRINCIPAL_ID=$(az identity show -n "$MANAGED_IDENTITY" -g "$RESOURCE_GROUP" \
  --query "principalId" -o tsv)
ok "MI resource ID: ${MI_RESOURCE_ID}"

# ── ❹  Delete the failed ACA environment ──────────────────────────────────────
log "Deleting failed ACA environment: ${ACA_ENV_NAME}"
if az containerapp env show -n "$ACA_ENV_NAME" -g "$RESOURCE_GROUP" &>/dev/null; then
  # Delete any container apps inside it first (otherwise env delete blocks)
  APPS=$(az containerapp list -g "$RESOURCE_GROUP" \
    --query "[?properties.managedEnvironmentId contains '${ACA_ENV_NAME}'].name" \
    -o tsv 2>/dev/null || true)
  for app in $APPS; do
    warn "Deleting container app ${app} before environment removal"
    az containerapp delete -n "$app" -g "$RESOURCE_GROUP" --yes
  done
  az containerapp env delete -n "$ACA_ENV_NAME" -g "$RESOURCE_GROUP" --yes
  ok "Environment deleted"
else
  warn "Environment not found — nothing to delete"
fi

# ── ❺  Get Log Analytics workspace credentials ────────────────────────────────
log "Reading Log Analytics workspace: ${LOG_WORKSPACE_NAME}"
LOG_WS_ID=$(az monitor log-analytics workspace show \
  -g "$RESOURCE_GROUP" --workspace-name "$LOG_WORKSPACE_NAME" \
  --query "customerId" -o tsv)
LOG_WS_KEY=$(az monitor log-analytics workspace get-shared-keys \
  -g "$RESOURCE_GROUP" --workspace-name "$LOG_WORKSPACE_NAME" \
  --query "primarySharedKey" -o tsv)
ok "Workspace customer ID: ${LOG_WS_ID}"

# ── ❻  Recreate ACA environment linked to the correct workspace ───────────────
log "Creating ACA environment: ${ACA_ENV_NAME}"
az containerapp env create \
  --name           "$ACA_ENV_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location       "$LOCATION" \
  --logs-workspace-id  "$LOG_WS_ID" \
  --logs-workspace-key "$LOG_WS_KEY"
ok "Environment created and linked to ${LOG_WORKSPACE_NAME}"

# ── ❼  Link Azure Files storage to the environment ────────────────────────────
log "Linking storage account: ${STORAGE_ACCOUNT}"
STORAGE_KEY=$(az storage account keys list \
  -g "$RESOURCE_GROUP" -n "$STORAGE_ACCOUNT" \
  --query "[0].value" -o tsv)

az storage share create \
  --name         "ledens-data" \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key  "$STORAGE_KEY" \
  --quota 1 2>/dev/null || warn "File share already exists — skipping"

az containerapp env storage set \
  --name                   "$ACA_ENV_NAME" \
  --resource-group         "$RESOURCE_GROUP" \
  --storage-name           "ledens-data" \
  --account-name           "$STORAGE_ACCOUNT" \
  --azure-file-account-key "$STORAGE_KEY" \
  --azure-file-share-name  "ledens-data" \
  --access-mode            ReadWrite
ok "Storage linked"

# ── ❽  Get SWA origin for CORS env var ────────────────────────────────────────
log "Getting SWA hostname"
SWA_HOST=$(az staticwebapp show -n "$SWA_NAME" -g "$RESOURCE_GROUP" \
  --query "defaultHostname" -o tsv)
SWA_ORIGIN="https://${SWA_HOST}"
ok "SWA origin: ${SWA_ORIGIN}"

# ── ❾  Create Container App ───────────────────────────────────────────────────
# --registry-identity + --user-assigned: ACA uses the managed identity to
# pull from ACR — no passwords, no admin credentials needed.
log "Creating Container App: ${ACA_NAME}"
if az containerapp show -n "$ACA_NAME" -g "$RESOURCE_GROUP" &>/dev/null; then
  warn "Already exists — updating image only"
  az containerapp update -n "$ACA_NAME" -g "$RESOURCE_GROUP" --image "$IMAGE"
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

# ── ❿  Mount Azure Files at /data (YAML patch) ────────────────────────────────
log "Mounting /data volume"
ACA_YAML=$(az containerapp show -n "$ACA_NAME" -g "$RESOURCE_GROUP" --output yaml)

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
  az containerapp update -n "$ACA_NAME" -g "$RESOURCE_GROUP" --yaml "$PATCH"
  rm -f "$PATCH"
  ok "Volume mounted at /data"
else
  ok "Volume already mounted — skipping"
fi

# ── ⓫  Link Container App as SWA backend ─────────────────────────────────────
log "Linking SWA backend"
az extension add --name staticwebapp --upgrade --yes 2>/dev/null

ACA_RESOURCE_ID=$(az containerapp show -n "$ACA_NAME" -g "$RESOURCE_GROUP" \
  --query "id" -o tsv)

if az staticwebapp backends show -n "$SWA_NAME" -g "$RESOURCE_GROUP" &>/dev/null; then
  ok "Backend already linked — skipping"
else
  az staticwebapp backends link \
    --name                "$SWA_NAME" \
    --resource-group      "$RESOURCE_GROUP" \
    --backend-resource-id "$ACA_RESOURCE_ID" \
    --backend-region      "$LOCATION"
  ok "SWA now forwards /api/* → Container App"
fi

# ── ⓬  Summary ────────────────────────────────────────────────────────────────
ACA_FQDN=$(az containerapp show -n "$ACA_NAME" -g "$RESOURCE_GROUP" \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  DONE"
echo ""
echo "  Container App : https://${ACA_FQDN}"
echo "  Log workspace : ${LOG_WORKSPACE_NAME}"
echo "  SWA origin    : ${SWA_ORIGIN}"
echo ""
echo "  Verify: curl https://${ACA_FQDN}/api/health"
echo "════════════════════════════════════════════════════════════════"
