import mongoose from 'mongoose';

/**
 * Establece la conexión con la base de datos MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/payment-service';
    console.log('Intentando conectar a MongoDB con URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.db.databaseName}`);
    
    // Verificar si la colección existe
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📚 Colecciones disponibles:', collections.map(c => c.name));
    
    return conn;
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('⚠️  No se pudo conectar al servidor de MongoDB');
      console.error('   Verifica que el servidor esté en ejecución y la URI sea correcta');
    }
    process.exit(1);
  }
};

export default connectDB;
