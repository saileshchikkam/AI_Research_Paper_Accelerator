import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/researchmind';

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI);
    
    console.log('MongoDB connected successfully.');
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message);
    console.warn('Continuing server startup. MongoDB will attempt auto-reconnection.');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Retrying connection...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime connection error:', err.message);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination.');
    process.exit(0);
  } catch (err: any) {
    console.error('Error closing MongoDB connection:', err.message);
    process.exit(1);
  }
});
