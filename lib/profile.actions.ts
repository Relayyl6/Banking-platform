"use server"

// 1. Make sure you use the admin version of the database
import { adminDb } from "@/config/firebaseAdmin" 
import { createDwollaCustomer } from "./dwolla.actions"
import { extractCustomerIdFromUrl } from "./utils"
import { getServerUser } from "./auth"

export async function updateUserProfileAndDwolla(profileData: any) {
  try {
    console.log("--- Starting Profile Update ---");
    
    const user = await getServerUser()
    if (!user) {
      console.error("DEBUG: No user found");
      return { error: "User not authenticated" }
    }

    const userRef = adminDb.collection("user").doc(user.uid);

    await userRef.update({
      ...profileData,
      updatedAt: new Date(),
    });
    console.log("DEBUG: Admin SDK updated Firestore successfully");

    // 3. Create Dwolla customer
    const dwollaCustomerUrl = await createDwollaCustomer({
      email: user.email as string,
      type: "personal",
      firstName: user.firstName,
      lastName: user.lastName,
      address1: profileData.address,
      ssn: profileData.SSN,
      dateOfBirth: profileData.dateofbirth,
      ...profileData,
    })

    if (!dwollaCustomerUrl) return { error: "Failed to create Dwolla customer" }

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl)

    // 4. Final update using Admin SDK
    await userRef.update({
        dwollaCustomerId,
        dwollaCustomerUrl,
        updatedAt: new Date(),
    });
    console.log("DEBUG: Final Admin update complete");

    return { success: true }
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return { error: error.message || "Failed to update profile" }
  }
}