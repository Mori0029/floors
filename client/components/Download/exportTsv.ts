import Papa from "papaparse";

import { StoreModel } from "../../store/models";
import { swapTable } from "../../utils/table";

import { getLayerColor, aciColors } from "./aciColors";

export function exportTsv(store: StoreModel): Record<string, string> {
  const trailers = store.pallets
    .map((pallet, index) => {
      const elements = pallet.slots
        .flatMap((slot) => slot.elements)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((element) => element.name);

      const trailer = pallet.name.replace(/^(.+)_[A-Z]$/i, "$1");

      return [trailer, pallet.name, aciColors[getLayerColor(index)], ...elements];
    })
    .reduce((all, [trailer, ...row]) => {
      if (!all[trailer]) all[trailer] = [];

      all[trailer].push(row);

      return all;
    }, {} as Record<string, string[][]>);

  return Object.fromEntries(
    Object.entries(trailers).map(([key, chunk]) => [key, Papa.unparse(swapTable(chunk), { delimiter: "\t" })]),
  );
}
