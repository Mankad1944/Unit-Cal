import type {
  UnitCategory,
  UnitDefinition,
  ConversionResult,
} from "@/types/calculator";

export type StandardUnitCategory = Exclude<UnitCategory, "wv" | "height">;

export const UNITS: Record<StandardUnitCategory, UnitDefinition[]> = {
  /* ====== LENGTH (base: metre) ====== */
  length: [
    { key: "km", labelEn: "Kilometre (km)", labelGu: "કિલોમીટર (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { key: "m", labelEn: "Metre (m)", labelGu: "મીટર (m)", toBase: (v) => v, fromBase: (v) => v },
    { key: "cm", labelEn: "Centimetre (cm)", labelGu: "સેન્ટિમીટર (cm)", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { key: "mm", labelEn: "Millimetre (mm)", labelGu: "મિલીમીટર (mm)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { key: "um", labelEn: "Micrometre (µm)", labelGu: "માઈક્રોમીટર (µm)", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { key: "nm", labelEn: "Nanometre (nm)", labelGu: "નેનોમીટર (nm)", toBase: (v) => v / 1e9, fromBase: (v) => v * 1e9 },
    { key: "mi", labelEn: "Mile (mi)", labelGu: "માઈલ (mi)", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    { key: "yd", labelEn: "Yard (yd)", labelGu: "યાર્ડ (yd)", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { key: "ft", labelEn: "Foot / Feet (ft)", labelGu: "ફૂટ (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { key: "in", labelEn: "Inch (in)", labelGu: "ઇંચ (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { key: "nmi", labelEn: "Nautical Mile (nmi)", labelGu: "નોટિકલ માઈલ (nmi)", toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
    { key: "ly", labelEn: "Light Year (ly)", labelGu: "પ્રકાશ-વર્ષ (ly)", toBase: (v) => v * 9.461e15, fromBase: (v) => v / 9.461e15 },
    /* Gujarati / Indian traditional */
    { key: "gaj", labelEn: "Gaj (ગજ)", labelGu: "ગજ", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144, gujarati: true },
    { key: "vaar", labelEn: "Vaar (વાર)", labelGu: "વાર", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144, gujarati: true },
    { key: "hath", labelEn: "Hath / Cubit (હાથ)", labelGu: "હાથ (ક્યુબિટ)", toBase: (v) => v * 0.4572, fromBase: (v) => v / 0.4572, gujarati: true },
    { key: "angul", labelEn: "Angul (આંગળ)", labelGu: "આંગળ", toBase: (v) => v * 0.01905, fromBase: (v) => v / 0.01905, gujarati: true },
    { key: "kos", labelEn: "Kos (કોસ)", labelGu: "કોસ", toBase: (v) => v * 3218.688, fromBase: (v) => v / 3218.688, gujarati: true },
  ],

  /* ====== AREA (base: sq metre) ====== */
  area: [
    { key: "km2", labelEn: "Sq Kilometre (km²)", labelGu: "ચો.કિ.મી (km²)", toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
    { key: "m2", labelEn: "Sq Metre (m²)", labelGu: "ચો.મી (m²)", toBase: (v) => v, fromBase: (v) => v },
    { key: "cm2", labelEn: "Sq Centimetre (cm²)", labelGu: "ચો.સે.મી (cm²)", toBase: (v) => v / 1e4, fromBase: (v) => v * 1e4 },
    { key: "mm2", labelEn: "Sq Millimetre (mm²)", labelGu: "ચો.મિ.મી (mm²)", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { key: "ha", labelEn: "Hectare (ha)", labelGu: "હેક્ટર (ha)", toBase: (v) => v * 1e4, fromBase: (v) => v / 1e4 },
    { key: "acre", labelEn: "Acre", labelGu: "એકર", toBase: (v) => v * 4046.856, fromBase: (v) => v / 4046.856 },
    { key: "mi2", labelEn: "Sq Mile (mi²)", labelGu: "ચો.માઈલ (mi²)", toBase: (v) => v * 2.590e6, fromBase: (v) => v / 2.590e6 },
    { key: "yd2", labelEn: "Sq Yard (yd²)", labelGu: "ચો.યાર્ડ (yd²)", toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127 },
    { key: "ft2", labelEn: "Sq Foot (ft²)", labelGu: "ચો.ફૂટ (ft²)", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
    { key: "in2", labelEn: "Sq Inch (in²)", labelGu: "ચો.ઇંચ (in²)", toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
    /* Gujarati traditional */
    { key: "vaar2", labelEn: "Vaar (sq) (વાર²)", labelGu: "ચો.વાર (વાર²)", toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127, gujarati: true },
    { key: "vigha", labelEn: "Vigha (વીઘા)", labelGu: "વીઘા", toBase: (v) => v * 1618.74, fromBase: (v) => v / 1618.74, gujarati: true },
    { key: "gooth", labelEn: "Gooth / Guntha (ગૂઠ)", labelGu: "ગૂઠ (ગુંઠ)", toBase: (v) => v * 101.171, fromBase: (v) => v / 101.171, gujarati: true },
    { key: "chors", labelEn: "Chors (ચોરસ)", labelGu: "ચોરસ", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903, gujarati: true },
    { key: "biswa", labelEn: "Biswa (બિસ્વા)", labelGu: "બિસ્વા", toBase: (v) => v * 125.418, fromBase: (v) => v / 125.418, gujarati: true },
    { key: "ropani", labelEn: "Ropani (રોપની)", labelGu: "રોપની", toBase: (v) => v * 508.737, fromBase: (v) => v / 508.737, gujarati: true },
  ],

  /* ====== WEIGHT (base: kilogram) ====== */
  weight: [
    { key: "t", labelEn: "Metric Ton (t)", labelGu: "મે. ટ (t)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { key: "kg", labelEn: "Kilogram (kg)", labelGu: "કિ.ગ્રા (kg)", toBase: (v) => v, fromBase: (v) => v },
    { key: "g", labelEn: "Gram (g)", labelGu: "ગ્રામ (g)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { key: "mg", labelEn: "Milligram (mg)", labelGu: "મિ.ગ્રા (mg)", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { key: "ug", labelEn: "Microgram (µg)", labelGu: "માઈ.ગ્રા (µg)", toBase: (v) => v / 1e9, fromBase: (v) => v * 1e9 },
    { key: "lb", labelEn: "Pound (lb)", labelGu: "પાઉન્ડ (lb)", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { key: "oz", labelEn: "Ounce (oz)", labelGu: "ઔંસ (oz)", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { key: "stone", labelEn: "Stone (st)", labelGu: "સ્ટોન (st)", toBase: (v) => v * 6.35029, fromBase: (v) => v / 6.35029 },
    { key: "ton_uk", labelEn: "Long Ton (UK)", labelGu: "લોન્ગ ટન (UK)", toBase: (v) => v * 1016.05, fromBase: (v) => v / 1016.05 },
    { key: "ton_us", labelEn: "Short Ton (US)", labelGu: "શોર્ટ ટન (US)", toBase: (v) => v * 907.185, fromBase: (v) => v / 907.185 },
    /* Indian / Gujarati */
    { key: "tola", labelEn: "Tola (તોલા)", labelGu: "તોલા", toBase: (v) => v * 0.011664, fromBase: (v) => v / 0.011664, gujarati: true },
    { key: "masha", labelEn: "Masha (માશા)", labelGu: "માશા", toBase: (v) => v * 0.000972, fromBase: (v) => v / 0.000972, gujarati: true },
    { key: "ratti", labelEn: "Ratti (રત્તી)", labelGu: "રત્તી", toBase: (v) => v * 0.0001215, fromBase: (v) => v / 0.0001215, gujarati: true },
    { key: "maund", labelEn: "Maund (મણ)", labelGu: "મણ", toBase: (v) => v * 37.3242, fromBase: (v) => v / 37.3242, gujarati: true },
    { key: "seer", labelEn: "Seer (શેર)", labelGu: "શેર", toBase: (v) => v * 0.93310, fromBase: (v) => v / 0.93310, gujarati: true },
  ],

  /* ====== VOLUME (base: litre) ====== */
  volume: [
    { key: "m3", labelEn: "Cubic Metre (m³)", labelGu: "ઘ.મીટર (m³)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { key: "L", labelEn: "Litre (L)", labelGu: "લીટર (L)", toBase: (v) => v, fromBase: (v) => v },
    { key: "mL", labelEn: "Millilitre (mL)", labelGu: "મિ.લી (mL)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { key: "cm3", labelEn: "Cubic Centimetre (cc)", labelGu: "ઘ.સે.મી (cc)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { key: "galUS", labelEn: "Gallon US (gal)", labelGu: "ગેલન US", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    { key: "galUK", labelEn: "Gallon UK (imp gal)", labelGu: "ગેલન UK", toBase: (v) => v * 4.54609, fromBase: (v) => v / 4.54609 },
    { key: "qt", labelEn: "Quart (qt)", labelGu: "ક્વોર્ટ (qt)", toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
    { key: "pt", labelEn: "Pint (pt)", labelGu: "પાઇન્ટ (pt)", toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
    { key: "cup", labelEn: "Cup (US)", labelGu: "કપ (US)", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
    { key: "fl_oz", labelEn: "Fluid Ounce (fl oz)", labelGu: "ફ્લુઇડ ઔંસ (fl oz)", toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
    { key: "tbsp", labelEn: "Tablespoon (tbsp)", labelGu: "મોટી ચમચી (tbsp)", toBase: (v) => v * 0.0147868, fromBase: (v) => v / 0.0147868 },
    { key: "tsp", labelEn: "Teaspoon (tsp)", labelGu: "નાની ચમચી (tsp)", toBase: (v) => v * 0.00492892, fromBase: (v) => v / 0.00492892 },
    { key: "ft3", labelEn: "Cubic Foot (ft³)", labelGu: "ઘ.ફૂટ (ft³)", toBase: (v) => v * 28.3168, fromBase: (v) => v / 28.3168 },
    { key: "in3", labelEn: "Cubic Inch (in³)", labelGu: "ઘ.ઇંચ (in³)", toBase: (v) => v * 0.0163871, fromBase: (v) => v / 0.0163871 },
  ],

  /* ====== TEMPERATURE ====== */
  temperature: [
    { key: "C", labelEn: "Celsius (°C)", labelGu: "સેલ્સિયસ (°C)", toBase: (v) => v, fromBase: (v) => v },
    { key: "F", labelEn: "Fahrenheit (°F)", labelGu: "ફેરનહાઇટ (°F)", toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
    { key: "K", labelEn: "Kelvin (K)", labelGu: "કેલ્વિન (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    { key: "Ra", labelEn: "Rankine (Ra)", labelGu: "રેન્કિન (Ra)", toBase: (v) => (v - 491.67) * (5 / 9), fromBase: (v) => (v + 273.15) * (9 / 5) },
  ],

  /* ====== SPEED (base: m/s) ====== */
  speed: [
    { key: "ms", labelEn: "m/s", labelGu: "મી/સેક", toBase: (v) => v, fromBase: (v) => v },
    { key: "kmh", labelEn: "km/h", labelGu: "કિ.મી/ક.", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { key: "mph", labelEn: "mph", labelGu: "માઈલ/ક.", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { key: "knot", labelEn: "Knot (kn)", labelGu: "નોટ (kn)", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    { key: "fts", labelEn: "ft/s", labelGu: "ફૂટ/સેક", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { key: "mach", labelEn: "Mach (Ma)", labelGu: "માક (Ma)", toBase: (v) => v * 343, fromBase: (v) => v / 343 },
  ],

  /* ====== TIME (base: second) ====== */
  time: [
    { key: "ms2", labelEn: "Millisecond (ms)", labelGu: "મિલીસેકન્ડ (ms)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { key: "s", labelEn: "Second (s)", labelGu: "સેકન્ડ (s)", toBase: (v) => v, fromBase: (v) => v },
    { key: "min", labelEn: "Minute (min)", labelGu: "મિનિટ (min)", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
    { key: "hr", labelEn: "Hour (hr)", labelGu: "કલાક (hr)", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    { key: "day", labelEn: "Day", labelGu: "દિવસ", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
    { key: "week", labelEn: "Week", labelGu: "અઠવાડિયું", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
    { key: "month", labelEn: "Month (30 days)", labelGu: "મહિનો (30 દિવસ)", toBase: (v) => v * 2592000, fromBase: (v) => v / 2592000 },
    { key: "year", labelEn: "Year (365 days)", labelGu: "વર્ષ (365 દિવસ)", toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
    { key: "decade", labelEn: "Decade", labelGu: "દાયકો", toBase: (v) => v * 315360000, fromBase: (v) => v / 315360000 },
    { key: "cent", labelEn: "Century", labelGu: "શતાબ્દી", toBase: (v) => v * 3153600000, fromBase: (v) => v / 3153600000 },
  ],

  /* ====== DIGITAL (base: bit) ====== */
  digital: [
    { key: "bit", labelEn: "Bit (b)", labelGu: "બિટ (b)", toBase: (v) => v, fromBase: (v) => v },
    { key: "Byt", labelEn: "Byte (B)", labelGu: "બાઇટ (B)", toBase: (v) => v * 8, fromBase: (v) => v / 8 },
    { key: "KB", labelEn: "Kilobyte (KB)", labelGu: "કિલોબાઇટ (KB)", toBase: (v) => v * 8192, fromBase: (v) => v / 8192 },
    { key: "MB", labelEn: "Megabyte (MB)", labelGu: "મેગાબાઇટ (MB)", toBase: (v) => v * 8388608, fromBase: (v) => v / 8388608 },
    { key: "GB", labelEn: "Gigabyte (GB)", labelGu: "ગીગાબાઇટ (GB)", toBase: (v) => v * 8589934592, fromBase: (v) => v / 8589934592 },
    { key: "TB", labelEn: "Terabyte (TB)", labelGu: "ટેરાબાઇટ (TB)", toBase: (v) => v * 8796093022208, fromBase: (v) => v / 8796093022208 },
    { key: "Pb", labelEn: "Petabyte (PB)", labelGu: "પેટાબાઇટ (PB)", toBase: (v) => v * 9007199254740992, fromBase: (v) => v / 9007199254740992 },
  ],
};

export function getUnit(
  category: StandardUnitCategory,
  key: string,
): UnitDefinition | undefined {
  return UNITS[category]?.find((unit) => unit.key === key);
}

export function convert(
  value: number,
  fromKey: string,
  toKey: string,
  category: StandardUnitCategory,
): number {
  const from = getUnit(category, fromKey);
  const to = getUnit(category, toKey);

  if (!from || !to || !Number.isFinite(value)) {
    return Number.NaN;
  }

  return to.fromBase(from.toBase(value));
}

export function convertAll(
  value: number,
  fromKey: string,
  category: StandardUnitCategory,
): ConversionResult[] {
  const list = UNITS[category] || [];
  return list.map((unit) => ({
    key: unit.key,
    labelEn: unit.labelEn,
    labelGu: unit.labelGu,
    result: convert(value, fromKey, unit.key, category),
  }));
}

export function parseFeetInch(input: string): number | null {
  if (!input || !input.trim()) return null;

  const value = input.trim();

  // Pattern like: 5'10" or 5'10 or 5′10″
  const pattern1 = /^(-?\d+(?:\.\d+)?)\s*['′]\s*(\d+(?:\.\d+)?)?\s*["″]?$/;
  const match1 = value.match(pattern1);
  if (match1) {
    const feet = Number(match1[1]);
    const inches = Number(match1[2] ?? 0);
    return (feet * 12 + inches) * 0.0254; // to base metres
  }

  // Pattern like: 5ft 10in or 5 feet 10 inches
  const pattern2 = /^(-?\d+(?:\.\d+)?)\s*(?:ft|feet|foot)\s*(\d+(?:\.\d+)?)?\s*(?:in|inch|inches)?$/i;
  const match2 = value.match(pattern2);
  if (match2) {
    const feet = Number(match2[1]);
    const inches = Number(match2[2] ?? 0);
    return (feet * 12 + inches) * 0.0254;
  }

  // Feet only: 5ft or 5'
  const feetOnly = value.match(/^(-?\d+(?:\.\d+)?)\s*(?:ft|feet|foot|['′])$/i);
  if (feetOnly) {
    return Number(feetOnly[1]) * 0.3048;
  }

  return null;
}

export function formatFeetInch(metres: number): string {
  if (!Number.isFinite(metres) || metres < 0) return "";
  const totalInches = metres / 0.0254;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 10) / 10;
  return `${feet}′ ${inches}″ (${feet} ft ${inches} in)`;
}
