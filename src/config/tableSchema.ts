export enum TNAMES {
  PRODUCTS = "products",
  PALLETS = "pallets",
  LOCATIONS = "locations",
  P_PA = "p_pa",
  TASKS = "tasks",
  ORDERS = "orders",
  USERS = "users",
}

const TABLETYPES = {
  location_type: `CREATE TYPE location_type AS ENUM ('intake', 'storage', 'outgoing');`,
  status: `CREATE TYPE status AS ENUM ('incoming', 'intake', 'storage', 'pick', 'outgoing', 'completed');`,
  user_type: `CREATE TYPE user_type AS ENUM('intake', 'storage', 'outgoing', 'admin')`,
};

const TABLESCHEMAS = {
  products: `CREATE TABLE products (
    p_id SERIAL PRIMARY KEY,
    p_name TEXT UNIQUE NOT NULL
);`,
  pallets: `CREATE TABLE pallets (
    pa_id SERIAL PRIMARY KEY
);`,
  locations: `CREATE TABLE locations (
    l_id SERIAL PRIMARY KEY,
    l_name VARCHAR(3) UNIQUE NOT NULL,
    pa_id INT UNIQUE REFERENCES pallets(pa_id),
    l_role location_type NOT NULL,
    free BOOLEAN NOT NULL DEFAULT TRUE
);`,
  p_pa: `CREATE TABLE p_pa (
    p_id INT NOT NULL REFERENCES products(p_id),
    pa_id INT NOT NULL REFERENCES pallets(pa_id),
    stock INT NOT NULL CHECK (stock > 0),
    PRIMARY KEY (p_id, pa_id)
);`,
  users: `CREATE TABLE users (
    u_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    u_name TEXT NOT NULL,
    u_role user_type NOT NULL,
);`,
  tasks: `CREATE TABLE tasks (
    t_id SERIAL PRIMARY KEY,
    from_l_id INT REFERENCES locations(l_id),
    to_l_id INT REFERENCES locations(l_id),
    t_status status NOT NULL,
    t_t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pa_id INT REFERENCES pallets(pa_id),
    u_id INT REFERENCES users(u_id)
);`,
  orders: `CREATE TABLE orders (
    o_id SERIAL NOT NULL,
    p_id INT NOT NULL REFERENCES products(p_id),
    stock INT NOT NULL CHECK (stock > 0),
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    t_id INT REFERENCES tasks(t_id),
    PRIMARY KEY (o_id, p_id)
);`,
};

export default Object.values(TABLETYPES).concat(Object.values(TABLESCHEMAS));
