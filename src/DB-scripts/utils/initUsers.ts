import { PoolClient } from "pg";
import User from "../../models/usersModel.js";

const USER_TYPES = ["admin", "intake", "picker", "outgoing"] as const;
const USERS = [
  {
    username: USER_TYPES[0],
    password: capitalise(USER_TYPES[0]),
    u_name: USER_TYPES[0],
    u_role: USER_TYPES[0],
  },
  {
    username: USER_TYPES[1],
    password: capitalise(USER_TYPES[1]),
    u_name: USER_TYPES[1],
    u_role: USER_TYPES[1],
  },
  {
    username: USER_TYPES[2],
    password: capitalise(USER_TYPES[2]),
    u_name: USER_TYPES[2],
    u_role: USER_TYPES[2],
  },
  {
    username: USER_TYPES[3],
    password: capitalise(USER_TYPES[3]),
    u_name: USER_TYPES[3],
    u_role: USER_TYPES[3],
  },
];

export default async function (client: PoolClient) {
  return await Promise.all(
    USERS.map((userData) => User.create(userData, client)),
  );
}

function capitalise(str: string) {
  return str.charAt(0) + str.slice(1);
}
