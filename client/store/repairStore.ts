import { v4 as uuid } from "uuid";

import { defaultSettings } from "./defaultSettings";

import { PartialStoreModel, StoreModel, PalletModel, SettingsModel, ElementModel, SlotModel } from "./models";

import { repairElements } from "./repairElements";
import { repairSlots } from "./repairSlots";
import { repairPallets } from "./repairPallets";

export function repairStore(store: PartialStoreModel): StoreModel {
  const id = store.id || uuid();
  const type = "floors";

  const settings: SettingsModel = repairSettings(store.settings);

  const elements: ElementModel[] = repairElements({
    elements: store.elements || [],
  });

  const slots: SlotModel[] = repairSlots({
    elements,
    slots: store.slots || [],
    settings,
  });

  const pallets: PalletModel[] = repairPallets({
    elements,
    slots,
    pallets: store.pallets || [],
    settings,
  });

  return { id, type, elements, slots, pallets, settings };
}

export function repairSettings(partial: Partial<SettingsModel>): SettingsModel {
  const settings = { ...defaultSettings, ...partial };

  Object.keys(settings).forEach((key: keyof SettingsModel) => {
    if (!(key in defaultSettings)) {
      delete settings[key];
    }
  });

  return settings;
}
