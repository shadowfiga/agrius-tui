export enum NavigationState {
  plots = "plots",
  auction = "auction",
  research = "research",
}

export const navigationStateValues = Object.values(NavigationState);

export const navigationStateLabelMap: Record<NavigationState, string> = {
  [NavigationState.auction]: "Auction",
  [NavigationState.research]: "Research",
  [NavigationState.plots]: "Plots",
};
