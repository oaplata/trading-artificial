#!/bin/bash

echo "🚀 Abriendo pgAdmin en el navegador..."
echo "📊 URL: http://localhost:8080"
echo "👤 Email: admin@trading-artificial.com"
echo "🔑 Password: admin123"
echo ""
echo "📋 Configuración de conexión automática:"
echo "   - Host: ta-db (ya configurado)"
echo "   - Puerto: 5432"
echo "   - Base de datos: trenddb"
echo "   - Usuario: postgres"
echo "   - Password: postgres"
echo ""

# Abrir en el navegador predeterminado
if command -v open &> /dev/null; then
    open "http://localhost:8080"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8080"
else
    echo "🌐 Abre manualmente: http://localhost:8080"
fi
