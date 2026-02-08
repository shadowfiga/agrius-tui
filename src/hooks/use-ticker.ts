import React, {useEffect, useState} from "react";
import {Game} from "../game/game.ts";
import {performance} from "node:perf_hooks";

export function useTicker(gameRef: React.RefObject<Game>, stepMs: number = 50): void {
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
