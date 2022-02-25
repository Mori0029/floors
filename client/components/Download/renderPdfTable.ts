import { PDFPage, PDFFont, PDFPageDrawTextOptions } from "pdf-lib";

import { $mm } from "./renderPdf";

import { mmToFoot, mmToInch, kgToPound } from "../../utils/units";

type AlignmentType = "right" | "center" | "left";

interface ColumnModel<R> {
  key: keyof R;
  render?: (row: R, key: keyof R) => string;
  head?: string;
  align?: AlignmentType;
  unit?: string;
}

interface OptionsModel {
  fontFamily: PDFFont;
  fontSize?: number;
  rowHeight?: number;
  width?: number;
}

export function drawTable<RowModel>(
  page: PDFPage,
  rows: RowModel[],
  columns: ColumnModel<RowModel>[],
  options: OptionsModel,
): void {
  const { fontFamily, fontSize = $mm(4), rowHeight = $mm(5), width = page.getWidth() } = options;

  const { x, y } = page.getPosition();

  const textOptions = { font: fontFamily, size: fontSize, x, y };

  const columnWidths = columns.map((col) => Math.max(...rows.map((row) => $getText(row, col)).map($textWidth)));

  const padding = (width - columnWidths.reduce((sum, val) => sum + val, 0)) / columns.length;

  const $columns = columns
    .map((col, index) => {
      const cellWidth = columnWidths[index] + padding;

      // if (Number.isNaN(cellWidth)) debugger;

      return { ...col, width: cellWidth };
    })
    .map((col, index, cols) => {
      const posX = cols.slice(0, index).reduce((sum, val) => sum + val.width, x);
      return { ...col, posX };
    });

  $columns.forEach((cell) => {
    const text = cell.head || String(cell.key);

    $drawText(cell, text, { ...textOptions, x: cell.posX });
  });

  rows.forEach((row, rowIndex) => {
    const posY = y - rowHeight * (rowIndex + 1);

    $columns.forEach((cell) => {
      const text = $getText(row, cell);
      const opt = { ...textOptions, x: cell.posX, y: posY };

      $drawText(cell, text, opt);
    });
  });

  return page.moveTo(x, y);

  function $getText(row: RowModel, column: ColumnModel<RowModel>) {
    return column.render ? column.render(row, column.key) : String(row[column.key]) + (column.unit || "");
  }

  function $textWidth(text: string) {
    return fontFamily.widthOfTextAtSize(text, fontSize);
  }

  function $drawText(cell: ColumnModel<RowModel> & { width: number }, text: string, opt: PDFPageDrawTextOptions) {
    switch (cell.align) {
      case "right": {
        const x = opt.x + cell.width - $textWidth(text);
        return page.drawText(text, { ...opt, x });
      }
      case "center": {
        const x = opt.x + (cell.width - $textWidth(text)) / 2;
        return page.drawText(text, { ...opt, x });
      }
      case "left":
      default: {
        return page.drawText(text, opt);
      }
    }
  }
}

export function renderAsFoot<R>(row: R, key: keyof R, fixed = 2) {
  return mmToFoot(Number(row[key]), fixed);
}

export function renderAsInch<R>(row: R, key: keyof R, fixed = 2) {
  return mmToInch(Number(row[key]), fixed);
}

export function renderAsPound<R>(row: R, key: keyof R, fixed = 2) {
  return kgToPound(Number(row[key]), fixed);
}
