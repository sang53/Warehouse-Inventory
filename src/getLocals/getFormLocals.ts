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

const ID_FIELD = {
  type: "number",
  min: "0",
  step: "1",
  required: true,
  autofocus: true,
} as const;

const NAME_FIELD = {
  type: "text",
  required: true,
  placeholder: "Must be unique",
} as const;

const STOCK_FIELD = {
  text: "Quantity",
  name: "stock",
  type: "number",
  step: "1",
  min: "1",
  required: true,
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
      text: "Password (Must be alphanumeric)",
      name: "password",
      type: "password",
      required: true,
    },
    {
      text: "Role",
      name: "u_role",
      ...NAME_FIELD,
      placeholder: "intake | storage | outgoing",
    },
  ],
  ORDERS: [
    {
      text: "Product ID",
      name: "p_id",
      ...ID_FIELD,
    },
    STOCK_FIELD,
  ],
} as const;
