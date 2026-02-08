// main.tsx
import React, { useState } from "react";
import { createCliRenderer, TextAttributes } from "@opentui/core";
import { createRoot } from "@opentui/react";

import { Nav } from "./ui/nav.tsx";
import { useGame } from "./hooks/use-game.ts";
import { NavigationState } from "./ui/navigation-state.ts";

function App(): any {
  const [state, setState] = useState<NavigationState>(NavigationState.plots);

  const { game, loaded, version } = useGame({
    tickMs: 50,
    autosaveMs: 3000,
    logKeys: true,
  });

  // ensure React re-renders when version changes
  void version;

  return (
    <box flexDirection="column" padding={1} flexGrow={1}>
      <box flexDirection="row" justifyContent="space-between">
        <box flexDirection="row" alignItems="center" gap={2}>
          <ascii-font font="tiny" text="Agrius" />
          {loaded && <text attributes={TextAttributes.BLINK}>Loaded</text>}
        </box>

        <box flexDirection="row" gap={2}>
          <text attributes={TextAttributes.DIM}>
            ${game.credits.toFixed(1)}
          </text>
        </box>
      </box>

      <Nav state={state} setState={setState} />
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
