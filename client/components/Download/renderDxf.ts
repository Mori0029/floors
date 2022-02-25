import DxfDrawing from "dxf-writer";

import { StoreModel, PalletModel, SlotModel, ElementModel } from "../../store/models";

import { palletFrame } from "../../constants";
import { kgToPound, mmToFoot } from "../../utils/units";
import { getLayerColor } from "./aciColors";

interface Position {
  x: number;
  y: number;
}

interface Offsets {
  frontX?: (x?: number) => number;
  listX?: (x?: number) => number;
  sideX?: (x?: number) => number;
  topX?: (x?: number) => number;
}

export function renderDxf(store: StoreModel) {
  const { pallets } = store;

  const dxf = new DxfDrawing().setUnits("Millimeters");

  const pos: Position = { x: 0, y: 0 };

  const off: Offsets = {
    frontX: (x = 0) => x + 0e3,
    listX: (x = 0) => x + 3e3,
    sideX: (x = 0) => x + 5e3,
  };

  pallets.forEach(drawPallet(dxf, pos, off));

  return dxf.toDxfString();
}

export function renderPackoutDxf(store: StoreModel) {
  const { pallets } = store;

  const dxf = new DxfDrawing().setUnits("Millimeters");

  const pos: Position = { x: 0, y: 0 };

  const off: Offsets = { topX: (x) => x };

  pallets.forEach(drawPallet(dxf, pos, off));

  return dxf.toDxfString();
}

function drawPallet(dxf: DxfDrawing, pos: Position, off: Offsets) {
  return (pallet: PalletModel, index: number) => {
    const { x, y } = pos;

    pos.y -= Math.max(pallet.height, pallet.width) + 2e3;

    const layer = `pallet_${pallet.name}`;

    dxf.addLayer(layer, getLayerColor(index), "CONTINUOUS").setActiveLayer(layer);

    const label = `${pallet.name} ${kgToPound(pallet.weight, 2)}`;

    // dxf.drawText(x, y, 100, 0, `.${x} ${y}`);

    /** render title */
    if (off.listX) {
      const $x = off.listX(0);
      const $y = y + pallet.height + 100;
      const title = [
        pallet.name,
        kgToPound(pallet.weight, 2),
        mmToFoot(pallet.length, 2),
        mmToFoot(pallet.width, 2),
        mmToFoot(pallet.height, 2),
      ].join(" ");

      dxf.drawText($x, $y, 200, 0, title, "left", "bottom");
    }

    /** render side view */
    if (off.sideX) {
      drawLabledRect(
        dxf,
        off.sideX(x + (pallet.length - palletFrame.length) / 2),
        y,
        palletFrame.length,
        palletFrame.height,
        label,
        100,
      );
    }

    /** render front view */
    if (off.frontX) {
      drawLabledRect(
        dxf,
        off.frontX(x + (pallet.width - palletFrame.width) / 2),
        y,
        palletFrame.width,
        palletFrame.height,
        label,
        100,
      );
    }

    /** render top view */
    if (off.topX) {
      const $x = off.topX(x + pallet.width);
      const $x2 = $x - (pallet.length - palletFrame.length) / 2;

      const $y = y;
      const $y2 = $y + (pallet.width - palletFrame.width) / 2;

      const $label = pallet.name;

      drawLabledRect(dxf, $x - pallet.length, $y, pallet.length, pallet.width, $label, 300);

      drawLabledRect(dxf, $x2 - palletFrame.length, $y2, palletFrame.length, palletFrame.width);
    }

    pallet.slots.forEach(drawSlot(dxf, { x, y }, off));
  };
}

function drawSlot(dxf: DxfDrawing, pos: Position, off: Offsets) {
  return (slot: SlotModel) => {
    const $y = pos.y + slot.pos.z;

    /** render list */
    if (off.listX) {
      const $x = off.listX(pos.x);
      dxf.drawText($x, $y + slot.height / 2, 100, 0, slot.name, "left", "middle");
    }

    /** render side view */
    const sideX = off.sideX && ((v: number) => off.sideX(v + slot.pos.x));
    // if (sideX) {
    //   const $x = sideX(pos.x);
    //   dxf.drawRect($x, y, $x + slot.length, y + slot.height);
    // }

    /** render front view */
    const frontX = off.frontX && ((v: number) => off.frontX(v + slot.pos.y));
    // if (frontX) {
    //   const $x = frontX(pos.x);
    //   dxf.drawRect($x, y, $x + slot.width, y + slot.height);
    // }

    slot.elements.forEach(drawElement(dxf, { ...pos, y: $y }, { ...off, sideX, frontX }));
  };
}

function drawElement(dxf: DxfDrawing, pos: Position, off: Offsets) {
  return (element: ElementModel) => {
    const label = `${element.name} ${kgToPound(element.weight, 2)}`;
    const size = 60;

    /** render side view */
    if (off.sideX) {
      drawLabledRect(dxf, off.sideX(element.pos.x), pos.y, element.length, element.height, label, size);
    }

    /** render front view */
    if (off.frontX) {
      drawLabledRect(dxf, off.frontX(element.pos.y), pos.y, element.width, element.height, label, size);
    }
  };
}

function drawLabledRect(
  dxf: DxfDrawing,
  x: number,
  y: number,
  length: number,
  width: number,
  label: string,
  size: number,
): void;

function drawLabledRect(dxf: DxfDrawing, x: number, y: number, length: number, width: number): void;

function drawLabledRect(
  dxf: DxfDrawing,
  x: number,
  y: number,
  length: number,
  width: number,
  label?: string,
  size?: number,
) {
  label
    ?.split(/\n/)
    .forEach((line, index, lines) =>
      dxf.drawText(
        x + length / 2,
        y + width / 2 + (lines.length - 1 - index * 2) * size,
        size,
        0,
        line,
        "center",
        "middle",
      ),
    );

  dxf.drawRect(x, y, x + length, y + width);
}
