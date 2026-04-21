#!/bin/bash

# setup-cron.sh
# This script sets up a daily Linux cron job to trigger the CRM Notifications Engine.

echo "Setting up CRM Notifications Cron Job..."

# Read the CRON_SECRET from .env.local
ENV_FILE="$(dirname "$0")/.env.local"

if [ -f "$ENV_FILE" ]; then
    # Extract CRON_SECRET using grep and cut
    CRON_SECRET=$(grep -E "^CRON_SECRET=" "$ENV_FILE" | cut -d '=' -f 2)
else
    echo "Warning: .env.local not found. Using default secret."
    CRON_SECRET="super_secure_cron_key_123"
fi

if [ -z "$CRON_SECRET" ]; then
    echo "Error: CRON_SECRET is empty in .env.local"
    exit 1
fi

# Define the cron command
# It runs every day at 8:00 AM server time
# It uses curl to hit the local Next.js API endpoint with the Bearer token
CRON_CMD="0 8 * * * curl -s -X GET http://localhost:3000/api/cron/notifications -H \"Authorization: Bearer ${CRON_SECRET}\" >> /tmp/crm-cron.log 2>&1"

# Check if the job already exists
(crontab -l 2>/dev/null | grep -v "/api/cron/notifications") | crontab -

# Add the new cron job
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo "Cron job successfully installed!"
echo "It will run daily at 8:00 AM."
echo "You can view the cron logs at: /tmp/crm-cron.log"
echo "To verify the installed cron jobs, run: crontab -l"
