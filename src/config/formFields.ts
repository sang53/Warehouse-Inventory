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

export default {
  PRODUCTS: [
    {
      text: "Product Name",
      name: "p_name",
      autofocus: true,
      ...NAME_FIELD,
    },
  ],
  PALLETS: [
    {
      text: "Product ID",
      name: "p_id",
      ...ID_FIELD,
    },
    STOCK_FIELD,
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
  LOGIN: [
    {
      text: "Username",
      name: "username",
      ...NAME_FIELD,
      autofocus: true,
    },
    {
      text: "Password",
      name: "password",
      type: "password",
      required: true,
    },
  ],
} as const;
