function toVal(mix: unknown): string {
  if (typeof mix === "string" || typeof mix === "number") return mix.toString();

  const res: string[] = [];

  if (Array.isArray(mix)) {
    for (let i = 0; i < mix.length; i++) {
      const val = toVal(mix[i]);
      if (val) res.push(val);
    }
  } else if (typeof mix === "object" && mix !== null) {
    for (const key in mix) {
      if (
        Object.prototype.hasOwnProperty.call(mix, key) &&
        (mix as Record<string, unknown>)[key]
      ) {
        res.push(key);
      }
    }
  }

  return res.join(" ");
}

export function cn(...rest: unknown[]): string | undefined {
  const res: string[] = [];

  for (let i = 0; i < rest.length; i++) {
    const val = toVal(rest[i]);
    if (val) res.push(val);
  }

  if (res.length === 0) return undefined;

  return res.join(" ");
}

export default cn;
