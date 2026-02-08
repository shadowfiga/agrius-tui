// types.ts
export enum CropType {
  ceresWheat = "ceresWheat",
  orbitalKelp = "orbitalKelp",
  regolithTuber = "regolithTuber",
  solTomato = "solTomato",
  bioAlgae = "bioAlgae",
  mycoSpores = "mycoSpores",
  cactoidPods = "cactoidPods",
  novaBiofruit = "novaBiofruit",
}

export interface Crop {
  type: CropType;
  name: string;
  emoji: string;
  tier: number;
  baseGrowSec: number;
  baseYield: number;
  basePrice: number;
  unlockId?: string;
}
