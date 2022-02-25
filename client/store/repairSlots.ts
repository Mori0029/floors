import { SlotModel, ElementModel, SettingsModel } from "./models";
import { placeElements } from "./placeElements";

export function repairSlots(store: { elements: ElementModel[]; slots: Partial<SlotModel>[]; settings: SettingsModel }) {
  // const { verticalPadding } = store.settings;

  /** create new slots */
  const slotIds = new Set(store.slots.map(({ id }) => id));
  const newSlots = store.elements
    .filter(({ slotId }) => slotId && !slotIds.has(slotId))
    .map(({ slotId: id }) => ({ id }));

  return (
    [...store.slots, ...newSlots]
      /** remove all unused slots */
      .filter((slot) => store.elements.some(({ slotId }) => slotId === slot.id))
      .reduce(nameSlots, [])
      /** calculate slot values */
      .map(repairSlot)
      /** sort slots by sequence */
      .sort((a, b) => a.sequence - b.sequence)
      .map((element, index) => ({ ...element, sequence: index + 1 }))
  );

  function nameSlots(slots: Partial<SlotModel>[], slot: Partial<SlotModel>): Partial<SlotModel>[] {
    if (slot.name) {
      slots.push(slot);
    } else {
      const count = Math.max(0, ...slots.map(({ name }) => +name.match(/\d+/)));
      slots.push({ ...slot, name: `slot_${String(count + 1).padEnd(3, "0")}` });
    }
    return slots;
  }

  function repairSlot(slot: Partial<SlotModel>, index: number): SlotModel {
    const elements = placeElements(
      store.elements.filter(({ slotId }) => slotId === slot.id),
      store.settings,
    );

    const length = Math.max(...elements.map((element) => element.pos.x + element.length));
    const width = Math.max(...elements.map((element) => element.pos.y + element.width));
    const height = Math.max(...elements.map((element) => element.pos.z + element.height));

    const weight = elements.map((element) => element.weight).reduce((sum, val) => sum + val);

    return {
      id: slot.id,
      name: slot.name || `slot_${String(index + 1).padEnd(3, "0")}`,

      length,
      width,
      height,
      weight,

      elements,
      sequence: slot.sequence || index + 1,
      palletId: slot.palletId || null,
      pos: null,
    };
  }
}
