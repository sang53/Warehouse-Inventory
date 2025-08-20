import { T_OUT } from "../config/tableTypes.ts";
import formFields from "../config/formFields.ts";

export const VIEWS = {
  DISPLAY: "display",
  FORM: "form",
} as const;

export interface ViewLocals {
  display: DisplayLocals;
  form: FormLocals;
}

export interface DisplayLocals {
  title: string;
  tableData: Partial<T_OUT[keyof T_OUT]>[];
}

export interface FormLocals {
  title: string;
  action: string;
  field: keyof typeof formFields;
}

export interface FilledLocals {
  view: keyof ViewLocals;
  viewData: ViewLocals[keyof ViewLocals];
}
