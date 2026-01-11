export function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Invalid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/operation-not-allowed": "This operation is not allowed.",
  };

  return errorMessages[errorCode] || "An unexpected error occurred. Please try again.";
}