import { auth } from "@/FirebaseConfig";
import axios from "axios";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

// Delete a user account
export async function deleteUserAccount(userId: string, password: string) {
  if (!auth) return;

  const user = auth.currentUser;
  const authToken = await user?.getIdToken();
  try {
    const user = auth.currentUser;
    if (!user?.email) throw new Error("User email not found");
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(auth.currentUser!, credential);
  } catch (error) {
    console.error(error);
    throw new Error("Wrong password. Enter your current password to continue.");
  }

  try {
    await axios.delete(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/accounts/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // TODO: Add a function to delete the user document from Firestore
    // TODO: Add a function to delete everything related to the user from Firestore

    // Logout the user after deleting the account
    await auth.signOut();
    // await deleteCookie("auth-token");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete user account");
  }
}

// Update user account profile
export async function updateUserAccountProfile(
  userId: string,
  userData: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    password?: string;
    photoUrl?: string;
    userName?: string;
    phoneNumber?: string;
    emailVerified?: boolean;
  }
) {
  if (!auth) return;

  const authToken = await auth.currentUser?.getIdToken();
  if (userData?.newPassword) {
    try {
      const user = auth.currentUser;
      if (!user?.email) throw new Error("User email not found");
      const credential = EmailAuthProvider.credential(
        user.email,
        userData.currentPassword!
      );
      await reauthenticateWithCredential(auth.currentUser!, credential);
    } catch (error) {
      console.error(error);
      throw new Error(
        "Wrong password. Enter your current password to continue."
      );
    }
  }

  try {
    await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/accounts/${userId}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update user account", { cause: error });
  }
}

// Add Custom Claims to user
export async function createCustomClaim(
  authToken: string,
  customClaimValues: {
    [key: string]: string;
  }
) {
  try {
    await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/custom-claims`,
      customClaimValues,

      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return "Custom claim successfully created";
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create custom claim");
  }
}

export async function getUserCustomClaims(authToken: string): Promise<{
  appRole?: string;
  orgRole?: string;
  orgId?: string;
  [key: string]: string | undefined;
}> {
  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/custom-claims`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.customClaims;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve custom claim");
  }
}
