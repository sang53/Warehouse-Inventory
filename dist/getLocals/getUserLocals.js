export default function ({ user, t_id, tasks }) {
    return {
        view: "user",
        viewData: {
            user,
            tasks,
            t_id,
        },
    };
}
