export const formatPriceCompact = (price: number): string => {
  if (price >= 1_000_000) {
    const value = price / 1_000_000;
    return `${removeTrailingZero(value)}jt`;
  }

  if (price >= 1_000) {
    const value = price / 1_000;
    return `${removeTrailingZero(value)}k`;
  }

  return price.toString();
};

const removeTrailingZero = (value: number): string => {
  return value % 1 === 0
    ? value.toString()
    : value.toFixed(1).replace(/\.0$/, "");
};
