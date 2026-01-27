import { TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { ReactNode, useMemo } from "react";

export type TabItem = {
  label: string;
  value: string;
  content: ReactNode;
  forceMount?: boolean;
};

export const useTabs = (tabs: TabItem[]) => {
  const { tabTriggers, tabContent, tabNames } = useMemo(() => {
    const tabTriggers = tabs.map((tab) => (
      <TabsTrigger key={tab.value} label={tab.label} value={tab.value} />
    ));

    const tabContent = tabs.map((tab) => (
      <TabsContent key={tab.value} value={tab.value} forceMount={tab.forceMount}>
        {tab.content}
      </TabsContent>
    ));

    const tabNames = tabs.map((t) => t.value);

    return { tabTriggers, tabContent, tabNames };
  }, [tabs]);

  return { tabTriggers, tabContent, tabNames };
};
