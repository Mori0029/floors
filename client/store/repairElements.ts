import { ElementModel, ElementType } from "./models";

export function repairElements(store: { elements: Partial<ElementModel>[] }): ElementModel[] {
  return (
    store.elements
      /** calculate element values and remove position */
      // todo add assertion for manadatory values
      .map(repairElement)
      /** sort elements by sequence */
      .sort((a, b) => a.sequence - b.sequence)
      .map((element, index) => ({ ...element, sequence: index + 1 }))
  );
}

function repairElement(element: Partial<ElementModel>, index: number): ElementModel {
  return {
    id: element.id,
    name: element.name || `element_${String(index + 1).padEnd(3, "0")}`,
    type: repairElementType(element.type),

    length: +element.length,
    width: +element.width,
    height: +element.height,
    weight: +element.weight,

    sequence: element.sequence || index + 1,
    slotId: element.slotId || null,
    pos: null,
  };
}

function repairElementType(type: string): ElementType {
  switch (type) {
    case ElementType.floor:
    case "Room to room floor":
      return ElementType.floor;

    case ElementType.roof:
    case "Roof surface":
      return ElementType.roof;

    default:
      return null;
  }
}
