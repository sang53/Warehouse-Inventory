export default function <T extends object, K extends keyof T>(
  source: T,
  keys: Readonly<K[]>,
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      acc[key] = source[key];
      return acc;
    },
    {} as Pick<T, K>,
  );
}
