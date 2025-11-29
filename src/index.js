import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import connectDB from './config/db.js';
import paymentRoutes from './routes/paymentRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Cargar variables de entorno
dotenv.config();

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 service:
 *                   type: string
 *                   example: payment-service
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

// Documentación de la API
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

// Rutas de la API
app.use('/api/payments', paymentRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar el servidor
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servicio de pagos corriendo en ${PORT}`);
      console.log(`Documentación de la API disponible en ${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
