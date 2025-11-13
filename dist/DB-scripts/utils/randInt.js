// returns number interval [min, max]
export default function (max, min = 1) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
