import React, { ReactNode } from "react";

import { IconButton, Badge, Tooltip } from "@material-ui/core";

import { Undo as UndoIcon, Redo as RedoIcon } from "@material-ui/icons";

import { useStore } from "../store/store";

export function UndoButton(): ReactNode {
  const store = useStore();

  return (
    <Tooltip title="undo">
      <IconButton component="div" onClick={() => store.undo()} disabled={!store.undos}>
        <Badge badgeContent={store.undos} color="default">
          <UndoIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

export function RedoButton(): ReactNode {
  const store = useStore();

  return (
    <Tooltip title="redo">
      <IconButton component="div" onClick={() => store.redo()} disabled={!store.redos}>
        <Badge badgeContent={store.redos} color="default">
          <RedoIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
