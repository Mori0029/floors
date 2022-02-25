import React, { useState, useRef, ReactNode } from "react";
import { useDropzone } from "react-dropzone";

import { Theme, makeStyles, ButtonBase, Typography, CircularProgress, Grid, Paper } from "@material-ui/core";

import UploadIcon from "@material-ui/icons/Publish";

import { useStore } from "../../store/store";

import { importBuildingPartList } from "./importBuildingPartList";
import { importJson } from "./importJsonFile";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: "100%",
  },
  button: {
    padding: theme.spacing(2),
    margin: theme.spacing(4),
    width: 300,
    height: 300,
    display: "flex",
    flexFlow: "column nowrap",
    borderStyle: "dashed",
    borderWidth: 4,
    borderColor: theme.palette.colors.grey.main,
    ...theme.shape,
  },
}));

const fileAccept = [".csv", "text/csv", ".json", "application/json"].join(", ");

export function UploadArea(): ReactNode {
  const dropzone = useDropzone({ onDrop: handleDrop });
  const store = useStore();

  const [loading, setLoading] = useState(false);

  const isMounted = Boolean(useRef(null).current);
  const startLoading = () => isMounted && setLoading(true);
  const stopLoading = () => isMounted && setLoading(false);

  const classes = useStyles();

  return (
    <Grid
      container
      // component={ButtonBase}
      justify="center"
      alignItems="center"
      className={classes.root}
      {...dropzone.getRootProps()}
    >
      <Grid item component={Paper} elevation={10}>
        <ButtonBase className={classes.button}>
          {loading ? (
            <CircularProgress size="40%" thickness={3} disableShrink />
          ) : (
            <>
              <UploadIcon fontSize="large" />
              <Typography variant="button"> upload </Typography>
            </>
          )}
        </ButtonBase>
        <input {...dropzone.getInputProps()} multiple={false} accept={fileAccept} />
      </Grid>
    </Grid>
  );

  function handleClose() {
    if (confirm("do you want to leave floors?")) {
      window.location.pathname = "/";
    }
  }

  async function handleDrop(files: File[]) {
    if (loading) {
      return;
    }

    startLoading();
    const [file] = files;

    if (file.type === "text/csv" || file.name.match(/\.csv$/i)) {
      store.reset(await importBuildingPartList(file));
      return stopLoading();
    }

    if (file.type === "application/json" || file.name.match(/\.json$/i)) {
      const packout = await importJson(file);
      const type = "floors";

      if (
        packout.type === type ||
        confirm(
          [
            "W A R N I N G",
            `could not load "${file.name}"`,
            `packout type is "${packout.type}", but shuld be "${type}"`,
            `do you want to continue?`,
          ].join("\n\n"),
        )
      ) {
        store.reset(packout);
      }
      return stopLoading();
    }

    console.error("file type unknown", file);
    return stopLoading();
  }
}
