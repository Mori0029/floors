import Papa from "papaparse";

import { palletNameToNumber } from "../../utils/palletNameToNumber";
import { StoreModel, SlotModel, PalletModel } from "../../store/models";
import { palletFrame } from "../../constants";

export function exportCsv(store: StoreModel): string {
  const data = store.elements
    .map((element) => {
      const slot: SlotModel = store.slots.find(({ id }) => id === element.slotId);

      const pallet: PalletModel = store.pallets.find(({ id }) => id === slot.palletId);

      const slotInPallet = pallet.slots.length - pallet.slots.map(({ id }) => id).indexOf(slot.id);

      const palletNo = palletNameToNumber(pallet.name);

      return {
        // "Element (Combined)": "",
        Project: store.settings.name,

        Element_Name: element.name,
        Element_Type: element.type,

        Height: element.height,
        Length: element.length,
        Width: element.width,
        Weight: element.weight,
        // Door: false,
        // Window: false,
        // "Hand Built": false,

        Pallet_Name: pallet.name,
        Pallet_No: palletNo,
        Pallet_Type: palletFrame.name,

        Slot_Name: slot.name,
        Order_in_Pallet: slotInPallet,

        // "Truck ID": "",
      };
    })
    .sort((a, b) => {
      return +a.Pallet_Name.match(/\d+/) - +b.Pallet_Name.match(/\d+/) || a.Order_in_Pallet - b.Order_in_Pallet;
    });

  return Papa.unparse(data);
}
