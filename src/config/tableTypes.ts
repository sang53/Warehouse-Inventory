export enum L_Types {
  INTAKE = "intake",
  STORAGE = "storage",
  OUTGOING = "outgoing",
}

export enum U_Types {
  INTAKE = "intake",
  STORAGE = "storage",
  OUTGOING = "outgoing",
  ADMIN = "admin",
}

export enum Status {
  INCOMING = "incoming",
  INTAKE = "intake",
  STORAGE = "storage",
  OUTGOING = "outgoing",
  COMPLETED = "compeleted",
}
export interface T_IN {
  PRODUCTS: {
    p_name: string;
  };
  LOCATIONS: {
    l_name: string;
    pa_id?: number;
    l_role: L_Types;
    free?: boolean;
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
  TASKS: {
    from_l_id?: number;
    to_l_id?: number;
    t_status: Status;
    pa_id?: number;
    u_id?: number;
  };
  ORDERS: {
    p_id: number;
    stock: number;
    complete?: boolean;
    t_id?: number;
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
    free: boolean;
  };
  P_PA: T_IN["P_PA"];
  USERS: T_IN["USERS"] & {
    u_id: number;
  };
  TASKS: T_IN["TASKS"] & {
    t_id: number;
    from_l_id: number | null;
    to_l_id: number | null;
    pa_id: number | null;
    u_id: number | null;
  };
  ORDERS: T_IN["ORDERS"] & {
    o_id: number;
    complete: boolean;
    t_id: number | null;
  };
}
