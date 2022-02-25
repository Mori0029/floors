import { ElementModel, SettingsModel } from "./models";
import { defaultSettings } from "./defaultSettings";

import { placeOnArea } from "./placeOnArea";

export function placeElements(
  elements: ElementModel[] = [],
  settings: SettingsModel = defaultSettings,
): ElementModel[] {
  const { verticalPadding, maxPalletWidth, maxPalletLength } = settings;

  if (elements.length <= 1) {
    return elements.map((element) => ({
      ...element,
      pos: { x: 0, y: 0, z: 0 },
    }));
  }

  if (elements.every((element) => element.width > maxPalletWidth / 2)) {
    let x = 0;
    const width = Math.max(...elements.map((element) => element.width));
    return elements.map(
      (element: ElementModel): ElementModel => {
        const y = (width - element.width) / 2;
        const pos = { x, y, z: 0 };
        x += element.length + verticalPadding;
        return { ...element, pos };
      },
    );
  }

  return placeOnArea(elements, {
    max: { x: maxPalletLength, y: maxPalletWidth },
    padding: verticalPadding,
  });
}
