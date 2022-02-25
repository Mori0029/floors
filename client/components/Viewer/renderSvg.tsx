import React from "react";

import { makeStyles, Theme } from "@material-ui/core";

import { StoreModel, PalletModel, SlotModel, ElementModel } from "../../store/models";

import { maxPalletHeight, palletFrame } from "../../constants";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontFamily: "monospace",
    fontSize: 24,
    "& rect": { strokeWidth: 1, fill: "none" },
    "& rect.dashed": { strokeDasharray: 10 },
    "& rect.pallet": { stroke: theme.palette.colors.blue.main },
    "& rect.element": { stroke: theme.palette.colors.green.main },
    "& text": { fill: theme.palette.colors.grey.main },
    "& text.slot": { fill: theme.palette.colors.green.main },
    "& text.pallet": { fill: theme.palette.colors.blue.main },
  },
}));

const $scale = (value: number) => value / 5;

export function renderSvg(store: StoreModel) {
  const { pallets } = store;

  const content = pallets.map(drawPallet());

  return content;
}

function drawPallet() {
  const classes = useStyles({});

  return (pallet: PalletModel) => {
    return (
      <svg
        className={classes.root}
        key={pallet.id}
        viewBox={[-200, -5, $scale(pallet.length) + 600, $scale(maxPalletHeight) + 350].join(" ")}
      >
        <g transform={`translate(${$scale(pallet.length - palletFrame.length) / 2} ${$scale(maxPalletHeight)})`}>
          <rect className="pallet" width={$scale(palletFrame.length)} height={$scale(palletFrame.height)} />
        </g>
        <g>
          <rect className="pallet dashed" width={$scale(pallet.length)} height={$scale(maxPalletHeight)} />
          <text className="pallet" x={$scale(pallet.length + 100)} y={$scale(maxPalletHeight) / 2}>
            {pallet.name} {pallet.weight}kg
          </text>
          <g transform={`translate(0 ${$scale(maxPalletHeight + palletFrame.height)})`}>
            {pallet.slots.map(drawSlot())}
          </g>
        </g>
      </svg>
    );
  };
}

function drawSlot() {
  return (slot: SlotModel) => {
    const x = $scale(slot.pos.x);
    const z = $scale(-slot.pos.z);

    return (
      <g id={slot.name} key={slot.id} transform={`translate(${x} ${z})`}>
        <text
          className="slot"
          x={$scale(-200) - x}
          y={$scale(slot.height) / -2}
          textAnchor="end"
          alignmentBaseline="central"
        >
          {slot.name} {slot.weight}kg
        </text>
        {slot.elements.map(drawElement())}
      </g>
    );
  };
}

function drawElement() {
  return (element: ElementModel) => {
    const x = $scale(element.pos.x);
    const z = $scale(element.pos.z - element.height);

    return (
      <g id={element.name} key={element.id} transform={`translate(${x} ${z})`}>
        <rect className="element" width={$scale(element.length)} height={$scale(element.height)} />
        <text
          x={$scale(element.length) / 2}
          y={$scale(element.height) / 2}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {element.name} {element.weight}kg
        </text>
      </g>
    );
  };
}
