import Stripe from 'stripe';
import 'dotenv/config';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Using the latest API version
  typescript: true,
  timeout: 10000 // 10 segundos de timeout
});

export default stripe;
