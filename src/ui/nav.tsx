// ui/nav.tsx
import type { FC } from "react";
import {
  NavigationState,
  navigationStateLabelMap,
  navigationStateValues,
} from "./navigation-state.ts";
import { colors } from "./colors.ts";
import { TextAttributes } from "@opentui/core";
import { DATA } from "../game/data.ts";
import type { Game } from "../game/game.ts";
import { useKeyboard } from "@opentui/react";

export interface NavProps {
  state: NavigationState;
  setState: (state: NavigationState) => void;
  game: Game;
}

function formatQty(value: number): string {
  if (value < 1000) {
    return `${value}`;
  }
  if (value < 1_000_000) {
    return `${Math.floor(value / 100) / 10}k`;
  }
  return `${Math.floor(value / 100_000) / 10}m`;
}

export const Nav: FC<NavProps> = (props) => {
  const { state, setState, game } = props;

  useKeyboard((e) => {
    if (e.name === "tab") {
      const currentIdx = navigationStateValues.findIndex((s) => s === state);
      const nextState =
        navigationStateValues[(currentIdx + 1) % navigationStateValues.length]!;
      setState(nextState);
    }
  });

  return (
    <box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
    >
      <box flexDirection="row" gap={1}>
        {navigationStateValues.map((s) => (
          <box
            key={s}
            paddingLeft={1}
            paddingRight={1}
            borderColor={state === s ? colors.white : colors.dim}
          >
            <text
              attributes={
                state === s ? TextAttributes.BOLD : TextAttributes.DIM
              }
            >
              {navigationStateLabelMap[s]}
            </text>
          </box>
        ))}
      </box>

      <box flexDirection="row" gap={1} justifyContent="flex-end">
        {DATA.CROPS.map((c) => {
          const qty: number = game.inventory[c.type] ?? 0;

          return (
            <text key={c.type} attributes={TextAttributes.DIM}>
              {c.emoji} {formatQty(qty)}
            </text>
          );
        })}

        <text attributes={TextAttributes.BOLD}>
          💳 {formatQty(game.credits)}
        </text>
      </box>
    </box>
  );
};
