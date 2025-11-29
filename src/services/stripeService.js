import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Crea un pago con tarjeta de crédito/débito
 * @param {Object} paymentData - Datos del pago
 * @param {number} paymentData.amount - Monto en centavos
 * @param {string} paymentData.currency - Moneda (ej: 'mxn')
 * @param {string} paymentData.source - Token de tarjeta generado por Stripe.js
 * @param {string} paymentData.description - Descripción del pago
 * @returns {Promise<Object>} - Respuesta de Stripe
 */
export const createPayment = async ({ amount, currency = 'mxn', source, description = '' }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: source,
      confirm: true,
      description,
      return_url: 'https://your-website.com/return', 
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error en createPayment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Confirma un pago
 * @param {string} paymentIntentId - ID del PaymentIntent de Stripe
 * @returns {Promise<Object>} - Estado del pago
 */
export const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error en confirmPayment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Obtiene el estado de un pago
 * @param {string} paymentIntentId - ID del PaymentIntent de Stripe
 * @returns {Promise<Object>} - Estado del pago
 */
export const getPaymentStatus = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      status: paymentIntent.status,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error en getPaymentStatus:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Reembolsa un pago
 * @param {string} paymentIntentId - ID del PaymentIntent de Stripe
 * @param {number} amount - Monto a reembolsar en centavos (opcional, si no se especifica, se reembolsa el total)
 * @returns {Promise<Object>} - Resultado del reembolso
 */
export const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount }),
    });

    return {
      success: true,
      refund,
    };
  } catch (error) {
    console.error('Error en refundPayment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  createPayment,
  confirmPayment,
  getPaymentStatus,
  refundPayment,
};