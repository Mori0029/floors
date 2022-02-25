import React, { useState, ChangeEvent, Fragment, useEffect, ReactNode } from "react";

import {
  IconButton,
  TextField,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextFieldProps,
  Tooltip,
} from "@material-ui/core";

import SettingsIcon from "@material-ui/icons/Settings";

import { SettingsModel } from "../store/models";
import { useStore } from "../store/store";
import { repairSettings } from "../store/repairStore";

import { mmToInch, mmToFoot } from "../utils/units";

import { useOpen, BasicDialog, ResetIcon, SaveIcon } from "./BasicDialog";

interface RowModel {
  key: keyof SettingsModel;
  label?: ReactNode;
  info?: ReactNode;
  props?: TextFieldProps;
}

export function SettingsEditButton() {
  const { open, handleOpen, handleClose } = useOpen();

  return (
    <div>
      <Tooltip title="edit settings">
        <IconButton component="div" onClick={handleOpen}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <SettingsEditDialog open={open} onClose={handleClose} />
    </div>
  );
}

export function SettingsEditDialog(props: { open: boolean; onClose: () => void }) {
  const store = useStore();

  const [settings, setSettings] = useState<SettingsModel>(store.settings);

  function handleChange(key: RowModel["key"], normal: (value: string) => unknown = (value) => value) {
    return ({ target }: ChangeEvent<HTMLInputElement>) =>
      setSettings((prev) => repairSettings({ ...prev, [key]: normal(target.value) }));
  }

  const handleSave = () => store.upsert({ settings });
  const handleReset = () => setSettings(store.settings);

  useEffect(handleReset, [props.open]);

  const rows: RowModel[] = [
    {
      key: "name",
      label: "packout name",
    },
    {
      key: "verticalPadding",
      label: "padding between floors",
      info: mmToInch(settings.verticalPadding, 1),
      props: { inputProps: { type: "number", min: 0 } },
    },
    {
      key: "horizontalPadding",
      label: "padding between slots",
      info: mmToInch(settings.horizontalPadding, 1),
      props: { inputProps: { type: "number", min: 0 } },
    },
    {
      key: "maxPalletLength",
      label: "max pallet length",
      info: mmToFoot(settings.maxPalletLength, 2),
      props: { inputProps: { type: "number", min: 0 } },
    },
    {
      key: "maxPalletWidth",
      label: "max pallet width",
      info: mmToFoot(settings.maxPalletWidth, 2),
      props: { inputProps: { type: "number", min: 0 } },
    },
    {
      key: "maxPalletHeight",
      label: "max pallet height (incl. pallet)",
      info: mmToFoot(settings.maxPalletHeight, 2),
      props: { inputProps: { type: "number", min: 0 } },
    },
  ];

  const hasChanged = !rows.every(({ key }): boolean => store.settings[key] === settings[key]);

  return (
    <BasicDialog
      open={props.open}
      onClose={props.onClose}
      title="edit settings"
      fabs={
        <Fragment>
          <Tooltip title="reset">
            <IconButton component="div" onClick={handleReset} disabled={!hasChanged}>
              <ResetIcon color={hasChanged ? "error" : "inherit"} />
            </IconButton>
          </Tooltip>
          <Tooltip title="save">
            <IconButton component="div" onClick={handleSave} disabled={!hasChanged}>
              <SaveIcon color={hasChanged ? "primary" : "inherit"} />
            </IconButton>
          </Tooltip>
        </Fragment>
      }
    >
      <Table size="small">
        <TableBody>
          {rows.map(({ key, label, info, props }, index) => (
            <TableRow key={index}>
              <TableCell>{label || key}</TableCell>
              <TableCell align="right" colSpan={Boolean(info) ? 1 : 2}>
                <TextField
                  value={settings[key]}
                  onChange={handleChange(key)}
                  error={store.settings[key] !== settings[key]}
                  margin="dense"
                  fullWidth
                  {...props}
                />
              </TableCell>
              {Boolean(info) && <TableCell align="right">{info}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BasicDialog>
  );
}
