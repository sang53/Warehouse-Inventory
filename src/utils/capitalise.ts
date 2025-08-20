export default function (str: string) {
  if (!str[0]) throw new Error(`Cannot capitalise empty string`);
  return str[0] + str.slice(1);
}
