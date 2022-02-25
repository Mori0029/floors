import React, { useEffect } from "react";

import DndBackend from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

import { makeStyles, Theme, Toolbar, Paper, Typography, Grid } from "@material-ui/core";

import { useStore } from "../../store/store";

import { RunPackButton } from "../../components/Pack/RunPackButton";
import { SettingsEditButton } from "../../components/SettingsEditDialog";
import { DownloadMenu } from "../../components/Download/DownloadMenu";
import { UndoButton, RedoButton } from "../../components/HistoryButtons";
import { UploadArea } from "../../components/Upload/UploadArea";
import { Lanes } from "../../components/Lanes";

import { ViewPalletsButton } from "../../components/ViewPallets";
import { ElementsTable } from "./ElementsTable";
import { SlotTable } from "./SlotTable";
import { PalletTable } from "./PalletTable";

const useStyles = makeStyles((theme: Theme) => ({
  root: { height: "100%", padding: theme.spacing(2) },
  title: { flexGrow: 1 },
}));

export function MainPage(props: any) {
  const store = useStore();

  const classes = useStyles(props);

  if (process.env.NODE_ENV === "production") {
    usePreventNavigation(!!store.elements.length);
  }

  if (!store.elements.length) {
    return <UploadArea />;
  }

  return (
    <Grid container component="main" direction="column" wrap="nowrap" justify="center" className={classes.root}>
      <Grid container component={Paper}>
        <Grid container component={Toolbar}>
          <Grid item component={Typography} className={classes.title}>
            {store.settings.name}
          </Grid>

          <Grid item component={UndoButton} />
          <Grid item component={RedoButton} />

          <Grid item component={RunPackButton} />
          <Grid item component={ViewPalletsButton} />

          <Grid item component={SettingsEditButton} />
          <Grid item component={DownloadMenu} />
        </Grid>
      </Grid>

      <DndProvider backend={DndBackend}>
        <Lanes>
          <ElementsTable />
          <SlotTable />
          <PalletTable />
        </Lanes>
      </DndProvider>
    </Grid>
  );
}

function usePreventNavigation(prevent = true) {
  useEffect(() => {
    window.addEventListener("beforeunload", preventNavigation, false);
    window.addEventListener("unload", preventNavigation, false);

    return () => {
      window.removeEventListener("beforeunload", preventNavigation);
      window.removeEventListener("unload", preventNavigation);
    };

    function preventNavigation(event: BeforeUnloadEvent): string {
      if (prevent) {
        event.preventDefault();
      } else {
        delete event.returnValue;
      }
      return event.returnValue;
    }
  }, [prevent]);
}
