import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import { Auth, signOut } from "firebase/auth";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
  auth: Auth | null;
  setAuth: (auth: Auth) => void;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isLoggedIn: boolean;
  login: (auth: Auth) => void;
  logout: (auth: Auth) => void;
};

export const useAuthStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      displayName: null,
      photoURL: null,
      isLoggedIn: false,
      isLoading: false,
      auth: null,
      setAuth: async (auth) => {
        set((state) => ({
          ...state,
          auth: auth,
          userId: auth.currentUser?.uid || null,
          email: auth.currentUser?.email || null,
          displayName: auth.currentUser?.displayName || null,
          photoURL: auth.currentUser?.photoURL || null,
          isLoggedIn: auth.currentUser !== null,
        }));
      },
      login: async (auth) => {
        try {
          set((state) => ({
            ...state,
            auth: auth,
            userId: auth.currentUser?.uid || null,
            email: auth.currentUser?.email || null,
            displayName: auth.currentUser?.displayName || null,
            photoURL: auth.currentUser?.photoURL || null,
            isLoggedIn: true,
          }));
          return { status: "success" };
        } catch (error) {
          set((state) => ({ ...state, isLoading: false }));
          return { status: "error", error: error };
        }
      },
      logout: async (auth) => {
        try {
          set((state) => ({ ...state, isLoading: true }));
          await signOut(auth);
          set((state) => ({
            ...state,
            auth: null,
            userId: null,
            email: null,
            displayName: null,
            photoURL: null,
            isLoggedIn: false,
          }));
          return { status: "success" };
        } catch (error) {
          set((state) => ({
            ...state,
          }));
          return { status: "error", error: error };
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => ({
        setItem,
        getItem,
        removeItem: deleteItemAsync,
      })),
    }
  )
);
