// Shipping zones group governorates by courier reach / distance from Cairo.
// zone drives the delivery fee and the estimated-delivery window (see shipping.ts).
export type ShippingZone = "CAIRO" | "DELTA" | "CANAL" | "UPPER" | "REMOTE";

export const GOVERNORATES: { ar: string; en: string; zone: ShippingZone }[] = [
  { ar: "القاهرة", en: "Cairo", zone: "CAIRO" },
  { ar: "الجيزة", en: "Giza", zone: "CAIRO" },
  { ar: "القليوبية", en: "Qalyubia", zone: "CAIRO" },
  { ar: "الإسكندرية", en: "Alexandria", zone: "DELTA" },
  { ar: "الدقهلية", en: "Dakahlia", zone: "DELTA" },
  { ar: "الشرقية", en: "Sharqia", zone: "DELTA" },
  { ar: "الغربية", en: "Gharbia", zone: "DELTA" },
  { ar: "المنوفية", en: "Monufia", zone: "DELTA" },
  { ar: "البحيرة", en: "Beheira", zone: "DELTA" },
  { ar: "كفر الشيخ", en: "Kafr El Sheikh", zone: "DELTA" },
  { ar: "دمياط", en: "Damietta", zone: "DELTA" },
  { ar: "بورسعيد", en: "Port Said", zone: "CANAL" },
  { ar: "الإسماعيلية", en: "Ismailia", zone: "CANAL" },
  { ar: "السويس", en: "Suez", zone: "CANAL" },
  { ar: "الفيوم", en: "Faiyum", zone: "UPPER" },
  { ar: "بني سويف", en: "Beni Suef", zone: "UPPER" },
  { ar: "المنيا", en: "Minya", zone: "UPPER" },
  { ar: "أسيوط", en: "Asyut", zone: "UPPER" },
  { ar: "سوهاج", en: "Sohag", zone: "UPPER" },
  { ar: "قنا", en: "Qena", zone: "UPPER" },
  { ar: "الأقصر", en: "Luxor", zone: "UPPER" },
  { ar: "أسوان", en: "Aswan", zone: "UPPER" },
  { ar: "البحر الأحمر", en: "Red Sea", zone: "REMOTE" },
  { ar: "الوادي الجديد", en: "New Valley", zone: "REMOTE" },
  { ar: "مطروح", en: "Matrouh", zone: "REMOTE" },
  { ar: "شمال سيناء", en: "North Sinai", zone: "REMOTE" },
  { ar: "جنوب سيناء", en: "South Sinai", zone: "REMOTE" },
];

export function zoneForGovernorate(en: string): ShippingZone {
  return GOVERNORATES.find((g) => g.en === en)?.zone ?? "DELTA";
}
