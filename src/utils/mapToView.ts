export default function (
  data: Map<number, number>,
  col1: string = "p_id",
  col2: string = "stock",
) {
  return Array.from(data).map(([key, value]) => {
    return {
      [col1]: key,
      [col2]: value,
    };
  });
}
