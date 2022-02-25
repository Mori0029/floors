import React, { ReactNode, useState, useCallback } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  IconButton,
  DialogProps,
  DialogTitleProps,
  DialogContentProps,
  DialogActionsProps,
  Tooltip,
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/CheckOutlined";
import ResetIcon from "@material-ui/icons/SettingsBackupRestoreOutlined";

import { ValueOrFunction, valueOrFunction } from "../utils/valueOrFunction";

const useStyles = makeStyles(() => ({
  fabs: { position: "absolute", top: 0, right: 0 },
}));

export { CloseIcon, SaveIcon, ResetIcon };

export function BasicDialog(props: {
  open: boolean;
  onClose: () => void;

  title: ValueOrFunction<ReactNode>;
  children: unknown;
  fabs?: unknown;

  dialogProps?: Partial<DialogProps>;
  titleProps?: Partial<DialogTitleProps>;
  contentProps?: Partial<DialogContentProps>;
  actionsProps?: Partial<DialogActionsProps>;
}) {
  const classes = useStyles(props);

  return (
    <Dialog open={props.open} onClose={props.onClose} {...props.dialogProps}>
      <DialogTitle {...props.titleProps}>{valueOrFunction(props.title)}</DialogTitle>

      <DialogContent {...props.contentProps}>{props.children}</DialogContent>

      <DialogActions className={classes.fabs} {...props.actionsProps}>
        {Boolean(props.fabs) && props.fabs}

        <Tooltip title="close">
          <IconButton onClick={props.onClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}

export function useOpen(props: { onOpen?: () => void; onClose?: () => void } = {}) {
  const { onOpen, onClose } = props;

  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    onOpen && onOpen();
    setOpen(true);
  }, [onOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose && onClose();
  }, [onClose]);

  return { open, handleOpen, handleClose };
}
