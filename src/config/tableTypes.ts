export enum T_Types {
  INCOMING = "arrival",
  INTAKE = "intake",
  STORAGE = "storage",
  PICK = "pick",
  OUTGOING = "outgoing",
  EXPORT = "export",
}

export enum L_Types {
  INTAKE = "intake",
  STORAGE = "storage",
  OUTGOING = "outgoing",
}

export enum U_Types {
  INTAKE = "intake",
  PICKER = "picker",
  OUTGOING = "outgoing",
  ADMIN = "admin",
}

export enum O_Types {
  IN = "IN",
  OUT = "OUT",
}

export interface T_IN {
  PRODUCTS: {
    p_name: string;
  };
  LOCATIONS: {
    l_name: string;
    l_role: L_Types;
  };
  P_PA: {
    p_id: number;
    pa_id: number;
    stock: number;
  };
  USERS: {
    username: string;
    password: string;
    u_name: string;
    u_role: U_Types;
  };
  ORDERS: {
    o_type: O_Types;
  };
  O_P: {
    o_id: number;
    p_id: number;
    stock: number;
  };
  TASKS: {
    t_type: T_Types;
    l_id?: number | null;
  };
  O_T: {
    o_id: number;
    t_id: number;
    pa_id?: number | null;
  };
}

export interface T_OUT extends T_IN {
  PRODUCTS: T_IN["PRODUCTS"] & {
    p_id: number;
  };
  PALLETS: {
    pa_id: number;
  };
  LOCATIONS: T_IN["LOCATIONS"] & {
    l_id: number;
    pa_id: number | null;
  };
  USERS: T_IN["USERS"] & {
    u_id: number;
  };
  ORDERS: T_IN["ORDERS"] & {
    o_id: number;
    completed: Date | null;
    placed: Date;
  };
  TASKS: T_IN["TASKS"] & {
    t_id: number;
    l_id: number | null;
    placed: Date;
    started: Date | null;
    completed: Date | null;
  };
  O_T: T_IN["O_T"] & {
    pa_id: number | null;
    u_id: number | null;
  };
}
