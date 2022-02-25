import Papa from "papaparse";
import { v4 as uuid } from "uuid";

import { ElementModel, SettingsModel, PartialStoreModel } from "../../store/models";

export function importBuildingPartList(file: File): Promise<PartialStoreModel> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      transformHeader,
      dynamicTyping: true,
      skipEmptyLines: true,
      encoding: "utf8",
      error: reject,
      complete,
    });

    function transformHeader(header: string) {
      const headers: Record<string, string> = {
        d_build_up: "buildUp",
        d_dim_x: "dimX",
        d_dim_y: "dimY",
        d_dim_z: "dimZ",
      };
      return headers[header] || header.replace(/^d_/, "");
    }

    function complete(results: Papa.ParseResult) {
      const elements: ElementModel[] = results.data
        .filter((row) => row.group && row.buildUp && row.type)
        .map(({ dimX = 0, dimY = 0, dimZ = 0, ...row }) => {
          const x = Math.max(dimX, dimY, dimZ);
          const z = Math.min(dimX, dimY, dimZ);
          const y = dimX + dimY + dimZ - (x + z);
          return { ...row, dim: { x, y, z } };
        })
        .map((row, sequence) => ({
          id: uuid(),
          name: getElementName(row),
          type: row.type,

          length: row.dim.x,
          width: row.dim.y,
          height: row.dim.z,
          weight: row.weight,

          sequence: sequence + 1,
        }));
      // .sort((a, b) => a.name.localeCompare(b.name))
      // .map((element, sequence) => ({ ...element, sequence: sequence + 1 }));

      const settings: Partial<SettingsModel> = {
        name: file.name.replace(/^(.*)\.csv/, "$1"),
      };

      resolve({ elements, settings });
    }
  });
}

function getElementName(row: { unit?: string; package?: string }): string {
  const replacer = row.unit ? `FP_${row.unit}_$1` : `FP_$1`;

  return row.package?.replace(/^.*FP_(\d+).*$/, replacer) || "?";
}
