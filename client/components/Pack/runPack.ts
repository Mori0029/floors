import { v4 as uuid } from "uuid";

import { ElementModel, SlotModel, PalletModel, StoreModel } from "../../store/models";
import { palletFrame } from "../../constants";

export function runPack(store: StoreModel) {
  const { verticalPadding = 0, maxPalletHeight } = store.settings;

  /** place elements on slots **/
  const tmpSlots: SlotModel[] = [];
  const elements: ElementModel[] = [];
  store.elements.forEach((element) => {
    const slotId = uuid();

    tmpSlots.unshift({
      id: slotId,
      name: `slot_${String(tmpSlots.length + 1).padStart(3, "0")}`,
    } as SlotModel);

    elements.push({ ...element, slotId });
  });

  /** place slots on pallets **/
  const tmpPallets: PalletModel[] = [];
  const slots: SlotModel[] = [];

  tmpSlots.reverse().forEach((slot) => {
    const existingPallet: PalletModel = tmpPallets.slice(-1).find((pallet) => {
      const palletSlots: SlotModel[] = slots.filter(({ palletId }) => pallet.id === palletId);
      const palletHeight: number = [...palletSlots, slot]
        .map(({ id }) => Math.max(...elements.filter(({ slotId }) => slotId === id).map(({ height }) => height)))
        .reduce((sum, height) => sum + height + verticalPadding, palletFrame.height - verticalPadding);

      return palletHeight <= maxPalletHeight;
    });

    if (existingPallet) {
      slots.push({ ...slot, palletId: existingPallet.id });
    } else {
      const palletId = uuid();

      tmpPallets.push({
        id: palletId,
        name: `pallet_${String(tmpPallets.length + 1).padStart(3, "0")}`,
      } as PalletModel);
      slots.push({ ...slot, palletId });
    }
  });

  return Promise.resolve({
    ...store,
    elements,
    slots,
    pallets: tmpPallets,
  });
}
