import { useDrop, useDrag, DragObjectWithType } from "react-dnd";

import { v4 as uuid } from "uuid";

import { SlotModel, PalletModel } from "../store/models";
import { useStore } from "../store/store";

interface DndElement extends DragObjectWithType {
  type: "element";
  id: string;
}

interface DragElementProps {
  hover: boolean;
}

interface DropElementProps {
  hover: boolean;
}

export function useDragElement(id: string) {
  return useDrag<DndElement, unknown, DragElementProps>({
    item: { id, type: "element" },
    collect: (monitor) => ({
      hover: monitor.isDragging(),
    }),
  });
}

export function useDropElement(slot: SlotModel) {
  const store = useStore();

  return useDrop<DndElement, unknown, DropElementProps>({
    accept: "element",
    drop(item) {
      if (slot.id) {
        store.upsert({ elements: [{ id: item.id, slotId: slot.id }] });
      } else {
        const slotId = uuid();
        store.upsert({
          elements: [{ id: item.id, slotId }],
          slots: [{ ...slot, id: slotId }],
        });
      }
    },
    collect: (monitor) => ({ hover: monitor.isOver() }),
  });
}

interface DndSlot extends DragObjectWithType {
  type: "slot";
  id: string;
}

interface DragSlotProps {
  hover: boolean;
}

interface DropSlotProps {
  hover: boolean;
}

export function useDragSlot(id: string) {
  return useDrag<DndSlot, unknown, DragSlotProps>({
    item: { id, type: "slot" },
    collect: (monitor) => ({
      hover: monitor.isDragging(),
    }),
  });
}

export function useDropSlot(pallet: PalletModel) {
  const store = useStore();

  return useDrop<DndSlot, unknown, DropSlotProps>({
    accept: "slot",
    drop(item) {
      if (pallet.id) {
        store.upsert({ slots: [{ id: item.id, palletId: pallet.id }] });
      } else {
        const palletId = uuid();
        store.upsert({
          slots: [{ id: item.id, palletId }],
          pallets: [{ ...pallet, id: palletId }],
        });
      }
    },
    collect: (monitor) => ({ hover: monitor.isOver() }),
  });
}
