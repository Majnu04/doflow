import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set.');
  }

  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const hasDiscussion = collections.some((c) => c.name === 'discussions');

  if (!hasDiscussion) {
    console.log('No discussions collection found. Nothing to clean.');
    return;
  }

  // Drop the collection entirely (fast + removes indexes too)
  await db.dropCollection('discussions');
  console.log('✅ Dropped collection: discussions');
};

try {
  await run();
} catch (err) {
  console.error('❌ Cleanup failed:', err?.message || err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
