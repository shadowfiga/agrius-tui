// game.ts
import type { KeyEvent } from "@opentui/core";
import type { Plot } from "./plot.ts";
import { CropType, type Crop } from "./types.ts";
import { DATA } from "./data.ts";

export type GameIntent =
  | { type: "NONE" }
  | { type: "QUIT" }
  | { type: "CREDIT_CLICK" }
  | { type: "INVENTORY_CHANGED" };

export type Inventory = Record<string, number>;

export type SaveState = {
  credits: number;
  inventory: Inventory;
  selectedCrop: CropType;
};

export class Game {
  public credits: number = 0;

  // Basic inventory for crops (keyed by CropType string)
  public inventory: Inventory = {};

  // Which crop is currently “focused” (used later for automation/recipes/etc.)
  public selectedCrop: CropType = CropType.ceresWheat;

  // Cache crop lookup for quick access
  private cropsByType: Record<string, Crop> = {};

  private lastTickAtMs: number = 0;
  private requireTickWindow: boolean = false;
  private tickWindowMs: number = 150;
  private spaceDebounceMs: number = 120;
  private lastSpaceAcceptedAtMs: number = 0;

  public plots: Plot[] = [];

  public constructor() {
    for (const c of DATA.CROPS) {
      this.cropsByType[c.type] = c;
    }

    // Seed inventory keys so UI can show 0s without undefined checks
    for (const c of DATA.CROPS) {
      this.inventory[c.type] = 0;
    }
  }

  public tick(dt: number): void {
    this.lastTickAtMs = Date.now();

    // Later: advance plots, machines, market, etc.
    void dt;
  }

  public serialize(): SaveState {
    return {
      credits: this.credits,
      inventory: this.inventory,
      selectedCrop: this.selectedCrop,
    };
  }

  public load(state: SaveState | null): void {
    if (state === null) {
      return;
    }

    if (typeof state.credits === "number") {
      this.credits = state.credits;
    }

    if (state.inventory) {
      // Merge to preserve any new crop keys added in future versions
      for (const c of DATA.CROPS) {
        const key = c.type;
        const value = state.inventory[key];

        if (typeof value === "number") {
          this.inventory[key] = value;
        } else {
          if (typeof this.inventory[key] !== "number") {
            this.inventory[key] = 0;
          }
        }
      }
    }

    if (state.selectedCrop) {
      this.selectedCrop = state.selectedCrop;
    }
  }

  public getCrop(type: CropType): Crop {
    const crop = this.cropsByType[type];

    if (!crop) {
      // Defensive fallback; should never happen if DATA.CROPS includes all enums
      return DATA.CROPS[0];
    }

    return crop;
  }

  public addCropToInventory(type: CropType, amount: number): void {
    if (!this.inventory[type] && this.inventory[type] !== 0) {
      this.inventory[type] = 0;
    }

    this.inventory[type] += amount;

    if (this.inventory[type] < 0) {
      this.inventory[type] = 0;
    }
  }

  public sellCrop(type: CropType, amount: number): void {
    const crop = this.getCrop(type);

    if (!this.inventory[type] && this.inventory[type] !== 0) {
      this.inventory[type] = 0;
    }

    const available = this.inventory[type];
    const toSell = Math.max(0, Math.min(available, amount));

    if (toSell <= 0) {
      return;
    }

    this.inventory[type] = available - toSell;
    this.credits += toSell * crop.basePrice;
  }

  private isInTickWindow(nowMs: number): boolean {
    if (!this.lastTickAtMs) {
      return false;
    }
    if (nowMs - this.lastTickAtMs > this.tickWindowMs) {
      return false;
    }
    return true;
  }

  private canAcceptSpace(nowMs: number): boolean {
    if (this.lastSpaceAcceptedAtMs) {
      if (nowMs - this.lastSpaceAcceptedAtMs < this.spaceDebounceMs) {
        return false;
      }
    }

    if (this.requireTickWindow) {
      if (!this.isInTickWindow(nowMs)) {
        return false;
      }
    }

    return true;
  }

  public keyboard(e: KeyEvent): GameIntent {
    const name: string = e.name;

    if (name === "q") {
      return { type: "QUIT" };
    }

    // Space: MVP action = add one unit of the selected crop to inventory.
    // This replaces the old “+credits” test input with “farming output”.
    if (name === "space") {
      const nowMs: number = Date.now();

      if (!this.canAcceptSpace(nowMs)) {
        return { type: "NONE" };
      }

      this.lastSpaceAcceptedAtMs = nowMs;

      const crop = this.getCrop(this.selectedCrop);
      const yieldAmount = crop.baseYield;

      this.addCropToInventory(this.selectedCrop, yieldAmount);

      return { type: "INVENTORY_CHANGED" };
    }

    // Optional: number keys to change selected crop quickly (1–8)
    if (name === "1") {
      this.selectedCrop = DATA.CROPS[0].type;
      return { type: "NONE" };
    }
    if (name === "2") {
      this.selectedCrop = DATA.CROPS[1].type;
      return { type: "NONE" };
    }
    if (name === "3") {
      this.selectedCrop = DATA.CROPS[2].type;
      return { type: "NONE" };
    }
    if (name === "4") {
      this.selectedCrop = DATA.CROPS[3].type;
      return { type: "NONE" };
    }
    if (name === "5") {
      this.selectedCrop = DATA.CROPS[4].type;
      return { type: "NONE" };
    }
    if (name === "6") {
      this.selectedCrop = DATA.CROPS[5].type;
      return { type: "NONE" };
    }
    if (name === "7") {
      this.selectedCrop = DATA.CROPS[6].type;
      return { type: "NONE" };
    }
    if (name === "8") {
      this.selectedCrop = DATA.CROPS[7].type;
      return { type: "NONE" };
    }

    return { type: "NONE" };
  }
}
