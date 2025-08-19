import { TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { ReactNode, useMemo } from "react";

type TabOptions<T> = {
  data: T | null | undefined;
  getLabel: (key: keyof T) => string;
  getContent: (key: keyof T, items: T[keyof T]) => ReactNode;
  forceMount?: boolean;
};

export function useTabsFromData<T extends Record<string, any>>({
  data,
  getLabel,
  getContent,
  forceMount,
}: TabOptions<T>) {
  return useMemo(() => {
    if (!data) return { tabTriggers: [], tabContent: [], tabNames: [] };

    const tabTriggers: ReactNode[] = [];
    const tabContent: ReactNode[] = [];
    const tabNames: string[] = [];

    (Object.keys(data) as Array<keyof T>).forEach((key) => {
      const label = getLabel(key);
      const items = data[key];

      tabNames.push(label);

      tabTriggers.push(<TabsTrigger key={label} label={label} value={label} />);

      tabContent.push(
        <TabsContent key={label} value={label} forceMount={forceMount}>
          {getContent(key, items)}
        </TabsContent>
      );
    });

    return { tabTriggers, tabContent, tabNames };
  }, [data, getLabel, getContent, forceMount]);
}
