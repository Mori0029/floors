import * as THREE from "three";

import { colors } from "../../../lib/styles/colors";

import { SlotModel } from "../../store/models";

import { renderElement } from "./renderElement";

const color = colors.red;
const material = new THREE.MeshBasicMaterial({ color, wireframe: true });

export function renderSlot(slot: SlotModel) {
  const group = new THREE.Group();

  group.name = slot.name;

  // group.add(renderFrame());

  group.add(
    ...slot.elements.map((element) =>
      renderElement(element)
        .translateX(slot.width / -2)
        .translateY(slot.height / -2)
        .translateZ(slot.length / -2),
    ),
  );

  group
    .translateX(slot.width / 2 + slot.pos.y)
    .translateY(slot.height / 2 + slot.pos.z)
    .translateZ(slot.length / 2 + slot.pos.x);

  return group;

  function renderFrame() {
    const geometry = new THREE.BoxBufferGeometry(slot.width, slot.height, slot.length);
    const frame = new THREE.Mesh(geometry, material);

    return frame;
  }
}
