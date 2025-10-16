# Barbería App

Sistema de gestión para barberías con integración de WhatsApp.

## Estructura del Proyecto

- `backend/`: API REST con Express y Prisma, desplegable en Railway
- `frontend/`: Aplicación de escritorio con Electron y React
- `docs/`: Documentación del proyecto

## Configuración Inicial

1. Clonar el repositorio
2. Ejecutar `npm run setup` para instalar dependencias y generar Prisma Client
3. Configurar variables de entorno en `backend/.env` y `frontend/.env`
4. Ejecutar migraciones de Prisma: `cd backend && npm run prisma:migrate`

## Desarrollo

- Iniciar ambos proyectos: `npm run dev`
- Iniciar solo backend: `npm run dev:backend`
- Iniciar solo frontend: `npm run dev:frontend`
- Iniciar Electron: `npm run electron:dev`

## Deployment

- Backend: Ver [docs/RAILWAY_SETUP.md](docs/RAILWAY_SETUP.md)
- WhatsApp: Ver [docs/WHATSAPP_SETUP.md](docs/WHATSAPP_SETUP.md)
- General: Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
