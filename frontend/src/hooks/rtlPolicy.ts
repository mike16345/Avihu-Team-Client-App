import type { TenantLocalization } from "../../config/tenants/types";

export const isTenantLayoutDirectionSatisfied = (
  localization: TenantLocalization,
  isRTL: boolean
): boolean => {
  if (localization.forcesRtl) return isRTL;
  if (!localization.supportsRtl) return !isRTL;
  return true;
};
