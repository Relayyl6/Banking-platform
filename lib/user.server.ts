import "server-only"
import { adminDb } from "@/config/firebaseAdmin";
import { getServerUser } from "./auth";

export async function getLoggedInUser(): Promise<User | null> {
  const decoded = await getServerUser();
  if (!decoded) return null;

  const snap = await adminDb
    .collection("user")
    .doc(decoded.uid)
    .get();

  if (!snap.exists) return null;
  
  const data = snap.data();
  
  return {
    uid: snap.id,
    email: data?.email || '',
    userId: data?.userId || snap.id,
    dwollaCustomerUrl: data?.dwollaCustomerUrl || '',
    dwollaCustomerId: data?.dwollaCustomerId || '',
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    address: data?.address || '',
    city: data?.city || '',
    state: data?.state || '',
    postalCode: data?.postalCode || '',
    dateofbirth: data?.dateofbirth || '',
    SSN: data?.SSN || '',
  };
}