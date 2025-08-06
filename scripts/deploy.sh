#!/bin/bash

# Script de despliegue para GameReviews Platform
echo "🚀 Iniciando despliegue de GameReviews Platform..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que Docker y Docker Compose están instalados
command -v docker >/dev/null 2>&1 || error "Docker no está instalado"
command -v docker-compose >/dev/null 2>&1 || error "Docker Compose no está instalado"

# Verificar que el archivo .env.production existe
if [ ! -f .env.production ]; then
    error "Archivo .env.production no encontrado. Copia .env.production.example y configúralo."
fi

log "Verificando configuración..."

# Crear directorios necesarios
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p backend/storage/logs
mkdir -p backend/storage/framework/cache
mkdir -p backend/storage/framework/sessions
mkdir -p backend/storage/framework/views

log "Directorios creados"

# Generar certificados SSL auto-firmados si no existen (para desarrollo)
if [ ! -f nginx/ssl/gamereviews.crt ]; then
    warning "Generando certificados SSL auto-firmados para desarrollo..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/gamereviews.key \
        -out nginx/ssl/gamereviews.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=gamereviews.com"
    log "Certificados SSL generados"
fi

# Construir imágenes
log "Construyendo imágenes Docker..."
docker-compose -f docker-compose.production.yml build --no-cache

# Detener contenedores existentes
log "Deteniendo contenedores existentes..."
docker-compose -f docker-compose.production.yml down

# Iniciar servicios
log "Iniciando servicios..."
docker-compose -f docker-compose.production.yml up -d

# Esperar a que la base de datos esté lista
log "Esperando a que la base de datos esté lista..."
sleep 30

# Ejecutar migraciones y seeders
log "Ejecutando migraciones de base de datos..."
docker-compose -f docker-compose.production.yml exec backend php artisan migrate --force

log "Ejecutando seeders..."
docker-compose -f docker-compose.production.yml exec backend php artisan db:seed --force

# Limpiar y optimizar caché
log "Optimizando aplicación..."
docker-compose -f docker-compose.production.yml exec backend php artisan config:cache
docker-compose -f docker-compose.production.yml exec backend php artisan route:cache
docker-compose -f docker-compose.production.yml exec backend php artisan view:cache
docker-compose -f docker-compose.production.yml exec backend php artisan optimize

# Verificar que los servicios estén funcionando
log "Verificando servicios..."
sleep 10

# Verificar frontend
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    log "✅ Frontend funcionando correctamente"
else
    warning "⚠️  Frontend podría no estar funcionando correctamente"
fi

# Verificar backend
if curl -f http://localhost:8000/api/health >/dev/null 2>&1; then
    log "✅ Backend funcionando correctamente"
else
    warning "⚠️  Backend podría no estar funcionando correctamente"
fi

# Verificar base de datos
if docker-compose -f docker-compose.production.yml exec database pg_isready -U gamereviews -d games >/dev/null 2>&1; then
    log "✅ Base de datos funcionando correctamente"
else
    warning "⚠️  Base de datos podría no estar funcionando correctamente"
fi

# Mostrar logs de los servicios
log "Mostrando logs de los servicios..."
docker-compose -f docker-compose.production.yml logs --tail=50

log "🎉 Despliegue completado!"
log "Frontend: http://localhost:3000"
log "Backend API: http://localhost:8000"
log "Admin Panel: http://localhost:3000/admin"
log ""
log "Credenciales de administrador:"
log "Email: admin@gamereviews.com"
log "Password: admin123"
log ""
log "Para ver logs en tiempo real:"
log "docker-compose -f docker-compose.production.yml logs -f"
log ""
log "Para detener los servicios:"
log "docker-compose -f docker-compose.production.yml down"
