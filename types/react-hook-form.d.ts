// This is a workaround for the type issues with react-hook-form
declare module "react-hook-form" {
  export const useForm: any;
  export const Controller: any;
  export const FormProvider: any;
  export const useFormContext: any;
  export const useWatch: any;
  export const useController: any;
}
