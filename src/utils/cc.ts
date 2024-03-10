export function cc(...classes: unknown[]) {
  return classes.filter((x) => typeof x === "string").join(" ");
}
