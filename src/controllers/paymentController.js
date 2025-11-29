import mongoose from 'mongoose';
import Payment from '../models/payment.js';
import { generateTransactionId } from '../utils/helpers.js';
import stripe from '../utils/stripe.js'; // Usar la instancia de Stripe configurada

// Crear un nuevo pago
export const createPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      userId, 
      eventId, 
      amount, 
      paymentMethod, 
      paymentDetails = {},
      source // Token de tarjeta de Stripe (ej: "tok_visa")
    } = req.body;
    
    // Validaciones básicas
    if (!userId || !eventId || amount == null || !paymentMethod || !source) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: userId, eventId, amount, paymentMethod, source'
      });
    }

    if (amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a cero'
      });
    }

    // Crear el pago con estado inicial 'pending'
    const payment = new Payment({
      userId,
      eventId,
      amount,
      currency: 'MXN',
      paymentMethod,
      paymentDetails: {
        ...paymentDetails,
        paymentProvider: 'stripe'
      },
      transactionId: generateTransactionId(),
      status: 'pending'
    });

    try {
      // 1. Validar el formato del token de tarjeta
      if (!source || typeof source !== 'string' || !source.startsWith('tok_')) {
        throw new Error('Token de tarjeta inválido. Debe comenzar con "tok_"');
      }

      // 2. Guardar el pago en la base de datos (estado 'pending')
      await payment.save({ session });
      
      // 3. Crear un PaymentMethod con el token de prueba
      const paymentMethodStripe = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: source
        }
      });

      // 4. Crear un PaymentIntent con el PaymentMethod
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convertir a centavos
        currency: 'mxn',
        payment_method: paymentMethodStripe.id,
        confirm: true,
        description: `Pago para evento ${eventId}`,
        metadata: {
          userId: userId.toString(),
          eventId: eventId.toString(),
          paymentId: payment._id.toString()
        },
        capture_method: 'automatic',
        confirmation_method: 'automatic',
        payment_method_types: ['card']
      });

      // 4. Verificar el estado del pago
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`El pago falló con estado: ${paymentIntent.status}`);
      }

      // 5. Actualizar el pago con la información de Stripe
      payment.status = 'completed';
      payment.paymentDetails.stripePaymentId = paymentIntent.id;
      payment.paymentDetails.stripeStatus = paymentIntent.status;
      await payment.save({ session });

      // 6. Confirmar la transacción
      await session.commitTransaction();
      session.endSession();

      // Crear respuesta con el ID del pago
      const response = {
        success: true,
        data: {
          id: payment._id,
          userId: payment.userId,
          eventId: payment.eventId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          transactionId: payment.transactionId,
          paymentDetails: {
            paymentProvider: payment.paymentDetails.paymentProvider,
            stripePaymentId: payment.paymentDetails.stripePaymentId,
            stripeStatus: payment.paymentDetails.stripeStatus
          }
        },
        message: 'Pago procesado exitosamente'
      };

      res.status(201).json(response);

    } catch (error) {
      // Revertir la transacción en caso de error
      await session.abortTransaction();
      session.endSession();
      
      console.error('❌ Error al procesar el pago:', error);
      
      // Actualizar el estado del pago a 'failed' si es posible
      if (payment) {
        payment.status = 'failed';
        payment.paymentDetails.error = error.message;
        await payment.save().catch(console.error);
      }

      res.status(500).json({
        success: false,
        message: 'Error al procesar el pago',
        error: error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pago',
      error: error.message
    });
  }
};

export const createBatchPayments = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { payments = [] } = req.body;

    if (!Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un arreglo de pagos'
      });
    }

    // Validar cada pago
    for (const [index, payment] of payments.entries()) {
      if (!payment.userId || !payment.eventId || payment.amount == null || !payment.paymentMethod) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Pago en posición ${index + 1} incompleto`
        });
      }
    }

    // Procesar pagos
    const createdPayments = [];
    for (const paymentData of payments) {
      const payment = new Payment({
        ...paymentData,
        status: 'completed',
        currency: paymentData.currency || 'MXN',
        transactionId: generateTransactionId(),
        paymentDetails: paymentData.paymentDetails || {}
      });
      const savedPayment = await payment.save({ session });
      createdPayments.push(savedPayment);
    }

    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      count: createdPayments.length,
      data: createdPayments
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error en createBatchPayments:', error);
    
    // Intentar actualizar el estado del pago a 'failed' si es posible
    try {
      for (const payment of createdPayments) {
        if (payment && payment._id) {
          await Payment.findByIdAndUpdate(payment._id, { 
            status: 'failed',
            'paymentDetails.error': error.message
          });
        }
      }
    } catch (updateError) {
      console.error('Error al actualizar el estado del pago a fallido:', updateError);
    }

    res.status(500).json({
      success: false,
      message: `Error al procesar los pagos: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    session.endSession();
  }
};

// Obtener pago por ID
export const getPaymentById = async (req, res) => {
  try {
   
    const payment = await Payment.findById(req.params.id).lean();
    

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el pago',
      error: error.message
    });
  }
};

// Obtener pagos por usuario
export const getPaymentsByUser = async (req, res) => {
  console.log('🔍 Buscando pagos para el usuario:', req.params.userId);
  
  try {
    // Verificar que el userId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      console.log('❌ ID de usuario no válido:', req.params.userId);
      return res.status(400).json({
        success: false,
        message: 'ID de usuario no válido'
      });
    }

    console.log('🔍 Buscando en la base de datos...');
    const payments = await Payment.find({ userId: req.params.userId }).lean();
    console.log('📊 Pagos encontrados:', payments.length);

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('❌ Error al obtener pagos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los pagos',
      error: error.message
    });
  }
};
