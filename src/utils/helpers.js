/**
 * Genera un ID de transacción único
 * @returns {string} ID de transacción en formato PAY-TIMESTAMP-RANDOM
 */
export const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `PAY-${timestamp}-${randomStr}`.toUpperCase();
};
