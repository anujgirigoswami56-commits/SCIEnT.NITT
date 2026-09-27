// config/db.js
const dns = require('dns');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Use public DNS to reliably resolve MongoDB Atlas SRV records
// (fixes querySrv ECONNREFUSED on campus/mobile networks)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fall back to default DNS if setServers is restricted
}

dotenv.config({ path: __dirname + '/../.env' });

const connectDB = async () => {
  const atlasUri   = process.env.MONGO_URI_ATLAS || process.env.MONGO_URI;
  const localUri   = process.env.MONGO_URI_LOCAL  || 'mongodb://localhost:27017/scient';
  const isProduction = process.env.NODE_ENV === 'production';

  // ─── Primary target ───────────────────────────────────────────────────────
  // Always prefer Atlas when MONGO_URI_ATLAS (or MONGO_URI) is set.
  // Fall back to local only when neither Atlas variable is configured.
  const primaryUri   = atlasUri  || localUri;
  const primaryLabel = atlasUri  ? 'MongoDB Atlas' : 'Local MongoDB';
  const fallbackUri  = atlasUri  ? localUri : null;   // fallback only when primary is Atlas
  const fallbackLabel = 'Local MongoDB (fallback)';

  console.log(`Environment mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Connecting to ${primaryLabel}...`);

  // ─── Primary connection ────────────────────────────────────────────────────
  try {
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`✅ Connected to ${primaryLabel}`);
    return;
  } catch (primaryErr) {
    console.warn(`❌ ${primaryLabel} connection failed:`, primaryErr.message);
  }

  // ─── Fallback connection (local) ───────────────────────────────────────────
  if (fallbackUri) {
    console.log(`⚡ Attempting fallback to ${fallbackLabel}...`);
    try {
      await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ Connected to ${fallbackLabel}`);
      return;
    } catch (fallbackErr) {
      console.warn(`❌ ${fallbackLabel} connection failed:`, fallbackErr.message);
    }
  }

  // ─── Both failed ───────────────────────────────────────────────────────────
  console.error(
    '\nCould not connect to any MongoDB instance.\n' +
    '  1. Check that MONGO_URI_ATLAS in server/.env is correct.\n' +
    '  2. Verify your IP is whitelisted in MongoDB Atlas Network Access.\n' +
    '  3. Or start a local mongod instance.\n'
  );
  process.exit(1);
};

module.exports = connectDB;
