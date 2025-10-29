const TABLETYPES = {
  location_type: `CREATE TYPE location_type AS ENUM ('intake', 'storage', 'outgoing');`,
  task_type: `CREATE TYPE task_type AS ENUM ('arrival', 'intake', 'storage', 'pick', 'outgoing', 'export');`,
  user_type: `CREATE TYPE user_type AS ENUM('intake', 'picker', 'outgoing', 'admin');`,
  order_type: `CREATE TYPE order_type AS ENUM ('IN', 'OUT');`,
};

const TABLESCHEMAS = {
  products: `CREATE TABLE products (
    p_id SERIAL PRIMARY KEY,
    p_name TEXT UNIQUE NOT NULL
);`,
  pallets: `CREATE TABLE pallets (
    pa_id SERIAL PRIMARY KEY,
    created TIMESTAMPTZ DEFAULT NOW()
);`,
  locations: `CREATE TABLE locations (
    l_id SERIAL PRIMARY KEY,
    l_name TEXT UNIQUE NOT NULL,
    pa_id INT UNIQUE REFERENCES pallets(pa_id) ON DELETE SET NULL,
    l_role location_type NOT NULL
);`,
  p_pa: `CREATE TABLE p_pa (
    p_id INT NOT NULL REFERENCES products(p_id),
    pa_id INT NOT NULL REFERENCES pallets(pa_id) ON DELETE CASCADE,
    stock INT NOT NULL CHECK (stock >= 0),
    PRIMARY KEY (p_id, pa_id)
);`,
  users: `CREATE TABLE users (
    u_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    u_name TEXT NOT NULL,
    u_role user_type NOT NULL
);`,
  orders: `CREATE TABLE orders (
    o_id SERIAL PRIMARY KEY,
    placed TIMESTAMPTZ DEFAULT NOW(),
    completed TIMESTAMPTZ,
    o_type order_type NOT NULL
);`,
  o_p: `CREATE TABLE o_p (
    o_id INT NOT NULL REFERENCES orders(o_id),
    p_id INT NOT NULL REFERENCES products(p_id),
    stock INT NOT NULL CHECK (stock > 0),
    PRIMARY KEY (o_id, p_id)
);`,
  tasks: `CREATE TABLE tasks (
    t_id SERIAL PRIMARY KEY,
    t_type task_type NOT NULL,
    placed TIMESTAMPTZ DEFAULT NOW(),
    started TIMESTAMPTZ,
    completed TIMESTAMPTZ
);`,
  o_t: `CREATE TABLE o_t (
    o_id INT NOT NULL REFERENCES orders(o_id),
    t_id INT NOT NULL REFERENCES tasks(t_id),
    PRIMARY KEY (o_id, t_id)
);`,
  taskRels: `CREATE TABLE taskRels (
    t_id INT PRIMARY KEY REFERENCES tasks(t_id),
    l_id INT REFERENCES locations(l_id),
    pa_id INT REFERENCES pallets(pa_id) ON DELETE SET NULL,
    u_id INT REFERENCES users(u_id)
);`,
};

export default {
  TYPES: TABLETYPES,
  TABLES: TABLESCHEMAS,
};
