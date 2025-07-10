import * as Yup from "yup";

export const signUpSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .required("Password is required"),
});

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

export const OtpSchema = Yup.object().shape({
  otp: Yup.string()
    .min(6, "OTP must be 6 characters")
    .required("You must enter OTP to continue"),
});

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

// Onboarding Schemas
export const CreateOrgSchema = Yup.object().shape({
  organizationName: Yup.string()
    .min(3, "Organization Name must be at least 3 characters long")
    .required("Organization Name is required"),
});

export const createInvitationSchema = Yup.object().shape({
  emails: Yup.array()
    .of(
      Yup.string().email("Invalid email address").required("Email is required")
    )
    .required("Email is required")
    .min(1, "At least one email is required"),
  appRole: Yup.string().required("App Role is required"),
  orgRole: Yup.string().required("Org Role is required"),
});

export const updateUserProfileSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address"),
  phoneNumber: Yup.string().min(
    10,
    "Phone number must be at least 10 characters long"
  ),
  firstName: Yup.string().min(
    3,
    "First Name must be at least 3 characters long"
  ),
  lastName: Yup.string().min(3, "Last Name must be at least 3 characters long"),
  userName: Yup.string()
    .min(3, "Username must be at least 3 characters long")
    .matches(
      /^[a-zA-Z0-9]+$/,
      "Username should not include spaces or special characters"
    ),
  photoUrl: Yup.string().url("Invalid URL"),
  appRole: Yup.string().min(2, "App Role must be at least 3 characters long"),
  orgRole: Yup.string().min(2, "Org Role must be at least 3 characters long"),
});

// Leave Management Schemas
export const newLeaveSchema = Yup.object().shape({
  id: Yup.string(),
  organization: Yup.string().min(
    3,
    "Organization must be at least 3 characters long"
  ),
  title: Yup.string()
    .min(3, "Title must be at least 3 characters long")
    .required("Title cannot be empty"),
  reason: Yup.string()
    .min(3, "Reason must be at least 3 characters long")
    .required("Reason cannot be empty"),
  supervisorId: Yup.string().min(
    3,
    "Supervisor ID must be at least 3 characters long"
  ),
  supervisor: Yup.string()
    .min(3, "Supervisor must be at least 3 characters long")
    .required("Supervisor cannot be empty"),
  supervisorEmail: Yup.string().email("Invalid email address"),
  departmentId: Yup.string().min(
    3,
    "Department ID must be at least 3 characters long"
  ),
  department: Yup.string()
    .min(3, "Department must be at least 3 characters long")
    .required("Department cannot be empty"),
  leaveTypeId: Yup.string().min(
    3,
    "Leave type ID must be at least 3 characters long"
  ),
  leaveType: Yup.string()
    .min(3, "Leave type must be at least 3 characters long")
    .required("Leave type cannot be empty"),
  startDate: Yup.date().required("Start date cannot be empty"),
  endDate: Yup.date().required("End date cannot be empty"),
  status: Yup.string(),
});

// Department Management Schemas
export const newDepartmentSchema = Yup.object().shape({
  id: Yup.string(),
  organization: Yup.string().min(
    3,
    "Organization must be at least 3 characters long"
  ),
  departmentName: Yup.string()
    .min(3, "Department must be at least 3 characters long")
    .required("Department cannot be empty"),
  supervisor: Yup.string()
    .min(3, "Supervisor must be at least 3 characters long")
    .required("Supervisor cannot be empty"),
});
