import React from "react";

export interface Organization {
  id: string;
  name: string;
  photoURL?: string;
  plan?: string;
}

export interface IAccessControlData {
  user?: {
    uid: string;
    email: string;
    photoURL?: string;
    fullName?: string;
  };
  appRole?: string;
  orgRole?: string;
  orgId?: string;
  orgLogo?: React.ElementType | string;
  orgName?: string;
  orgPlan?: string;
  // Add an optional array of organizations for team switching
  organizations?: Organization[];
}
