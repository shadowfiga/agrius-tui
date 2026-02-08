// hooks/use-game.ts
import { useEffect, useRef, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { type KeyEvent } from "@opentui/core";

import { Game, type SaveState } from "../game/game.ts";
import { loadSave, saveAtomic } from "../game/persistence.ts";
import { useTicker } from "./use-ticker.ts";

export type UseGameOptions = {
  tickMs?: number;
  autosaveMs?: number;
  logKeys?: boolean;
};

export type UseGameResult = {
  game: Game;
  loaded: boolean;
  version: number;
};

export function useGame(options: UseGameOptions = {}): UseGameResult {
  const tickMs: number = options.tickMs ?? 50;
  const autosaveMs: number = options.autosaveMs ?? 3000;
  const logKeys: boolean = options.logKeys ?? true;

  const gameRef = useRef<Game>(new Game());
  const [loaded, setLoaded] = useState<boolean>(false);
  const [version, setVersion] = useState<number>(0);

  // Ticker
  useTicker(gameRef, tickMs);

  // Load save once
  useEffect(() => {
    const run = async (): Promise<void> => {
      const saved: SaveState | null = await loadSave<SaveState>();
      gameRef.current.load(saved);
      setLoaded(true);
      setVersion((v) => v + 1);
    };

    void run();
  }, []);

  // Autosave
  useEffect(() => {
    if (!loaded) {
      return;
    }

    let inFlight: boolean = false;

    const id: NodeJS.Timeout = setInterval(() => {
      if (inFlight) {
        return;
      }

      inFlight = true;

      void saveAtomic(gameRef.current.serialize())
        .catch(() => {
          // ignore for MVP
        })
        .finally(() => {
          inFlight = false;
        });
    }, autosaveMs);

    return () => {
      clearInterval(id);
    };
  }, [loaded, autosaveMs]);

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

  // Keyboard → game intent
  // useKeyboard((event: KeyEvent) => {
  //   if (logKeys) {
  //     void logKeyEvent(event);
  //   }
  //
  //   const intent: GameIntent = gameRef.current.keyboard(event);
  //
  //   if (intent.type === "CREDIT_CLICK") {
  //     setVersion((v) => v + 1);
  //   }
  //
  //   if (intent.type === "QUIT") {
  //     void saveAtomic(gameRef.current.serialize()).finally(() => {
  //       process.exit(0);
  //     });
  //   }
  // });

  return {
    game: gameRef.current,
    loaded,
    version,
  };
}
