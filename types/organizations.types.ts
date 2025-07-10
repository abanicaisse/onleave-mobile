import { ILeaveReq } from "./leaves.types";

export interface IOrgMember {
  id: string;
  email: string;
  orgRole: string;
  appRole: string;
  addedAt: Date;
}

export interface IOrganization {
  id: string;
  name: string;
  owner: string;
  photoURL?: string;
  plan?: string;
  roles?: string[];
  members?: IOrgMember[];
  membersIds?: string[];
  leaveTypes?: string[];
  leaves?: ILeaveReq[];
  createdAt?: Date;
  updatedAt?: Date;
}
