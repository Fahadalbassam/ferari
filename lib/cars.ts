export type CarSpec = {
  model: string;
  price: string; // keep as string to allow SAR/USD text; photos added later via admin
  currency?: "USD" | "SAR";
};

export const carCatalog: CarSpec[] = [
  // Modern & upcoming Ferraris
  { model: "296 GTB / 296 GTS", price: "$346,950" },
  { model: "Roma Spider", price: "$279,965" },
  { model: "Amalfi (est.)", price: "$283,000" },
  { model: "12Cilindri", price: "$470,950" },
  { model: "12Cilindri Spider (est.)", price: "$510,000" },
  { model: "Purosangue", price: "$433,686" },
  { model: "SF90 (Stradale / Spider)", price: "$593,950" },
  { model: "812 GTS", price: "$433,765" },
  { model: "F8 Tributo / Spider", price: "$328,292" },
  { model: "F80 (hypercar, est.)", price: "$3,735,000" },
  { model: "849 Testarossa (est.)", price: "$540,000" },
  { model: "Daytona SP3", price: "$2,223,935" },
  { model: "Portofino M (Saudi market)", price: "SAR 979,000", currency: "SAR" },

  // Recent classics
  { model: "360 Modena", price: "$148,682" },
  { model: "F430", price: "$186,925" },
  { model: "458 Italia", price: "$225,325" },
  { model: "488 GTB", price: "$245,400" },
  { model: "Enzo", price: "≈$659,000" },
  { model: "LaFerrari", price: "≈$1,500,000" },
  { model: "LaFerrari Aperta", price: "≈$2,300,000" },
];

