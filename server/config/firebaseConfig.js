/**
 * firebaseConfig.js
 *
 * Initialises the Firebase Admin SDK once and exports:
 *   - admin       → the Admin SDK instance
 *   - bucket      → the default Storage bucket reference
 *
 * Credentials are loaded from environment variables ONLY.
 * Never commit a service-account JSON file.
 *
 * Required env vars (add to server/.env):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (the full key string with literal \n characters)
 *   FIREBASE_STORAGE_BUCKET  (e.g. scient-website-xxxxx.appspot.com)
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

// Guard: only initialise once (prevents re-init on hot-reload / require cache)
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !privateKey ||
    !process.env.FIREBASE_STORAGE_BUCKET
  ) {
    console.warn(
      '[Firebase] Missing one or more FIREBASE_* env variables. ' +
      'Firebase Storage uploads will not work until they are set.'
    );
  } else {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log('[Firebase] Admin SDK initialised. Bucket:', process.env.FIREBASE_STORAGE_BUCKET);
  }
}

/**
 * Returns the default Storage bucket, or null if Firebase is not configured.
 */
const getBucket = () => {
  if (!getApps().length) return null;
  return getStorage().bucket();
};

module.exports = { getBucket };
