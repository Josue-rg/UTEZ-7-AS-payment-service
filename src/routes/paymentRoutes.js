import express from 'express';
import { 
  createPayment, 
  getPaymentById, 
  getPaymentsByUser, 
  createBatchPayments
} from '../controllers/paymentController.js';

const router = express.Router();

// Middleware para registrar las peticiones
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Ruta para crear un nuevo pago
router.post('/', createPayment);

// Ruta para obtener un pago por su ID
router.get('/:id', getPaymentById);

// Ruta para obtener todos los pagos de un usuario
router.get('/user/:userId', getPaymentsByUser);

router.post('/batch', createBatchPayments);

export default router;