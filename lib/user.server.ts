import "server-only"
import { adminDb } from "@/config/firebaseAdmin";
import { getServerUser } from "./auth";

export async function getLoggedInUser() {
  const decoded = await getServerUser();
  if (!decoded) return null;

  const snap = await adminDb
    .collection("user")
    .doc(decoded.uid)
    .get();

  if (!snap.exists) return null;
  return snap.data();
}