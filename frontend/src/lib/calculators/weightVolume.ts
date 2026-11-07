import type { SubstanceDensity } from "@/types/calculator";

export const SUBSTANCES: SubstanceDensity[] = [
  { key: "water", nameEn: "Water (પાણી)", nameGu: "પાણી (Water)", density: 1000, icon: "💧" },
  { key: "milk", nameEn: "Milk (દૂધ)", nameGu: "દૂધ (Milk)", density: 1030, icon: "🥛" },
  { key: "oil", nameEn: "Cooking / Veg Oil (તેલ)", nameGu: "તેલ (Oil)", density: 920, icon: "🌻" },
  { key: "ghee", nameEn: "Desi Ghee / Butter (ઘી)", nameGu: "ઘી (Ghee)", density: 905, icon: "🧈" },
  { key: "honey", nameEn: "Pure Honey (મધ)", nameGu: "મધ (Honey)", density: 1420, icon: "🍯" },
  { key: "petrol", nameEn: "Petrol / Gasoline (પેટ્રોલ)", nameGu: "પેટ્રોલ (Petrol)", density: 740, icon: "⛽" },
  { key: "diesel", nameEn: "Diesel (ડીઝલ)", nameGu: "ડીઝલ (Diesel)", density: 832, icon: "🚛" },
  { key: "kerosene", nameEn: "Kerosene (કેરોસીન)", nameGu: "કેરોસીન (Kerosene)", density: 810, icon: "🪔" },
  { key: "sugar", nameEn: "Granulated Sugar (ખાંડ)", nameGu: "ખાંડ (Sugar)", density: 850, icon: "🍚" },
  { key: "flour", nameEn: "Wheat Flour / Atta (લોટ)", nameGu: "લોટ (Flour)", density: 590, icon: "🌾" },
];

export const MASS_UNITS: { key: string; labelEn: string; labelGu: string; toKg: number }[] = [
  { key: "kg", labelEn: "Kilogram (kg)", labelGu: "કિ.ગ્રા (kg)", toKg: 1 },
  { key: "g", labelEn: "Gram (g)", labelGu: "ગ્રામ (g)", toKg: 0.001 },
  { key: "mg", labelEn: "Milligram (mg)", labelGu: "મિ.ગ્રા (mg)", toKg: 1e-6 },
  { key: "lb", labelEn: "Pound (lb)", labelGu: "પાઉન્ડ (lb)", toKg: 0.453592 },
  { key: "oz", labelEn: "Ounce (oz)", labelGu: "ઔંસ (oz)", toKg: 0.0283495 },
  { key: "maund", labelEn: "Maund (મણ = 20 kg)", labelGu: "મણ (20 kg)", toKg: 20 },
  { key: "tola", labelEn: "Tola (તોલા = 11.66g)", labelGu: "તોલા (11.66g)", toKg: 0.011664 },
];

export const VOLUME_UNITS: { key: string; labelEn: string; labelGu: string; toLitre: number }[] = [
  { key: "L", labelEn: "Litre (L)", labelGu: "લીટર (L)", toLitre: 1 },
  { key: "mL", labelEn: "Millilitre (mL)", labelGu: "મિ.લી (mL)", toLitre: 0.001 },
  { key: "galUS", labelEn: "Gallon US (gal)", labelGu: "ગેલન US (gal)", toLitre: 3.78541 },
  { key: "cup", labelEn: "Cup (US)", labelGu: "કપ (US)", toLitre: 0.236588 },
  { key: "fl_oz", labelEn: "Fluid Ounce (fl oz)", labelGu: "ફ્લુઇડ ઔંસ (fl oz)", toLitre: 0.0295735 },
  { key: "m3", labelEn: "Cubic Metre (m³)", labelGu: "ઘ.મીટર (m³)", toLitre: 1000 },
];

export function convertWeightToVolume(
  weightAmount: number,
  massUnitKey: string,
  volumeUnitKey: string,
  densityKgPerLitre: number
): { result: number; formula: string } {
  const massUnit = MASS_UNITS.find((u) => u.key === massUnitKey) || MASS_UNITS[0];
  const volUnit = VOLUME_UNITS.find((u) => u.key === volumeUnitKey) || VOLUME_UNITS[0];

  const weightInKg = weightAmount * massUnit.toKg;
  const litres = weightInKg / densityKgPerLitre;
  const result = litres / volUnit.toLitre;

  const formula = `${weightAmount} ${massUnit.key} = ${result.toFixed(4)} ${volUnit.key} (Volume = Mass ÷ Density)`;
  return { result, formula };
}

export function convertVolumeToWeight(
  volumeAmount: number,
  volumeUnitKey: string,
  massUnitKey: string,
  densityKgPerLitre: number
): { result: number; formula: string } {
  const volUnit = VOLUME_UNITS.find((u) => u.key === volumeUnitKey) || VOLUME_UNITS[0];
  const massUnit = MASS_UNITS.find((u) => u.key === massUnitKey) || MASS_UNITS[0];

  const volumeInLitres = volumeAmount * volUnit.toLitre;
  const weightInKg = volumeInLitres * densityKgPerLitre;
  const result = weightInKg / massUnit.toKg;

  const formula = `${volumeAmount} ${volUnit.key} = ${result.toFixed(4)} ${massUnit.key} (Mass = Volume × Density)`;
  return { result, formula };
}
