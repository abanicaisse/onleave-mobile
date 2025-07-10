export interface IShiftBreak {
  id?: string;
  shiftId?: string;
  breakStartTime?: Date;
  breakStartLocation?: {
    longitude: string;
    latitude: string;
  };
  breakEndTime?: Date;
  breakEndLocation?: {
    longitude: string;
    latitude: string;
  };
  breakDuration?: string;
}

export interface IShift {
  id?: string;
  orgId?: string;
  departmentId?: string;
  openedBy?: string;
  openedByName?: string;
  openedByEmail?: string;
  openedByProfileImage?: string;
  department?: string;
  startTime?: Date;
  startLocation?: {
    longitude: string;
    latitude: string;
  };
  endTime?: Date;
  endLocation?: {
    longitude: string;
    latitude: string;
  };
  duration?: string;
  breaks?: IShiftBreak[];
  createdAt?: Date;
  updatedAt?: Date;
}
