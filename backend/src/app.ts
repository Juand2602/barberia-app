// backend/src/app.ts

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import clientesRoutes from './routes/clientes.routes';
import serviciosRoutes from './routes/servicios.routes';
import empleadosRoutes from './routes/empleados.routes';
import citasRoutes from './routes/citas.routes';
import transaccionesRoutes from './routes/transacciones.routes';
import cierrecajaRoutes from './routes/cierrecaja.routes';      // ✅ Ya existe
import reportesRoutes from './routes/reportes.routes';     
import webhookRoutes from './routes/webhook.routes'; // 🆕 WhatsApp webhook

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ==================== MIDDLEWARE ====================

// CORS - Permitir acceso desde Electron
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== HEALTH CHECK ====================

app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Barbería API - Sistema de gestión con WhatsApp Bot',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ==================== RUTAS API ====================

app.use('/api/clientes', clientesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/cierrecaja', cierrecajaRoutes);  
app.use('/webhook', webhookRoutes); // 🆕 Webhook de WhatsApp (sin /api)

// ==================== ERROR HANDLING ====================

// 404 - Ruta no encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Manejador de errores global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════╗
  ║                                                        ║
  ║   🚀 Barbería API Server                              ║
  ║                                                        ║
  ║   🌐 Puerto: ${PORT}                                  ║
  ║   📦 Entorno: ${process.env.NODE_ENV || 'development'}║
  ║   🤖 WhatsApp Bot: ACTIVO                             ║
  ║   ⏰ Iniciado: ${new Date().toLocaleString()}          ║
  ║                                                        ║
  ╚════════════════════════════════════════════════════════╝
  `);
});

export default app;