export enum aciColors {
  layer = 0,
  red = 1,
  yellow = 2,
  green = 3,
  cyan = 4,
  blue = 5,
  magenta = 6,
  white = 7,
}

export const aciHexColors = {
  [aciColors.layer]: "#000000",
  [aciColors.red]: "#ff0000",
  [aciColors.yellow]: "#ffff00",
  [aciColors.green]: "#00ff00",
  [aciColors.cyan]: "#00ffff",
  [aciColors.blue]: "#0000ff",
  [aciColors.magenta]: "#ff00ff",
  [aciColors.white]: "#ffffff",
};

export function getLayerColor(n: number) {
  switch (n % 6) {
    case 0:
      return aciColors.red;
    case 1:
      return aciColors.blue;
    case 2:
      return aciColors.magenta;
    case 3:
      return aciColors.cyan;
    case 4:
      return aciColors.yellow;
    case 5:
      return aciColors.green;
    default:
      return aciColors.layer;
  }
}
