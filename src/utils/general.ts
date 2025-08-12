export function getFormData<T extends Record<string, string | true>>(
  fields: readonly T[],
  excludeArr: (keyof T & string)[],
) {
  return fields.map((field) => {
    const entries = Object.entries(field);
    return {
      inputString: getFormString(entries, excludeArr),
      data: getFormLabel(entries, excludeArr),
    };
  });
}

function getFormString(
  entries: [string, string | true][],
  excludeArr: string[],
) {
  return entries
    .filter(([key]) => !excludeArr.includes(key))
    .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
    .join(" ");
}

function getFormLabel(
  entries: [string, string | true][],
  excludeArr: string[],
) {
  return Object.fromEntries(
    entries.filter(([key]) => excludeArr.includes(key)),
  );
}
