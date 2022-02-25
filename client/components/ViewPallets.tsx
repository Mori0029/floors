import React, { useState, Fragment } from "react";

import { IconButton, DialogContent, Theme, Grid, useMediaQuery, Tooltip } from "@material-ui/core";

import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";

import ShowIcon from "@material-ui/icons/Visibility";
import PrevIcon from "@material-ui/icons/ArrowBackIosOutlined";
import NextIcon from "@material-ui/icons/ArrowForwardIosOutlined";

import { useStore } from "../store/store";

import { PalletViewer } from "./Viewer/PalletViewer";
import { UndoButton, RedoButton } from "./HistoryButtons";
import { BasicDialog, useOpen } from "./BasicDialog";

const breakpoint: Breakpoint = "lg";

export function ViewPalletsButton() {
  const { pallets } = useStore();

  const { open, handleOpen, handleClose } = useOpen();

  const [index, setIndex] = useState<number>(0);
  const handlePrev = () => setIndex((i) => Math.max(i - 1, 0));
  const handleNext = () => setIndex((i) => Math.min(i + 1, pallets.length - 1));

  if (index && index >= pallets.length) handlePrev();

  const pallet = pallets[index];

  const hasMaxWidth = !useMediaQuery((theme: Theme) => theme.breakpoints.up(breakpoint));

  return (
    <div>
      <IconButton onClick={handleOpen} color="primary" disabled={!pallets.length}>
        <ShowIcon />
      </IconButton>

      <BasicDialog
        open={open}
        onClose={handleClose}
        title={pallet?.name}
        fabs={
          <Fragment>
            <UndoButton />
            <RedoButton />
            <Tooltip title="previous pallet">
              <IconButton component="div" onClick={handlePrev} disabled={index <= 0}>
                <PrevIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="next pallet">
              <IconButton component="div" onClick={handleNext} disabled={index >= pallets.length - 1}>
                <NextIcon />
              </IconButton>
            </Tooltip>
          </Fragment>
        }
        dialogProps={{ maxWidth: breakpoint, fullScreen: hasMaxWidth, fullWidth: true }}
      >
        <Grid container component={DialogContent} justify="center">
          {pallet && <Grid item component={PalletViewer} pallet={pallet} />}
        </Grid>
      </BasicDialog>
    </div>
  );
}
