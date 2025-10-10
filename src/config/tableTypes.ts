// enum types for autocomplete
export const TASK_TYPES = [
  "arrival",
  "intake",
  "storage",
  "pick",
  "outgoing",
  "export",
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

// User Types & Roles
export const USER_TYPES = ["intake", "picker", "outgoing", "admin"] as const;
export type UserType = (typeof USER_TYPES)[number];
export const USER_TASK_MAP: Record<UserType, TaskType[]> = {
  intake: ["arrival", "intake", "storage"],
  picker: ["pick"],
  outgoing: ["outgoing", "export"],
  admin: [],
};

// Location types
export const LOCATION_TYPES = ["intake", "storage", "outgoing"] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

// Order types
export const ORDER_TYPES = ["IN", "OUT"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

// typed input & outputs for database tables
export interface T_IN {
  PRODUCTS: {
    p_name: string;
  };
  PALLETS: object; // for same keys as tablenames & correct extends to T_OUT
  LOCATIONS: {
    l_name: string;
    l_role: LocationType;
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
    u_role: UserType;
  };
  ORDERS: {
    o_type: OrderType;
  };
  O_P: {
    o_id: number;
    p_id: number;
    stock: number;
  };
  TASKS: {
    t_type: TaskType;
  };
  O_T: {
    o_id: number;
    t_id: number;
  };
  TASKREL: {
    t_id: number;
    l_id?: number | null;
    pa_id: number;
    u_id?: number | null;
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
    completed: string | null;
    placed: string;
  };
  TASKS: T_IN["TASKS"] & {
    t_id: number;
    placed: string;
    started: string | null;
    completed: string | null;
  };
  TASKREL: T_IN["TASKREL"] & {
    l_id: number | null;
    pa_id: number;
    u_id: number | null;
  };
}
