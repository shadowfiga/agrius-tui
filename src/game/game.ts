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

    // If release events exist, this supports true “one per hold”
    private down: Set<string> = new Set<string>();

    // Fallback when release events do NOT exist
    private downUntil: Map<string, number> = new Map<string, number>();

    public tick(dt: number): void {
        // dt is seconds
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

    public keyboard(e: KeyEvent): GameIntent {
        const name: string = e.name;

        if (name === "q") {
            return { type: "QUIT" };
        }

        const eventType: string | undefined = (e as any).eventType;

        // Release handling (only if the runtime actually provides it)
        if (eventType === "release") {
            this.down.delete(name);
            return { type: "NONE" };
        }

        // Ignore auto-repeat
        const repeated: boolean = Boolean((e as any).repeated);
        if (repeated) {
            return { type: "NONE" };
        }

        const hasReleaseSupport: boolean = typeof eventType === "string";

        if (hasReleaseSupport) {
            if (this.down.has(name)) {
                return { type: "NONE" };
            }
            this.down.add(name);
        } else {
            // No release events: use debounce to prevent hold spam but allow re-taps.
            const now: number = Date.now();
            const until: number = this.downUntil.get(name) ?? 0;

            if (now < until) {
                return { type: "NONE" };
            }

            // Block this key briefly (tune this; 150–250ms feels right)
            this.downUntil.set(name, now + 200);
        }

        if (name === "space") {
            this.credits += 1;
            return { type: "CREDIT_CLICK" };
        }

        return { type: "NONE" };
    }
}
