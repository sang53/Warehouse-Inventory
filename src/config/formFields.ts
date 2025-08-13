export default {
  PRODUCTS: [
    {
      text: "Product Name",
      name: "p_name",
      type: "text",
      required: true,
      placeholder: "Must be unique",
      autofocus: true,
    },
  ],
  PALLETS: [
    {
      text: "Quantity",
      name: "stock",
      type: "number",
      step: "1",
      min: "0",
      required: true,
      autofocus: true,
    },
  ],
  USERS: [
    {
      text: "New Role",
      name: "u_role",
      type: "text",
      placeholder: "intake | storage | outgoing",
      required: true,
      autofocus: true,
    },
  ],
} as const;
