import { Theme } from "@material-ui/core/styles/createMuiTheme";

import { PaletteColor } from "@material-ui/core/styles/createPalette";

declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    colors?: BlueprintColors;
  }
}

interface BlueprintColors {
  grey: PaletteColor;
  blue: PaletteColor;
  lightblue: PaletteColor;
  turquoise: PaletteColor;
  purple: PaletteColor;
  red: PaletteColor;
  yellow: PaletteColor;
  green: PaletteColor;
  pink: PaletteColor;
}

export const colors = {
  grey: "#53565A",
  blue: "#0072CE",
  lightblue: "#00A9E0",
  turquoise: "#2DCCD3",
  purple: "#6F3E91",
  red: "#D02817",
  yellow: "#E2D30B",
  green: "#00A80E",
  pink: "#F50057",
};

// export const palette: BlueprintColors = {
//   grey: {
//     light: "#75777b",
//     main: "#53565A",
//     dark: "#3a3c3e"
//   },
//   blue: {
//     light: "#338ed7",
//     main: "#0072CE",
//     dark: "#004f90"
//   },
//   lightblue: {
//     light: "#33bae6",
//     main: "#00A9E0",
//     dark: "#00769c"
//   },
//   turquoise: {
//     light: "#57d6db",
//     main: "#2DCCD3",
//     dark: "#1f8e93"
//   },
//   purple: {
//     light: "#8b64a7",
//     main: "#6F3E91",
//     dark: "#4d2b65"
//   },
//   red: {
//     light: "#d95345",
//     main: "#D02817",
//     dark: "#911c10"
//   },
//   yellow: {
//     light: "#e7db3b",
//     main: "#E2D30B",
//     dark: "#9e9307"
//   },
//   green: {
//     light: "#33b93e",
//     main: "#00A80E",
//     dark: "#007509"
//   },
//   pink: {
//     light: "#f73378",
//     main: "#F50057",
//     dark: "#ab003c"
//   }
// };

export function makePalette(theme: Theme) {
  const palette: BlueprintColors = {} as any;

  Object.entries(colors).map(([key, color]) => {
    palette[key as keyof BlueprintColors] = {
      light: shadeHex(color, theme.palette.tonalOffset),
      main: color,
      dark: shadeHex(color, -theme.palette.tonalOffset),
      contrastText: theme.palette.getContrastText(color),
    };
  });

  return palette as BlueprintColors;
}

function shadeHex(hex: string, offset: number) {
  const [, ...rgbHex] = hex.match(/^#(..)(..)(..)$/);
  const rgb = rgbHex
    .map((val) => parseInt(val, 16))
    .map((val) => Math.round((val += val * offset)))
    .map((val) => val.toString(16));
  return `#${rgb.join("")}`;
}
