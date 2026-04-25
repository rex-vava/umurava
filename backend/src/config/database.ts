import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let memoryServer: any = null;

export async function connectDatabase(): Promise<void> {
  const useMemory = process.env.USE_MEMORY_DB === 'true';

  try {
    if (useMemory) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      logger.info(`MongoDB (in-memory) connected at ${uri}`);
    } else {
      await mongoose.connect(env.MONGODB_URI);
      logger.info('MongoDB connected successfully');
    }
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}
