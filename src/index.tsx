// main.tsx
import React, { useEffect, useRef, useState } from "react";
import { createCliRenderer, TextAttributes } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { performance } from "node:perf_hooks";
import {Game} from "./game/game.ts";

function useTicker(gameRef: React.RefObject<Game>, stepMs = 100) {
    const [, force] = useState(0);

    useEffect(() => {
        if (!gameRef.current) return;

        let last = performance.now();

        const id = setInterval(() => {
            const now = performance.now();
            let dtSec = (now - last) / 1000;
            last = now;

            // Clamp dt to avoid huge jumps (sleep/debugger)
            dtSec = Math.min(dtSec, 0.25);

            gameRef.current!.tick(dtSec);

            // Re-render on each tick (or throttle if you want)
            force((x) => x + 1);
        }, stepMs);

        return () => clearInterval(id);
    }, [gameRef, stepMs]);
}

function App() {
    const gameRef = useRef<Game>(new Game);

    // 10 FPS tick/render (100ms). For 20 FPS use 50ms.
    useTicker(gameRef as React.RefObject<Game>, 50);

    const game = gameRef.current!;

    return (
        <box flexDirection="column" padding={1} flexGrow={1}>
            <box flexDirection="row" justifyContent="space-between">
                <text attributes={TextAttributes.BOLD}>Agrius</text>
                <box flexDirection="row" gap={1} justifyContent="space-between">
                    <text attributes={TextAttributes.DIM}>
                        Credits: {game.credits.toFixed(1)}
                    </text>
                    <text attributes={TextAttributes.DIM}>
                        Credits: {game.credits.toFixed(1)}
                    </text>
                </box>
            </box>

            <box flexGrow={1} alignItems="center" justifyContent="center">
                <box flexDirection="column" alignItems="center">
                    <ascii-font font="tiny" text="OpenTUI" />
                    <text attributes={TextAttributes.DIM}>What will you build?</text>
                </box>
            </box>
        </box>
    );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
