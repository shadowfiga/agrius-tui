import type { FC } from "react";
import {
  type NavigationState,
  navigationStateLabelMap,
  navigationStateValues,
} from "./navigation-state.ts";
import { colors } from "./colors.ts";
import { TextAttributes } from "@opentui/core";

export interface NavProps {
  state: NavigationState;
  setState: (state: NavigationState) => void;
}

export const Nav: FC<NavProps> = (props) => {
  const { state } = props;
  return (
    <box flexDirection="row" gap={1}>
      {navigationStateValues.map((s) => (
        <box
          key={s}
          paddingLeft={1}
          paddingRight={1}
          borderColor={state === s ? colors.white : colors.dim}
        >
          <text
            attributes={state === s ? TextAttributes.BOLD : TextAttributes.DIM}
          >
            {navigationStateLabelMap[s]}
          </text>
        </box>
      ))}
    </box>
  );
};
