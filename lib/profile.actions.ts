"use server"

import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/config/env"
import { createDwollaCustomer } from "./dwolla.actions"
import { extractCustomerIdFromUrl } from "./utils"
import { adminDb } from "@/config/firebaseAdmin"
import { getServerUser } from "./auth"

export async function updateUserProfileAndDwolla(profileData: {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  postalCode: string
  dateofbirth: string
  SSN: string
}) {
  try {
    const user = await getServerUser()
    if (!user) return { error: "User not authenticated" }

    const userRef = doc(db, "user", user.uid)
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date(),
    })

    // Create Dwolla customer
    const dwollaCustomerUrl = await createDwollaCustomer({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: user.email,
      type: "personal",
      address1: profileData.address,
      city: profileData.city,
      state: profileData.state,
      postalCode: profileData.postalCode,
      dateOfBirth: profileData.dateofbirth,
      ssn: profileData.SSN,
    })

    if (!dwollaCustomerUrl) return { error: "Failed to create Dwolla customer" }

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl)

    // Save Dwolla user data
    await adminDb.collection("dwollaUser").add({
      ...profileData,
      email: user.email,
      userId: user.uid,
      dwollaCustomerId,
      dwollaCustomerUrl,
      createdAt: new Date(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "Failed to update profile" }
  }
}