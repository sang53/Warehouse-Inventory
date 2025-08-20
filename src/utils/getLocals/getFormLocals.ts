import formFields from "../../config/formFields.ts";
import { FormLocals } from "../../config/viewConfig.ts";

export default function (data: FormLocals) {
  const { title, action, field } = data;
  return {
    view: "form",
    viewData: {
      title,
      action,
      formData: getFormData(field),
    },
  };
}

/*
function assertValidFormLocals(
  data: Partial<FormLocals>,
): asserts data is FormLocals {
  const { title, action, field } = data;
  if (
    !title ||
    typeof title !== "string" ||
    !action ||
    typeof action !== "string" ||
    !field ||
    typeof field !== "string" ||
    !Object.keys(formFields).includes(field)
  ) {
    console.error("Invalid data for form: " + JSON.stringify(data));
    throw new Error("System Error");
  }
}
*/

function getFormData(
  fields: keyof typeof formFields,
  excludeArr: string[] = ["text"],
) {
  return formFields[fields].map((field) => {
    const entries = Object.entries(field);
    return {
      inputAttributes: makeInputAttributes(entries, excludeArr),
      ...getExcludedKeys(entries, excludeArr),
    };
  });
}

function makeInputAttributes(
  entries: [string, string | true][],
  excludeArr: string[],
) {
  return entries
    .filter(([key]) => !excludeArr.includes(key))
    .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
    .join(" ");
}

function getExcludedKeys(
  entries: [string, string | true][],
  excludeArr: string[],
) {
  return Object.fromEntries(
    entries.filter(([key]) => excludeArr.includes(key)),
  );
}
