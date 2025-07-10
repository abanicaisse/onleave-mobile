import { IAccessControlData } from "@/types/access-control.types";
import { create } from "zustand";

interface AccessControlStore {
  accessControlData: IAccessControlData;
  setAccessControlData: (data: IAccessControlData) => void;
  updateAccessControlData: (data: Partial<IAccessControlData>) => void;
  clearAccessControlData: () => void;
}

export const useAccessControlStore = create<AccessControlStore>((set) => ({
  accessControlData: {},
  setAccessControlData: (data) => set({ accessControlData: data }),
  updateAccessControlData: (data) =>
    set((state) => ({
      accessControlData: { ...state.accessControlData, ...data },
    })),
  clearAccessControlData: () => set({ accessControlData: {} }),
}));
