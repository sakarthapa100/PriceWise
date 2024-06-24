import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  // Check if the MongoDB URI is defined
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  // Check if already connected
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
};
