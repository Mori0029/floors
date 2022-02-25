import { SettingsModel, SlotModel } from "./models";

import { palletFrame } from "../constants";

export function placeSlots(slots: SlotModel[], settings: SettingsModel): SlotModel[] {
  const { horizontalPadding } = settings;

  /** z cursor */
  let z = slots.reduce((sum, { height }) => sum + height + horizontalPadding, palletFrame.height + horizontalPadding);

  const maxWidth = Math.max(...slots.map((slot) => slot.width));
  const maxLength = Math.max(...slots.map((slot) => slot.length));

  return slots.map((slot) => {
    const x = (maxLength - slot.length) / 2;
    const y = (maxWidth - slot.width) / 2;
    z -= slot.height + horizontalPadding;
    return { ...slot, pos: { x, y, z } };
  });
}
