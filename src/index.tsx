// main.tsx
import React, { useEffect, useRef, useState } from "react";
import { createCliRenderer, TextAttributes, type KeyEvent } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { performance } from "node:perf_hooks";

import { Game, type GameIntent, type SaveState } from "./game/game.ts";
import {loadSave, saveAtomic} from "./game/persistence.ts";
import {logKeyEvent} from "./logger.ts";

function useTicker(gameRef: React.RefObject<Game>, stepMs: number = 50): void {
    const [, force] = useState(0);

    useEffect(() => {
        if (gameRef.current === null) {
            return;
        }

        let last: number = performance.now();

        const id: NodeJS.Timeout = setInterval(() => {
            const now: number = performance.now();
            let dtSec: number = (now - last) / 1000;
            last = now;

            dtSec = Math.min(dtSec, 0.25);

            gameRef.current!.tick(dtSec);
            force((x) => x + 1);
        }, stepMs);

        return () => {
            clearInterval(id);
        };
    }, [gameRef, stepMs]);
}

function App(): any {
    const gameRef = useRef<Game>(new Game());
    const [, force] = useState(0);
    const [loaded, setLoaded] = useState<boolean>(false);

    useTicker(gameRef, 50);

    // Load save once
    useEffect(() => {
        const run = async (): Promise<void> => {
            const saved: SaveState | null = await loadSave<SaveState>();
            gameRef.current.load(saved);
            setLoaded(true);
            force((x) => x + 1);
        };

        void run();
    }, []);

    // Autosave every 3s (after load)
    useEffect(() => {
        if (loaded === false) {
            return;
        }

        let inFlight: boolean = false;

        const id: NodeJS.Timeout = setInterval(() => {
            if (inFlight === true) {
                return;
            }
            inFlight = true;

            void saveAtomic(gameRef.current.serialize())
                .catch(() => {
                    // swallow for MVP; you can log later if you want
                })
                .finally(() => {
                    inFlight = false;
                });
        }, 3000);

        return () => {
            clearInterval(id);
        };
    }, [loaded]);

    // Save on Ctrl+C
    useEffect(() => {
        if (!loaded) {
            return;
        }

        const onSigint = (): void => {
            void saveAtomic(gameRef.current.serialize()).finally(() => {
                process.exit(0);
            });
        };

        process.once("SIGINT", onSigint);

        return () => {
            process.off("SIGINT", onSigint);
        };
    }, [loaded]);

    // Keyboard forwarding: use game.keyboard and then act on intent
    useKeyboard((event: KeyEvent) => {
        logKeyEvent(event);

        const intent: GameIntent = gameRef.current.keyboard(event);

        if (intent.type === "CREDIT_CLICK") {
            force((x) => x + 1);
        }

        if (intent.type === "QUIT") {
            void saveAtomic(gameRef.current.serialize()).finally(() => {
                process.exit(0);
            });
        }
    });

    const game: Game = gameRef.current;

    return (
        <box flexDirection="column" padding={1} flexGrow={1}>
            <box flexDirection="row" justifyContent="space-between">
                <text attributes={TextAttributes.BOLD}>Agrius</text>
                <box flexDirection="row" gap={2}>
                    <text attributes={TextAttributes.DIM}>
                        💳 Credits: {game.credits.toFixed(1)}
                    </text>
                    <text attributes={TextAttributes.DIM}>
                        {loaded === true ? "Saved" : "Loading…"}
                    </text>
                </box>
            </box>

            <box flexGrow={1} alignItems="center" justifyContent="center">
                <box flexDirection="column" alignItems="center">
                    <ascii-font font="tiny" text="Agrius" />
                    <text attributes={TextAttributes.DIM}>
                        Press Space = +1 credit. Hold won’t repeat.
                    </text>
                    <text attributes={TextAttributes.DIM}>Press q to quit.</text>
                </box>
            </box>
        </box>
    );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
