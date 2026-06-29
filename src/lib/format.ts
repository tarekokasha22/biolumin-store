export function formatPrice(amount: number, locale: string): string {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(
    amount,
  );
  return locale === "ar" ? `${n} ج` : `${n} EGP`;
}

export function localized<T extends Record<string, unknown>>(
  obj: T,
  base: string,
  locale: string,
): string {
  const key = `${base}${locale === "ar" ? "Ar" : "En"}`;
  return (obj[key] as string) ?? "";
}
