// hooks/use-game.ts
import { useEffect, useRef, useState } from "react";
import { useKeyboard } from "@opentui/react";
import type { KeyEvent } from "@opentui/core";

import { Game, type GameIntent, type SaveState } from "../game/game.ts";
import { loadSave } from "../game/persistence.ts";
import { logKeyEvent } from "../logger.ts";
import { useTicker } from "./use-ticker.ts";

export type UseGameOptions = {
  tickMs?: number;
  autosaveMs?: number;
  logKeys?: boolean;
  onTab?: () => void; // global handler callback
};

export type UseGameResult = {
  game: Game;
  loaded: boolean;
  version: number;
  saveNow: () => Promise<void>;
};

export function useGame(options: UseGameOptions = {}): UseGameResult {
  const tickMs = options.tickMs ?? 50;
  const autosaveMs = options.autosaveMs ?? 3000;
  const logKeys = options.logKeys ?? true;

  const gameRef = useRef<Game>(new Game());
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState(0);

  useTicker(gameRef, tickMs);

  useEffect(() => {
    const run = async (): Promise<void> => {
      const saved: SaveState | null = await loadSave<SaveState>();
      gameRef.current.load(saved);
      setLoaded(true);
      setVersion((v) => v + 1);
    };

    void run();
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    let inFlight = false;

    const id: NodeJS.Timeout = setInterval(() => {
      if (inFlight) {
        return;
      }
      inFlight = true;

      void gameRef.current
        .save()
        .catch(() => {
          // ignore in MVP
        })
        .finally(() => {
          inFlight = false;
        });
    }, autosaveMs);

    return () => {
      clearInterval(id);
    };
  }, [loaded, autosaveMs]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    const onSigint = (): void => {
      void gameRef.current.save().finally(() => {
        process.exit(0);
      });
    };

    process.once("SIGINT", onSigint);

    return () => {
      process.off("SIGINT", onSigint);
    };
  }, [loaded]);

  const saveNow = async (): Promise<void> => {
    await gameRef.current.save();
    setVersion((v) => v + 1);
  };

  useKeyboard((event: KeyEvent) => {
    if (logKeys) {
      void logKeyEvent(event);
    }

    // 1) Global handlers first
    if (event.name === "tab") {
      if (options.onTab) {
        options.onTab();
      }
      setVersion((v) => v + 1);
      return;
    }

    if (event.name === "q") {
      void gameRef.current.save().finally(() => {
        process.exit(0);
      });
      return;
    }

    // 2) Game-level handler (screen-specific)
    const intent: GameIntent = gameRef.current.keyboard(event);

    if (intent.type !== "NONE") {
      setVersion((v) => v + 1);
    }
  });

  return {
    game: gameRef.current,
    loaded,
    version,
    saveNow,
  };
}
