export const curencyFormatter = (value: number) => {
  const result = new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(value);

  return result;
};
