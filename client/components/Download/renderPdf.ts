import { PDFDocument, StandardFonts, rgb, Color, PDFPage, PDFFont } from "pdf-lib";

import { colors } from "../../../lib/styles/colors";

import { StoreModel, PalletModel, SlotModel, ElementModel } from "../../store/models";

import { palletFrame } from "../../constants";

import { drawTable, renderAsFoot, renderAsPound, renderAsInch } from "./renderPdfTable";

/** letter 8.5 x 11 inch => 612 x 792 */
const letter: Record<string, [number, number]> = {
  portrait: [612, 792],
  landscape: [792, 612],
};

/** ledger 11 x 17 inch => 762 x 1224 */
// const ledger: Record<string, [number, number]> = {
//   portrait: [762, 1224],
//   landscape: [1224, 792]
// };

/** convert mm to pdf units 72 point = 1 inch = 25.4 mm */
export const $mm = (mm = 0) => (72 / 25.4) * mm;

/** convert hex color to rgb color */
const $color = (hex: string) => {
  const [red, green, blue] = hex
    .match(/^#(\w\w)(\w\w)(\w\w)$/)
    .slice(1, 4)
    .map((val) => +`0x${val}` / 255);
  return rgb(red, green, blue);
};

const serverUrl = process.env.SERVER_URL;
const appUrl = `${serverUrl}/floors`;

const disclaimer = `disclaimer: be aware this is a development version`;

const brGrey: Color = $color(colors.grey);
const brLightblue: Color = $color(colors.lightblue);
const brBlue: Color = $color(colors.blue);
const brGreen: Color = $color(colors.green);

export async function renderPdf(store: StoreModel) {
  const { pallets, settings } = store;

  const pdf = await PDFDocument.create();
  const monospace = await pdf.embedFont(StandardFonts.Courier);
  const fontSize = $mm(4);

  pdf.setTitle(`${settings.name}`);

  pdf.setAuthor(`blueprint robotics`);
  pdf.setSubject(`floors packout`);
  pdf.setKeywords(["packout", "floors"]);
  pdf.setProducer(`blueprint robotics inc. (https://blueprint-robotics.com/)`);
  pdf.setCreator(`floors packout (${appUrl})`);

  const date = new Date();
  pdf.setCreationDate(date);
  pdf.setModificationDate(date);

  pallets.forEach((pallet) => {
    const page = pdf.addPage(letter.portrait);

    page.setFont(monospace);
    page.setFontColor(brGrey);
    page.setFontSize(fontSize);
    page.setLineHeight($mm(5));

    const { width, height } = page.getSize();

    const $x = (val: number) => $mm(val);
    const $y = (val: number) => height - $mm(val);

    drawHeader(page, pallet);

    page.moveTo($x(10), $y(30));
    drawTable(
      page,
      [pallet],
      [
        { key: "name" },
        { key: "length", align: "right", render: renderAsFoot },
        { key: "width", align: "right", render: renderAsFoot },
        { key: "height", align: "right", render: renderAsFoot },
        { key: "weight", align: "right", render: renderAsPound },
      ],
      {
        fontFamily: monospace,
        fontSize: $mm(5),
        rowHeight: $mm(7),
        width: width - $mm(20),
      },
    );

    page.moveTo($x(10), $y(50));

    const pal = drawPallet(page, pallet, width - $mm(20), $mm(100));
    page.moveDown(pal.height);

    page.moveDown($mm(20));
    drawTable(
      page,
      pallet.slots
        .flatMap((slot) =>
          slot.elements.map((element) => ({
            ...element,
            slotName: slot.name,
            ps: pallet.slots.length - pallet.slots.indexOf(slot),
          })),
        )
        .sort((a, b) => a.ps - b.ps),
      [
        { key: "ps", head: "#" },
        { key: "name", head: "element" },
        { key: "slotName", head: "slot" },
        { key: "length", align: "right", render: renderAsFoot },
        { key: "width", align: "right", render: renderAsInch },
        { key: "height", align: "right", render: renderAsFoot },
        { key: "weight", align: "right", render: renderAsPound },
      ],
      {
        fontFamily: monospace,
        fontSize: $mm(4),
        rowHeight: $mm(6),
        width: width - $mm(20),
      },
    );

    drawFooter(page);
  });

  return pdf.save();

  function drawHeader(page: PDFPage, pallet: PalletModel) {
    const projectName = settings.name;
    const palletName = pallet.name;

    const { width, height } = page.getSize();
    const $y = (mm: number) => height - $mm(mm);
    const $x1 = (mm: number) => $mm(10 + mm);
    const $x2 = (mm = 0) => width * 0.7 + $mm(mm);

    const sizeA = $mm(4);
    const sizeB = $mm(8);
    const sizeC = sizeB * scaleToMaxWidth(projectName, sizeB, $x2(0) - $x1(0) - $mm(4), monospace);

    page.drawText(`project:`, { x: $x1(0), y: $y(5), size: sizeA });
    page.drawText(projectName, { x: $x1(0), y: $y(15), size: sizeC });

    page.drawText(`pallet:`, { x: $x2(0), y: $y(5), size: sizeA });
    page.drawText(palletName, { x: $x2(0), y: $y(15), size: sizeB });

    page.drawLine({
      start: { x: $mm(5), y: $y(20) },
      end: { x: width - $mm(5), y: $y(20) },
      color: brBlue,
    });
  }

  function scaleToMaxWidth(text: string, size: number, width: number, font: PDFFont) {
    const textWidth = font.widthOfTextAtSize(text, size);
    const ratio = width / textWidth;
    return Math.min(1, ratio);
  }

  function drawFooter(page: PDFPage) {
    const width = page.getWidth();

    page.drawLine({
      start: { x: $mm(5), y: $mm(15) },
      end: { x: width - $mm(5), y: $mm(15) },
      color: brBlue,
    });

    page.drawText(appUrl, { x: $mm(10), y: $mm(10) });
    page.drawText(disclaimer, { x: $mm(10), y: $mm(5) });

    const t2 = date.toISOString();
    const w2 = monospace.widthOfTextAtSize(t2, fontSize);
    page.drawText(t2, { x: width - w2 - $mm(10), y: $mm(10) });
  }
}

function drawPallet(page: PDFPage, pallet: PalletModel, maxWidth?: number, maxHeight?: number) {
  const { x, y } = page.getPosition();

  const $padding = $mm(10);

  const $scale = (value: number) =>
    value *
    Math.min(
      maxWidth ? (maxWidth - $padding) / (pallet.length + pallet.width) : 1,
      maxHeight ? maxHeight / pallet.height : 1,
    );

  const $xoff = $scale(pallet.width) + $padding;

  const width = $scale(pallet.width);
  const height = $scale(pallet.height);

  const $frontX = (dx = 0) => x + dx;
  const $sideX = (dx = 0) => x + $xoff + dx;
  const $y = (dy = 0) => y - height + dy;

  /** pallet front outline */
  // page.drawRectangle({
  //   x: $frontX(0),
  //   y: $y(0),
  //   width: $scale(pallet.width),
  //   height: $scale(pallet.height),
  //   borderWidth: $mm(0.1),
  //   borderColor: brBlue
  // });

  /** pallet side outline */
  // page.drawRectangle({
  //   x: $sideX(0),
  //   y: $y(0),
  //   width: $scale(pallet.length),
  //   height: $scale(pallet.height),
  //   borderWidth: $mm(0.1),
  //   borderColor: brBlue
  // });

  /** pallet front frame */
  page.drawRectangle({
    x: $frontX($scale(pallet.width - palletFrame.width) / 2),
    y: $y(0),
    width: $scale(palletFrame.width),
    height: $scale(palletFrame.height),
    borderWidth: $mm(0.4),
    borderColor: brGrey,
  });

  /** pallet side frame */
  page.drawRectangle({
    x: $sideX($scale(pallet.length - palletFrame.length) / 2),
    y: $y(0),
    width: $scale(palletFrame.length),
    height: $scale(palletFrame.height),
    borderWidth: $mm(0.4),
    borderColor: brGrey,
  });

  /** draw pallets */
  page.moveTo($frontX(0), $y(0));
  pallet.slots.forEach(drawSlot(page, $scale, $xoff));
  page.moveTo(x, y);

  return { width, height };
}

function drawSlot(page: PDFPage, $scale: (mm: number) => number, xoff: number) {
  const { x, y } = page.getPosition();

  const $frontX = (dx = 0) => x + dx;

  return (slot: SlotModel) => {
    page.moveTo($frontX($scale(slot.pos.y)), y + $scale(slot.pos.z));

    const $xoff = xoff + $scale(slot.pos.x - slot.pos.y);

    slot.elements.forEach(drawElement(page, $scale, $xoff));

    return page.moveTo(x, y);
  };
}

function drawElement(page: PDFPage, $scale: (mm: number) => number, xoff: number) {
  const { x, y } = page.getPosition();
  const fontSize = $mm(3);

  return (element: ElementModel) => {
    const $y = (dy = 0) => y + $scale(element.pos.z) + dy;

    {
      /** draw front */
      const $frontX = (dx = 0) => x + $scale(element.pos.y) + dx;

      page.drawRectangle({
        x: $frontX(0),
        y: $y(0),
        width: $scale(element.width),
        height: $scale(element.height),
        borderWidth: $mm(0.3),
        borderColor: brGreen,
      });

      page.drawText(element.name, {
        x: $frontX($mm(2)),
        y: $y(($scale(element.height) - fontSize * 0.6) / 2),
        size: fontSize,
        color: brGrey,
      });
    }

    {
      /** draw side */
      const $sideX = (dx = 0) => x + $scale(element.pos.x) + dx + xoff;

      page.drawRectangle({
        x: $sideX(0),
        y: $y(0),
        width: $scale(element.length),
        height: $scale(element.height),
        borderWidth: $mm(0.3),
        borderColor: brGreen,
      });

      page.drawText(element.name, {
        x: $sideX($mm(2)),
        y: $y(($scale(element.height) - fontSize * 0.6) / 2),
        size: fontSize,
        color: brGrey,
      });
    }

    return page.moveTo(x, y);
  };
}
