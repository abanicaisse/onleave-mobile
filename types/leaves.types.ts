export interface ILeaveReq {
  id?: string;
  openedBy?: string;
  openedByName?: string;
  openedAt?: Date;
  organization?: string;
  title?: string;
  reason?: string;
  supervisorId?: string;
  supervisor?: string;
  supervisorEmail?: string;
  departmentId?: string;
  department?: string;
  leaveTypeId?: string;
  leaveType?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  rejectionReason?: string;
}
