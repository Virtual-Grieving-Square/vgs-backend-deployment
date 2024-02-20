import mongoose from 'mongoose';
import config from '../config';

const mongoURL: string = config.DB_CONNECTION_STRING; 

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(mongoURL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); 
    }
};
