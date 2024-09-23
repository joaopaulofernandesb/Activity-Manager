import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Defina a variável MONGODB_URI nas variáveis de ambiente');
}

// Declaração global para cachear a conexão do Mongoose
declare global {
  var mongoose: any; // Remova o tipo específico para simplificar e evitar erros
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Se já houver uma conexão estabelecida, retorna-a
  if (cached.conn) {
    return cached.conn;
  }

  // Se não houver uma promessa de conexão, cria uma nova e cacheia
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }

  // Aguarda a promessa ser resolvida e cacheia a conexão estabelecida
  cached.conn = await cached.promise;

  return cached.conn;
}

export default connectDB;
