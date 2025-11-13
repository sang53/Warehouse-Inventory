import getFormLocals from "./getFormLocals.js";
export default function () {
    const { viewData } = getFormLocals({
        title: "New User",
        action: "/users/new",
        field: "USERS",
    });
    return {
        view: "userForm",
        viewData,
    };
}
