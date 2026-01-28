import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

console.log("🛠️ Firebase Admin Init Starting...");

// 🔍 Check raw env presence (DO NOT log full private key)
console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "Loaded ✅" : "Missing ❌");
console.log("CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "Loaded ✅" : "Missing ❌");
console.log("PRIVATE_KEY exists:", process.env.FIREBASE_PRIVATE_KEY ? "Yes ✅" : "No ❌");

// 🔍 Show first characters of key to confirm format
console.log(
  "PRIVATE_KEY starts with:",
  process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30)
);

// 🔍 Count how many Firebase Admin apps already exist
console.log("Existing admin apps:", getApps().length);

if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  console.error("❌ Missing Firebase Admin environment variables");
  throw new Error("Missing Firebase Admin environment variables");
}

// Clean the key more aggressively (Windows-safe)
const cleanedPrivateKey = process.env.FIREBASE_PRIVATE_KEY
  .replace(/\\n/g, "\n")
  .replace(/\r/g, "");

console.log("🔐 Cleaned key starts with:", cleanedPrivateKey.slice(0, 30));
console.log("🔐 Cleaned key ends with:", cleanedPrivateKey.slice(-30));

const app =
  getApps().length === 0
    ? (() => {
        console.log("🚀 Initializing NEW Firebase Admin app");
        return initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: cleanedPrivateKey,
          }),
        });
      })()
    : (() => {
        console.log("♻️ Reusing EXISTING Firebase Admin app");
        return getApps()[0];
      })();

console.log("✅ Firebase Admin initialized successfully");

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

console.log("✅ adminAuth ready:", !!adminAuth);
console.log("✅ adminDb ready:", !!adminDb);