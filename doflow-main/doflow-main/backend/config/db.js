import mongoose from 'mongoose';

const connectDB = async () => {
  // Support multiple env var names for flexibility
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

  if (!uri) {
    console.warn(
      'MongoDB connection string not provided. Set MONGODB_URI in backend/.env to enable DB features.'
    );
    // Don't crash the whole app when no URI is provided; return so the server can still start for frontend/UI work.
    return;
  }

  try {
    // Connection options with pooling limits
    const conn = await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 2
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Provide more actionable messages for common DNS / SRV issues
    console.error('\nMongoDB connection failed.');
    if (error && error.message && error.message.includes('querySrv ENOTFOUND')) {
      console.error(
        'SRV DNS lookup failed (querySrv ENOTFOUND). This usually means the hostname in your mongodb+srv URI is invalid or contains extra characters (quotes, spaces, or trailing text).'
      );
      console.error('  - Check that your MONGODB_URI looks like:');
      console.error(
        "    mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/<dbname>?retryWrites=true&w=majority"
      );
      console.error('  - Remove any surrounding quotes or accidental trailing characters from the value in your .env.');
      console.error('  - If your environment blocks SRV lookups, try a standard (non-srv) connection string instead.');
    }

    // Log the original error for debugging
    console.error('Original error:', error && error.message ? error.message : error);

    // Exit with non-zero so process managers know startup failed when a URI was explicitly provided
    process.exit(1);
  }
};

export default connectDB;
