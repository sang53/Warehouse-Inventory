export const TNAMES = {
  PRODUCTS: "products",
  PALLETS: "pallets",
  LOCATIONS: "locations",
  P_PA: "p_pa",
} as const;

export const FIELDS = {
  PRODUCTS: [
    {
      text: "Product Name",
      name: "p_name",
      type: "text",
      required: true,
      placeholder: "Must be unique",
    },
    {
      text: "Price ($)",
      name: "price",
      type: "number",
      required: true,
      placeholder: "0.00",
      min: "0",
      step: "0.01",
    },
  ],
} as const;

export const LOCATION_ROLES = ["intake", "storage", "outgoing"] as const;

export interface T_IN {
  PRODUCTS: {
    p_name: string;
    price: number;
  };
  PALLETS: {
    pa_t?: Date;
  };
  LOCATIONS: {
    l_id?: number;
    l_name: string;
    pa_id?: number;
    role: (typeof LOCATION_ROLES)[number];
  };
  P_PA: {
    p_id: number;
    pa_id: number;
    stock: number;
  };
}

export interface T_OUT extends T_IN {
  PRODUCTS: T_IN["PRODUCTS"] & {
    p_id: number;
  };
  PALLETS: {
    pa_id: number;
    pa_t: Date;
  };
  LOCATIONS: T_IN["LOCATIONS"] & {
    l_id: number;
    pa_id: number | null;
  };
  P_PA: T_IN["P_PA"];
}

export const TABLESCHEMAS = [
  `CREATE TABLE products (
  p_id SERIAL PRIMARY KEY,
  p_name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);`,
  `CREATE TABLE pallets (
  pa_id SERIAL PRIMARY KEY,
  pa_t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`,
  `CREATE TABLE locations (
  l_id SERIAL PRIMARY KEY,
  l_name VARCHAR(5) UNIQUE NOT NULL,
  pa_id INT UNIQUE REFERENCES pallets(pa_id),
  role VARCHAR(10) NOT NULL CHECK (role IN ('intake', 'storage', 'outgoing'))
);`,
  `CREATE TABLE p_pa (
  p_id INT NOT NULL REFERENCES products(p_id),
  pa_id INT NOT NULL REFERENCES pallets(pa_id),
  stock INT NOT NULL CHECK (stock >= 0),
  PRIMARY KEY (p_id, pa_id)
);`,
] as const;
