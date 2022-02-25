import React from "react";

import { createMuiTheme, MuiThemeProvider, Theme } from "@material-ui/core";
import { colors, makePalette } from "./colors";

import "./root.css";

export const theme: Theme = createMuiTheme({
  palette: {
    primary: {
      main: colors.lightblue,
    },
    secondary: {
      main: colors.blue,
    },
    error: {
      main: colors.red,
    },
  },
  typography: {},
  props: {
    MuiMenu: {
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      getContentAnchorEl: null,
    },
  },
});

theme.palette.colors = makePalette(theme);

export function ThemeProvider(props: any) {
  return <MuiThemeProvider theme={theme} {...props} />;
}

Object.defineProperty(ThemeProvider, "name", {
  value: "Blueprint Theme Provider",
});
