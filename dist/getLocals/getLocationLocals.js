export default function ({ location, t_id }) {
    return {
        view: "location",
        viewData: {
            location,
            t_id: t_id ?? "None",
        },
    };
}
