import React from "react";

import { Typography, Grid } from "@material-ui/core";

import { ThemeProvider } from "../lib/styles/theme";
import { JwtAuthProvider } from "../lib/auth/JwtAuthContext";
import { Navigation } from "../lib/components/Navigation";
import { AppInfo } from "../lib/components/Navigation/AppMenu";

import { MainPage } from "./pages/MainPage/MainPage";
import { StoreProvider } from "./store/store";

import "./logo.svg";

const helpUrl = "https://blueprintwiki.com/wiki/bprobo.com_/_floors";

export function Application() {
  return (
    <ThemeProvider>
      <JwtAuthProvider>
        <StoreProvider>
          <Grid container direction="column" wrap="nowrap" style={{ height: "100%" }}>
            <Grid item component={Navigation} apps={[] as AppInfo[]} help={{ url: helpUrl }}>
              <Typography> floors </Typography>
            </Grid>

            <Grid item style={{ flexGrow: 1, overflow: "hidden" }}>
              <MainPage />
            </Grid>
          </Grid>
        </StoreProvider>
      </JwtAuthProvider>
    </ThemeProvider>
  );
}
