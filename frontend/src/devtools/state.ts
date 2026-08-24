export interface DeveloperToolsState {
  available: boolean;
  panelOpen: boolean;
  badgeVisible: boolean;
}

export interface CreateDeveloperToolsStateInput {
  available: boolean;
  persistedBadgeVisible: boolean;
}

export const createDeveloperToolsState = ({
  available,
  persistedBadgeVisible,
}: CreateDeveloperToolsStateInput): DeveloperToolsState => ({
  available,
  panelOpen: false,
  badgeVisible: available && persistedBadgeVisible,
});

export const openDeveloperToolsPanel = (state: DeveloperToolsState): DeveloperToolsState => {
  if (!state.available) return state;
  return { ...state, panelOpen: true };
};

export const closeDeveloperToolsPanel = (state: DeveloperToolsState): DeveloperToolsState => ({
  ...state,
  panelOpen: false,
});

export const setDeveloperToolsBadgeVisible = (
  state: DeveloperToolsState,
  badgeVisible: boolean
): DeveloperToolsState => {
  if (!state.available) return state;
  return { ...state, badgeVisible };
};
