#!/bin/sh
# Este script asegura que la base de datos esté sincronizada antes de iniciar la app.
set -e # Detener el script si algún comando falla

echo "🔄 Sincronizando base de datos con Prisma..."
npx prisma db push --accept-data-loss
echo "✅ Base de datos sincronizada."

echo "🚀 Iniciando servidor..."
exec node dist/app.js