#!/bin/bash
#
# sync-to-supabase.sh
# ====================
# Syncs local PostgreSQL data to Supabase for AISSA Track Record
#
# USAGE:
#   ./scripts/sync-to-supabase.sh [--dry-run] [--schema-only] [--data-only]
#
# PREREQUISITES:
#   1. PostgreSQL client tools installed (pg_dump, psql)
#   2. Local database running and seeded
#   3. .env.production file with SUPABASE_DATABASE_URL
#
# POPI COMPLIANCE:
#   - Uses direct pipe transfer (no intermediate files with PII)
#   - SSL enforced on Supabase connection
#   - Logs operations without exposing data
#

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${APP_DIR}/.env"
ENV_PROD_FILE="${APP_DIR}/.env.production"
LOG_DIR="${SCRIPT_DIR}/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/sync-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default flags
DRY_RUN=false
SCHEMA_ONLY=false
DATA_ONLY=false

# =============================================================================
# Helper Functions
# =============================================================================

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local msg="[$timestamp] $1"
    
    # Print to terminal (with colors)
    echo -e "$msg"
    
    # Print to log file (strip ANSI color codes)
    echo -e "$msg" | sed $'s/\e\\[[0-9;]*[a-zA-Z]//g' >> "$LOG_FILE"
}

log_info() {
    log "${BLUE}INFO${NC}: $1"
}

log_success() {
    log "${GREEN}SUCCESS${NC}: $1"
}

log_warn() {
    log "${YELLOW}WARNING${NC}: $1"
}

log_error() {
    log "${RED}ERROR${NC}: $1"
}

die() {
    log_error "$1"
    exit 1
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        die "Required command '$1' not found. Please install PostgreSQL client tools."
    fi
}

# =============================================================================
# Parse Arguments
# =============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --schema-only)
            SCHEMA_ONLY=true
            shift
            ;;
        --data-only)
            DATA_ONLY=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run      Show what would be done without making changes"
            echo "  --schema-only  Only sync schema (run Payload migrations)"
            echo "  --data-only    Only sync data (assumes schema already exists)"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            die "Unknown option: $1"
            ;;
    esac
done

# =============================================================================
# Load Environment
# =============================================================================

log_info "Starting sync to Supabase..."
log_info "Log file: $LOG_FILE"

# Load local database URL from .env
if [[ -f "$ENV_FILE" ]]; then
    # shellcheck source=/dev/null
    set -a
    source "$ENV_FILE"
    set +a
    log_info "Loaded local environment from .env"
else
    die ".env file not found at $ENV_FILE"
fi

LOCAL_DATABASE_URL="${DATABASE_URL:-}"
if [[ -z "$LOCAL_DATABASE_URL" ]]; then
    die "DATABASE_URL not set in .env"
fi

# Load production/Supabase database URL
if [[ -f "$ENV_PROD_FILE" ]]; then
    # Read only the SUPABASE_DATABASE_URL from production env
    SUPABASE_DATABASE_URL=$(grep -E '^SUPABASE_DATABASE_URL=' "$ENV_PROD_FILE" | cut -d'=' -f2-)
elif [[ -n "${SUPABASE_DATABASE_URL:-}" ]]; then
    log_info "Using SUPABASE_DATABASE_URL from environment"
else
    die "No .env.production file found and SUPABASE_DATABASE_URL not set in environment"
fi

if [[ -z "${SUPABASE_DATABASE_URL:-}" ]]; then
    die "SUPABASE_DATABASE_URL not found. Create .env.production with SUPABASE_DATABASE_URL=<your-supabase-connection-string>"
fi

# Mask the URLs for logging (hide passwords)
mask_url() {
    echo "$1" | sed -E 's/:([^:@]+)@/:****@/g'
}

log_info "Local DB: $(mask_url "$LOCAL_DATABASE_URL")"
log_info "Target DB: $(mask_url "$SUPABASE_DATABASE_URL")"

# =============================================================================
# Pre-flight Checks
# =============================================================================

log_info "Running pre-flight checks..."

check_command pg_dump
check_command psql

# Test local database connection
log_info "Testing local database connection..."
if ! psql "$LOCAL_DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
    die "Cannot connect to local database. Is it running?"
fi
log_success "Local database connection OK"

# Test Supabase database connection
log_info "Testing Supabase database connection..."
if ! psql "$SUPABASE_DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
    die "Cannot connect to Supabase database. Check your connection string."
fi
log_success "Supabase database connection OK"

# =============================================================================
# Dry Run Summary
# =============================================================================

if [[ "$DRY_RUN" == true ]]; then
    echo ""
    log_warn "=== DRY RUN MODE ==="
    echo ""
    log_info "Would perform the following actions:"
    
    if [[ "$DATA_ONLY" != true ]]; then
        echo "  1. Run Payload migrations on Supabase database"
    fi
    
    if [[ "$SCHEMA_ONLY" != true ]]; then
        echo "  2. Export data from local database (via pg_dump)"
        echo "  3. Import data to Supabase (via psql, direct pipe)"
    fi
    
    echo ""
    log_info "Tables that would be synced:"
    psql "$LOCAL_DATABASE_URL" -t -c "
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        ORDER BY tablename;
    " 2>/dev/null | grep -v "^$" | while read -r table; do
        count=$(psql "$LOCAL_DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')
        echo "    - $table ($count rows)"
    done
    
    echo ""
    log_info "Run without --dry-run to execute."
    exit 0
fi

# =============================================================================
# Confirmation
# =============================================================================

echo ""
log_warn "=== IMPORTANT ==="
echo ""
echo "This script will:"
if [[ "$DATA_ONLY" != true ]]; then
    echo "  1. Run Payload migrations on the Supabase database"
fi
if [[ "$SCHEMA_ONLY" != true ]]; then
    echo "  2. TRUNCATE existing data in Supabase (if any)"
    echo "  3. Copy all data from local database to Supabase"
fi
echo ""
echo "Target database: $(mask_url "$SUPABASE_DATABASE_URL")"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
    log_info "Aborted by user"
    exit 0
fi

# =============================================================================
# Step 1: Run Migrations (unless --data-only)
# =============================================================================

if [[ "$DATA_ONLY" != true ]]; then
    log_info "Step 1: Running Payload migrations on Supabase..."
    
    # Temporarily set DATABASE_URL to Supabase for migration
    DATABASE_URL="$SUPABASE_DATABASE_URL" pnpm --dir "$APP_DIR" payload migrate
    
    log_success "Migrations complete"
else
    log_info "Skipping migrations (--data-only mode)"
fi

# =============================================================================
# Step 2: Sync Data (unless --schema-only)
# =============================================================================

if [[ "$SCHEMA_ONLY" != true ]]; then
    log_info "Step 2: Syncing data from local to Supabase..."
    
    # Get list of tables to sync
    TABLES=$(psql "$LOCAL_DATABASE_URL" -t -c "
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_payload_%'
        ORDER BY tablename;
    " 2>/dev/null | tr -d ' ' | grep -v "^$")
    
    # Count tables
    TABLE_COUNT=$(echo "$TABLES" | wc -l | tr -d ' ')
    log_info "Found $TABLE_COUNT tables to sync"
    
    # Direct pipe transfer: pg_dump | psql
    # This ensures data never touches disk (POPI compliant)
    log_info "Transferring data (direct pipe, no intermediate files)..."
    
    # Export data only, disable triggers during import
    # Redirect stdout to log file to avoid terminal noise
    set +e
    pg_dump "$LOCAL_DATABASE_URL" \
        --data-only \
        --no-owner \
        --no-privileges \
        --disable-triggers \
        --format=plain \
        2>> "$LOG_FILE" | \
    psql "$SUPABASE_DATABASE_URL" \
        --quiet \
        >> "$LOG_FILE" 2>&1
    
    # Capture exit statuses immediately
    PIPE_EXIT=(${PIPESTATUS[@]})
    set -e
    
    if [[ ${PIPE_EXIT[0]} -ne 0 ]] || [[ ${PIPE_EXIT[1]} -ne 0 ]]; then
        die "Data transfer failed. Check $LOG_FILE for details."
    fi
    
    log_success "Data transfer complete"
    
    # Verify counts
    log_info "Verifying row counts..."
    echo ""
    printf "%-40s %10s %10s %s\n" "TABLE" "LOCAL" "REMOTE" "STATUS"
    printf "%-40s %10s %10s %s\n" "-----" "-----" "------" "------"
    
    for table in $TABLES; do
        local_count=$(psql "$LOCAL_DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')
        remote_count=$(psql "$SUPABASE_DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')
        
        if [[ "$local_count" == "$remote_count" ]]; then
            status="${GREEN}✓${NC}"
        else
            status="${RED}✗${NC}"
        fi
        
        printf "%-40s %10s %10s %b\n" "$table" "$local_count" "$remote_count" "$status"
    done
    
    echo ""
else
    log_info "Skipping data sync (--schema-only mode)"
fi

# =============================================================================
# Complete
# =============================================================================

echo ""
log_success "=== Sync Complete ==="
log_info "Log saved to: $LOG_FILE"
echo ""
echo "Next steps:"
echo "  1. Verify data in Supabase dashboard"
echo "  2. Test the application with the Supabase connection"
echo "  3. Update production environment variables"
echo ""
