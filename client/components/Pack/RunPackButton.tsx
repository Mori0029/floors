import React, { useState, ReactNode } from "react";

import { CircularProgress, IconButton } from "@material-ui/core";

import RunPackIcon from "@material-ui/icons/DirectionsRun";

import { useStore } from "../../store/store";

import { runPack } from "./runPack";

export function RunPackButton(): ReactNode {
  const [running, setRunning] = useState(false);

  const store = useStore();

  return (
    <span>
      <IconButton
        color={!store.pallets?.length ? "primary" : "default"}
        disabled={!store.elements?.length}
        onClick={handlePack}
      >
        {running ? <CircularProgress size="small" /> : <RunPackIcon />}
      </IconButton>
    </span>
  );

  async function handlePack() {
    setRunning(true);
    store.upsert(await runPack(store));
    setRunning(false);
  }
}
