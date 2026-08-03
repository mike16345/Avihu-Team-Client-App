import { FC, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { selectionHaptic } from "@/utils/haptics";
import { ConsumedFoodEntry, MockFoodItem, NoteReminderEntry } from "./mockFoodCatalog";
import AddSmartFoodCard from "./smartMenu/AddSmartFoodCard";
import ConsumedTodayCard from "./smartMenu/ConsumedTodayCard";
import FoodPickerModal from "./smartMenu/FoodPickerModal";
import ManualFoodModal from "./smartMenu/ManualFoodModal";
import NoteReminderModal from "./smartMenu/NoteReminderModal";
import BarcodeScannerModal from "./smartMenu/BarcodeScannerModal";
import HistoryModal from "./smartMenu/HistoryModal";
import { MealTile, nextMealTile } from "./smartMenu/mealTiles";

interface SmartMenuTabV2Props {
  consumed: ConsumedFoodEntry[];
  onConsumedChange: (next: ConsumedFoodEntry[]) => void;
  mealTiles: MealTile[];
}

const generateEntryId = (): string =>
  `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const SmartMenuTabV2: FC<SmartMenuTabV2Props> = ({
  consumed,
  onConsumedChange,
  mealTiles: initialMealTiles,
}) => {
  const [mealTiles, setMealTiles] = useState<MealTile[]>(initialMealTiles);
  const [selectedMeal, setSelectedMeal] = useState<string>(initialMealTiles[0].id);

  const addMeal = (): string => {
    const newTile = nextMealTile(mealTiles);
    setMealTiles((prev) => [...prev, newTile]);
    return newTile.id;
  };
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingFood, setPendingFood] = useState<MockFoodItem | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notes, setNotes] = useState<NoteReminderEntry[]>([]);

  const openPicker = () => setPickerOpen(true);
  const closePicker = () => setPickerOpen(false);

  const openManual = () => setManualOpen(true);
  const closeManual = () => setManualOpen(false);

  const openNote = () => setNoteOpen(true);
  const closeNote = () => setNoteOpen(false);

  const openBarcode = () => setBarcodeOpen(true);
  const closeBarcode = () => setBarcodeOpen(false);

  const openHistory = () => setHistoryOpen(true);
  const closeHistory = () => setHistoryOpen(false);

  const barcodeDetected = (food: MockFoodItem) => {
    setBarcodeOpen(false);
    setPendingFood(food);
  };

  const pickFood = (food: MockFoodItem) => {
    selectionHaptic();
    setPendingFood(food);
  };

  const cancelQuantity = () => {
    setPendingFood(null);
  };

  const confirmAdd = (quantity: number, mealId: string) => {
    if (!pendingFood) return;
    onConsumedChange([
      ...consumed,
      { entryId: generateEntryId(), food: pendingFood, quantity, mealId },
    ]);
    setSelectedMeal(mealId);
    setPendingFood(null);
  };

  const confirmManual = (food: MockFoodItem, mealId: string) => {
    onConsumedChange([
      ...consumed,
      { entryId: generateEntryId(), food, quantity: 1, mealId },
    ]);
    setSelectedMeal(mealId);
    setManualOpen(false);
  };

  const confirmNote = (text: string, mealId: string) => {
    setNotes((prev) => [...prev, { entryId: generateEntryId(), text, mealId }]);
    setSelectedMeal(mealId);
    setNoteOpen(false);
  };

  const removeEntry = (entryId: string) => {
    selectionHaptic();
    onConsumedChange(consumed.filter((entry) => entry.entryId !== entryId));
  };

  const removeNote = (entryId: string) => {
    selectionHaptic();
    setNotes((prev) => prev.filter((n) => n.entryId !== entryId));
  };

  const recentFoods = useMemo(() => {
    const seen = new Set<string>();
    const out: MockFoodItem[] = [];
    for (let i = consumed.length - 1; i >= 0 && out.length < 5; i--) {
      const food = consumed[i].food;
      if (seen.has(food.id)) continue;
      seen.add(food.id);
      out.push(food);
    }
    return out;
  }, [consumed]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AddSmartFoodCard
          onOpenPicker={openPicker}
          onOpenManual={openManual}
          onOpenBarcode={openBarcode}
          onOpenHistory={openHistory}
        />
        <ConsumedTodayCard
          consumed={consumed}
          notes={notes}
          onRemove={removeEntry}
          onRemoveNote={removeNote}
          onOpenNote={openNote}
          mealTiles={mealTiles}
        />
      </ScrollView>

      <FoodPickerModal
        visible={pickerOpen}
        recent={recentFoods}
        onSelect={pickFood}
        onClose={closePicker}
        pendingFood={pendingFood}
        defaultMealId={selectedMeal}
        onQuantityCancel={cancelQuantity}
        onQuantityConfirm={confirmAdd}
        mealTiles={mealTiles}
        onAddMeal={addMeal}
      />

      <ManualFoodModal
        visible={manualOpen}
        defaultMealId={selectedMeal}
        onCancel={closeManual}
        onConfirm={confirmManual}
        mealTiles={mealTiles}
        onAddMeal={addMeal}
      />

      <NoteReminderModal
        visible={noteOpen}
        defaultMealId={selectedMeal}
        onCancel={closeNote}
        onConfirm={confirmNote}
        mealTiles={mealTiles}
        onAddMeal={addMeal}
      />

      <BarcodeScannerModal
        visible={barcodeOpen}
        onCancel={closeBarcode}
        onDetect={barcodeDetected}
      />

      <HistoryModal
        visible={historyOpen}
        onClose={closeHistory}
        mealTiles={mealTiles}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },
});

export default SmartMenuTabV2;
