export default function (data, col1 = "p_id", col2 = "stock") {
    return Array.from(data).map(([key, value]) => {
        return {
            [col1]: key,
            [col2]: value,
        };
    });
}
