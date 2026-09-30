import mongoose, { Connection } from 'mongoose';
import { getServerEnv } from '@/config/env';

interface Cached {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var mongoose: Cached | undefined;
}

const cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export default async function connectDB(): Promise<Connection | null> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(getServerEnv('MONGODB_URI'))
      .then((mongooseInstance) => mongooseInstance.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    cached.promise = null;
  }

  return cached.conn;
}
