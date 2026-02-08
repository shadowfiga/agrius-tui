import type { Crop } from "./types.ts";
import { CropType } from "./types.ts";

const ceresWheat: Crop = {
  type: CropType.ceresWheat,
  name: "Ceres Wheat",
  emoji: "🌾",
  tier: 1,
  baseGrowSec: 6,
  baseYield: 3,
  basePrice: 1,
};

const orbitalKelp: Crop = {
  type: CropType.orbitalKelp,
  name: "Orbital Kelp",
  emoji: "🪸",
  tier: 1,
  baseGrowSec: 10,
  baseYield: 3,
  basePrice: 2,
};

const regolithTuber: Crop = {
  type: CropType.regolithTuber,
  name: "Regolith Tuber",
  emoji: "🥔",
  tier: 1,
  baseGrowSec: 14,
  baseYield: 3,
  basePrice: 3,
  unlockId: "lab_regolith_ag",
};

const solTomato: Crop = {
  type: CropType.solTomato,
  name: "Sol Tomato",
  emoji: "🍅",
  tier: 1,
  baseGrowSec: 18,
  baseYield: 5,
  basePrice: 2,
  unlockId: "lab_sol_cultivars",
};

const bioAlgae: Crop = {
  type: CropType.bioAlgae,
  name: "Bio-Algae",
  emoji: "🧫",
  tier: 2,
  baseGrowSec: 12,
  baseYield: 2,
  basePrice: 4,
  unlockId: "lab_bio_basics",
};

const mycoSpores: Crop = {
  type: CropType.mycoSpores,
  name: "Myco Spores",
  emoji: "🍄",
  tier: 2,
  baseGrowSec: 22,
  baseYield: 4,
  basePrice: 5,
  unlockId: "lab_myco_culture",
};

const cactoidPods: Crop = {
  type: CropType.cactoidPods,
  name: "Cactoid Pods",
  emoji: "🌵",
  tier: 2,
  baseGrowSec: 26,
  baseYield: 2,
  basePrice: 6,
  unlockId: "lab_arid_genetics",
};

const novaBiofruit: Crop = {
  type: CropType.novaBiofruit,
  name: "Nova Biofruit",
  emoji: "🍎",
  tier: 3,
  baseGrowSec: 40,
  baseYield: 2,
  basePrice: 10,
  unlockId: "lab_nova_strains",
};

export const CROPS: Crop[] = [
  ceresWheat,
  orbitalKelp,
  regolithTuber,
  solTomato,
  bioAlgae,
  mycoSpores,
  cactoidPods,
  novaBiofruit,
];

export const DATA = {
  CROPS,
};
