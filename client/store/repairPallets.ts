import { PalletModel, SettingsModel, ElementModel, SlotModel } from "./models";

import { palletFrame, maxPalletWeight } from "../constants";
import { placeSlots } from "./placeSlots";

export function repairPallets(store: {
  readonly elements: ElementModel[];
  readonly slots: SlotModel[];
  readonly pallets: Partial<PalletModel>[];
  readonly settings: SettingsModel;
}): PalletModel[] {
  const { horizontalPadding, maxPalletHeight } = store.settings;

  /** create new pallets */
  const palletIds = new Set(store.pallets.map(({ id }) => id));
  const newPallets = store.slots
    .filter(({ palletId }) => palletId && !palletIds.has(palletId))
    .map(({ palletId: id }) => ({ id }));

  return (
    [...store.pallets, ...newPallets]
      /** remove all unused pallets */
      .filter((pallet) => store.slots.some(({ palletId }) => palletId === pallet.id))
      /** calculate pallet values */
      .map(repairPallet)
      /** sort pallets by sequence */
      .sort((a, b) => a.sequence - b.sequence)
      .map((element, index) => ({ ...element, sequence: index + 1 }))
  );

  function repairPallet(pallet: Partial<PalletModel>, index: number): PalletModel {
    const name = pallet.name || `pallet_${String(index + 1).padStart(3, "0")}`;

    const slots = placeSlots(
      store.slots.filter(({ palletId }) => palletId === pallet.id),
      store.settings,
    );

    const length = Math.max(...slots.map((slot) => slot.length));
    const width = Math.max(...slots.map((slot) => slot.width));

    const height =
      slots.reduce<number>((sum, slot) => sum + slot.height + horizontalPadding, slots.length && -horizontalPadding) +
      palletFrame.height;

    const weight = slots.map((slot) => slot.weight).reduce((sum, val) => sum + val, palletFrame.weight);

    const heightUtil = height / maxPalletHeight;
    const weightUtil = weight / maxPalletWeight;
    const utilization = Math.max(heightUtil, weightUtil);

    const sequence = pallet.sequence || index + 1;

    return {
      id: pallet.id,
      name,

      length,
      width,
      height,
      weight,

      slots,
      sequence,
      utilization,
      pos: null,
    };
  }
}
