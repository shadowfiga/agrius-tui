// game.ts
import type { KeyEvent } from "@opentui/core";

export type GameIntent =
    | { type: "NONE" }
    | { type: "QUIT" }
    | { type: "CREDIT_CLICK" };

export type SaveState = {
    credits: number;
};

export class Game {
    public credits: number = 0;
    private lastTickAtMs: number = 0;
    private requireTickWindow: boolean = false;
    private tickWindowMs: number = 150;
    private spaceDebounceMs: number = 120;
    private lastSpaceAcceptedAtMs: number = 0;

    public tick(dt: number): void {
        this.lastTickAtMs = Date.now();
        void dt;
    }

    public serialize(): SaveState {
        return { credits: this.credits };
    }

    public load(state: SaveState | null): void {
        if (state === null) {
            return;
        }
        if (typeof state.credits === "number") {
            this.credits = state.credits;
        }
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

        if (name === "space") {
            const nowMs: number = Date.now();

            if (!this.canAcceptSpace(nowMs)) {
                return { type: "NONE" };
            }

            this.lastSpaceAcceptedAtMs = nowMs;
            this.credits += 1;
            return { type: "CREDIT_CLICK" };
        }

        return { type: "NONE" };
    }
}
