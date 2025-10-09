import formFields from "../../config/formFields.ts";

interface FormLocals {
  title: string;
  action: string;
  field: keyof typeof formFields;
}

export default function ({ title, action, field }: FormLocals) {
  return {
    view: "form",
    viewData: {
      title,
      action,
      formData: getFormData(field),
    },
  };
}

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
