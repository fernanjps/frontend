# 🎮 GameReviews Platform

Una plataforma completa de reseñas de videojuegos construida con arquitectura en capas usando **Next.js**, **Laravel** y **PostgreSQL**, optimizada para producción con **Docker**, **Redis**, **Nginx** y **SSL**.

## 🏗️ Arquitectura del Sistema

### Frontend (Next.js 14)
- **Puerto**: 3000 (desarrollo) / 80,443 (producción)
- **Responsabilidades**: UI/UX, autenticación cliente, gestión de estado
- **Tecnologías**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Optimizaciones**: Code splitting, lazy loading, image optimization

### Backend (Laravel 10 API)
- **Puerto**: 8000 (desarrollo) / interno (producción)
- **Responsabilidades**: API REST, autenticación JWT, lógica de negocio
- **Tecnologías**: PHP 8.2, Laravel 10, JWT Auth, PostgreSQL
- **Optimizaciones**: OPcache, Redis cache, queue workers

### Base de Datos (PostgreSQL 15)
- **Puerto**: 5432
- **Responsabilidades**: Almacenamiento persistente, relaciones, triggers
- **Optimizaciones**: Índices, vistas materializadas, funciones PL/pgSQL

### Infraestructura
- **Nginx**: Reverse proxy, SSL termination, load balancing
- **Redis**: Cache, sessions, queue backend
- **Docker**: Containerización y orquestación
- **SSL/TLS**: Certificados Let's Encrypt o auto-firmados

## 🚀 Características Principales

### ✅ Sistema de Usuarios
- **Registro y Login** con validaciones robustas
- **Roles**: `admin` (CRUD juegos) y `user` (CRUD reseñas propias)
- **Perfil de Usuario**: Editar nombre, email, contraseña
- **Autenticación JWT** con refresh tokens

### ✅ Gestión de Juegos
- **Catálogo Completo** con filtros y búsqueda
- **Estados**: Gratis, en oferta, destacados
- **Integración Externa**: Redirección a Steam/Epic Games
- **Panel Admin**: CRUD completo para administradores

### ✅ Sistema de Reseñas
- **Calificación 1-5 estrellas** con comentarios
- **CRUD Personal**: Usuarios pueden editar/eliminar sus reseñas
- **Validaciones**: Una reseña por usuario por juego
- **Estadísticas**: Rating promedio automático

### ✅ Optimizaciones de Rendimiento
- **Redis Cache**: Juegos destacados, estadísticas, sesiones
- **Queue System**: Emails de bienvenida, actualización de stats
- **Database Optimization**: Índices, triggers, funciones
- **Frontend Optimization**: Code splitting, image optimization

### ✅ Seguridad
- **Rate Limiting**: API y login endpoints
- **CORS Configuration**: Configuración segura
- **SQL Injection Protection**: Eloquent ORM
- **XSS Protection**: Headers de seguridad
- **HTTPS**: SSL/TLS en producción

## 🛠️ Instalación y Configuración

### Prerrequisitos
\`\`\`bash
# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
\`\`\`

### Instalación Rápida (Desarrollo)
\`\`\`bash
# Clonar repositorio
git clone <repository-url>
cd gamereviews-platform

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Levantar servicios
docker-compose up --build

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Panel: http://localhost:3000/admin
\`\`\`

### Despliegue en Producción
\`\`\`bash
# Configurar variables de producción
cp .env.production.example .env.production
# Editar .env.production con configuraciones seguras

# Ejecutar script de despliegue
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# O manualmente
docker-compose -f docker-compose.production.yml up --build -d
\`\`\`

## 📊 Estructura de la Base de Datos

### Tabla `users`
\`\`\`sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255) NOT NULL)
- email (VARCHAR(255) UNIQUE NOT NULL)
- password (VARCHAR(255) NOT NULL)
- role (ENUM: 'admin', 'user' DEFAULT 'user')
- created_at, updated_at (TIMESTAMP)
\`\`\`

### Tabla `games`
\`\`\`sql
- id (SERIAL PRIMARY KEY)
- title (VARCHAR(255) NOT NULL)
- description (TEXT)
- price (DECIMAL(8,2) DEFAULT 0.00)
- discount_price (DECIMAL(8,2) NULL)
- image_url (VARCHAR(500))
- steam_url, epic_url (VARCHAR(500))
- rating (DECIMAL(3,2) DEFAULT 0.00)
- is_free, is_on_sale, is_featured (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
\`\`\`

### Tabla `reviews`
\`\`\`sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER REFERENCES users(id))
- game_id (INTEGER REFERENCES games(id))
- rating (INTEGER CHECK rating >= 1 AND rating <= 5)
- comment (TEXT)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(user_id, game_id)
\`\`\`

## 🔌 API Endpoints

### Autenticación
\`\`\`
POST   /api/auth/register     - Registro de usuario
POST   /api/auth/login        - Inicio de sesión
POST   /api/auth/logout       - Cerrar sesión
GET    /api/auth/me           - Usuario actual
PUT    /api/auth/update-profile - Actualizar perfil
\`\`\`

### Juegos (Públicos)
\`\`\`
GET    /api/games             - Listar juegos
GET    /api/games/featured    - Juegos destacados
GET    /api/games/free        - Juegos gratuitos
GET    /api/games/on-sale     - Juegos en oferta
GET    /api/games/{id}        - Detalles de juego
\`\`\`

### Reseñas
\`\`\`
GET    /api/reviews           - Listar reseñas (paginado)
GET    /api/reviews/recent    - Reseñas recientes
POST   /api/reviews           - Crear reseña (auth)
PUT    /api/reviews/{id}      - Actualizar reseña (auth)
DELETE /api/reviews/{id}      - Eliminar reseña (auth)
GET    /api/user/reviews      - Reseñas del usuario (auth)
\`\`\`

### Administración (Solo Admin)
\`\`\`
GET    /api/admin/stats       - Estadísticas del sistema
GET    /api/admin/games       - Gestión de juegos
POST   /api/admin/games       - Crear juego
PUT    /api/admin/games/{id}  - Actualizar juego
DELETE /api/admin/games/{id}  - Eliminar juego
\`\`\`

## 🔧 Comandos Útiles

### Docker
\`\`\`bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar un servicio específico
docker-compose restart backend

# Ejecutar comandos en contenedores
docker-compose exec backend php artisan migrate
docker-compose exec database psql -U gamereviews -d games

# Limpiar todo y empezar de nuevo
docker-compose down -v
docker system prune -a
\`\`\`

### Laravel (Backend)
\`\`\`bash
# Migraciones y seeders
php artisan migrate:fresh --seed

# Limpiar caché
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Workers de cola
php artisan queue:work

# Comandos personalizados
php artisan cache:clear-games --all
\`\`\`

### Next.js (Frontend)
\`\`\`bash
# Desarrollo
npm run dev

# Build de producción
npm run build
npm start

# Análisis de bundle
npm run build:analyze

# Tests
npm test
npm run test:coverage
\`\`\`

## 🌐 Configuración de Producción

### Nginx + SSL
\`\`\`bash
# Instalar Certbot para Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtener certificados SSL
sudo certbot --nginx -d gamereviews.com -d www.gamereviews.com -d api.gamereviews.com

# Renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
\`\`\`

### Monitoreo y Logs
\`\`\`bash
# Ver logs de Nginx
tail -f nginx/logs/access.log
tail -f nginx/logs/error.log

# Monitorear recursos
docker stats

# Backup de base de datos
docker-compose exec database pg_dump -U gamereviews games > backup.sql
\`\`\`

### Variables de Entorno Críticas
\`\`\`env
# Cambiar en producción
APP_KEY=base64:tu-clave-secreta-de-32-caracteres
JWT_SECRET=tu-jwt-secret-super-seguro
DB_PASSWORD=tu-password-de-base-de-datos-seguro

# URLs de producción
APP_URL=https://gamereviews.com
NEXT_PUBLIC_API_URL=https://api.gamereviews.com
\`\`\`

## 🚀 Opciones de Despliegue

### Opción 1: VPS con Docker
- **Proveedores**: DigitalOcean, Linode, Vultr
- **Configuración**: Nginx + Let's Encrypt + Docker Compose
- **Costo**: $10-20/mes

### Opción 2: Servicios Cloud
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Fly.io
- **Base de datos**: Supabase, PlanetScale, Neon
- **Costo**: $0-30/mes (según uso)

### Opción 3: Kubernetes
- **Proveedores**: GKE, EKS, AKS
- **Escalabilidad**: Auto-scaling horizontal
- **Costo**: $50+/mes

## 🧪 Testing

\`\`\`bash
# Frontend tests
npm test
npm run test:coverage

# Backend tests
php artisan test
php artisan test --coverage

# E2E tests con Cypress
npm run cypress:open
\`\`\`

## 📈 Métricas y Monitoreo

- **Performance**: Lighthouse scores 90+
- **SEO**: Meta tags optimizados
- **Accessibility**: WCAG 2.1 AA compliance
- **Security**: OWASP Top 10 protection
- **Uptime**: 99.9% target con health checks

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [Wiki del proyecto]
- **Issues**: [GitHub Issues]
- **Discord**: [Servidor de la comunidad]
- **Email**: support@gamereviews.com

---

**Desarrollado con ❤️ por el equipo de GameReviews**
