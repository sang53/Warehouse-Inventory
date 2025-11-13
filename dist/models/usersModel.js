import GeneralModel from "./generalModel.js";
import * as argon2 from "argon2";
export default class User {
    u_id;
    u_name;
    u_role;
    constructor(data) {
        this.u_id = data.u_id;
        this.u_name = data.u_name;
        this.u_role = data.u_role;
    }
    static async get(data, limit) {
        const output = await GeneralModel.get("users", {
            conditions: data,
            limit,
        });
        return output.map((user) => new User(user));
    }
    static async getAll() {
        const output = await GeneralModel.get("users", { limit: null });
        return output.map((user) => new User(user));
    }
    static async update(data, conditions) {
        const output = await GeneralModel.update("users", data, conditions);
        return output.map((user) => new User(user));
    }
    static async getAuthUser(username) {
        return await GeneralModel.get("users", {
            conditions: { username },
            limit: 1,
        });
    }
    static async create(data, client) {
        data.password = await argon2.hash(data.password);
        const output = await GeneralModel.create("users", data, client);
        return new User(output);
    }
}
