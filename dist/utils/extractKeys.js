export default function (source, keys) {
    return keys.reduce((acc, key) => {
        acc[key] = source[key];
        return acc;
    }, {});
}
