const BADGE_PREFERENCE_PREFIX = "@developer-tools";

export interface StringStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface BadgePreferenceRepository {
  load(tenantId: string): Promise<boolean>;
  save(tenantId: string, visible: boolean): Promise<void>;
}

export const getBadgePreferenceKey = (tenantId: string): string =>
  `${BADGE_PREFERENCE_PREFIX}/${tenantId}/show-badge`;

const parseBadgePreference = (storedValue: string | null): boolean => {
  if (storedValue === "false") return false;
  return true;
};

export const createBadgePreferenceRepository = (
  storage: StringStorage
): BadgePreferenceRepository => ({
  load: async (tenantId) => {
    const storedValue = await storage.getItem(getBadgePreferenceKey(tenantId));
    return parseBadgePreference(storedValue);
  },
  save: async (tenantId, visible) => {
    await storage.setItem(getBadgePreferenceKey(tenantId), String(visible));
  },
});
