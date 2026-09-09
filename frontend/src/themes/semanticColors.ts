import { getRuntimeTenant } from "@/config/runtimeTenant";
import Constants from "expo-constants";

export const semanticColors = getRuntimeTenant(Constants).theme.colors;
