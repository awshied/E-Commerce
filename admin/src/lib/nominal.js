export function nominal(num) {
  if (num >= 1_000_000_000_000) {
    return num / 1_000_000_000_000 + " T";
  } else if (num >= 1_000_000_000) {
    return num / 1_000_000_000 + " M";
  } else if (num >= 1_000_000) {
    return num / 1_000_000 + " Jt";
  } else if (num >= 1_000) {
    return num / 1_000 + " K";
  }
  return num;
}
