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

const NAME_FIELD = {
  type: "text",
  required: true,
  placeholder: "Must be unique",
} as const;

const formFields = {
  PRODUCTS: [
    {
      text: "Product Name",
      name: "p_name",
      autofocus: true,
      ...NAME_FIELD,
    },
  ],
  USERS: [
    {
      text: "Name",
      name: "u_name",
      autofocus: true,
      ...NAME_FIELD,
    },
    {
      text: "Username",
      name: "username",
      ...NAME_FIELD,
    },
    {
      text: "Password",
      name: "password",
      type: "password",
      placeholder: "Must be AlphaNum",
      required: true,
    },
    {
      text: "Confirm Password",
      name: "passwordConfirm",
      type: "password",
      required: true,
    },
  ],
} as const;
