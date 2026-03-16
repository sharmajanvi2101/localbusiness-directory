import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
            console.log('⚠️ WARNING: Attempting to connect to LOCALHOST database on a production server.');
        } else {
            console.log('📡 Attempting to connect to MongoDB Atlas...');
        }
        
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // In production, we want the process to exit so Render can restart/fail the deploy
        process.exit(1);
    }
};

export default connectDB;
