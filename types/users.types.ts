import { ILeaveReq } from "./leaves.types";

export interface IUserOrganizations {
  id: string;
  name: string;
  orgRole: string;
  appRole: string;
  addedAt?: Date;
}

export interface IUser {
  id: string;
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  userName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  organizations?: IUserOrganizations[];
  userOrgsIds?: string[];
  leaves?: ILeaveReq[];
  onboardingStep?: number;
  isOnboarded?: boolean;
}
