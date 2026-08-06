#!/bin/sh
set -e

# Fix permissions so nextjs user can write to the uploads volume if you plan to use one.
# Must run as root before su-exec drops privileges.
echo "Setting permissions for /app/uploads (if used)..."
mkdir -p /app/uploads
chown -R nextjs:nodejs /app/uploads

echo "Running prisma migrations..."
su-exec nextjs npx prisma migrate deploy

# Uncomment the below lines if you want to automatically seed your database
# on container startup.
# echo "Running database seed..."
# su-exec nextjs npx prisma db seed

echo "Starting server..."
if [ $# -gt 0 ]; then
  exec su-exec nextjs "$@"
else
  exec su-exec nextjs npm run start
fi
