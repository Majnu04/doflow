import mongoose from 'mongoose';

const sanitizeMongoUri = (value) => {
  if (!value) return value;
  const trimmed = String(value).trim();
  // Common copy/paste issue: surrounding quotes in .env values
  return trimmed.replace(/^['"]/, '').replace(/['"]$/, '');
};

const extractMongoHostForLogs = (uri) => {
  if (!uri) return 'UNKNOWN';
  try {
    // Node supports parsing custom schemes like mongodb+srv:
    const parsed = new URL(uri);
    return parsed.host || 'UNKNOWN';
  } catch {
    // Fallback for partially malformed URIs
    const match = String(uri).match(/@([^/?#]+)(?:[/?#]|$)/);
    return match?.[1] || 'UNKNOWN';
  }
};

const connectDB = async () => {
  // Support multiple env var names for flexibility
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
  const uri = sanitizeMongoUri(rawUri);
  const safeHost = extractMongoHostForLogs(uri);

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
    console.error('MongoDB host (from MONGODB_URI):', safeHost);
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
      console.error('  - Quick DNS check (Windows PowerShell):');
      console.error(`    Resolve-DnsName -Type A ${safeHost}`);
    }

    // Log the original error for debugging
    console.error('Original error:', error && error.message ? error.message : error);

    // In development, keep the API process alive to avoid nodemon crash-loops
    // (routes depending on DB will still fail until MONGODB_URI is fixed).
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
