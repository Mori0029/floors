import * as THREE from "three";

import { colors } from "../../../lib/styles/colors";

import { PalletModel } from "../../store/models";

import { palletFrame } from "../../constants";

import { renderSlot } from "./renderSlot";

const color = colors.grey;
const frameMaterial = new THREE.MeshStandardMaterial({ color });
const projetionMaterial = new THREE.LineBasicMaterial({ color });

export function renderPallet(pallet: PalletModel) {
  const group = new THREE.Group();

  group.name = pallet.name;

  group.add(renderFrame());
  group.add(renderProjection());

  group.add(
    ...pallet.slots.map((slot) =>
      renderSlot(slot)
        .translateX(pallet.width / -2)
        .translateY(pallet.height / -2)
        .translateZ(pallet.length / -2),
    ),
  );

  return group;

  function renderFrame() {
    const geometry = new THREE.BoxBufferGeometry(palletFrame.width, palletFrame.height, palletFrame.length);
    const frame = new THREE.Mesh(geometry, frameMaterial);

    frame.translateY((palletFrame.height - pallet.height) / 2);

    return frame;
  }

  function renderProjection() {
    const baseVector = new THREE.Vector3(pallet.width, pallet.height, pallet.length).multiplyScalar(-0.5);

    const geometry = new THREE.BufferGeometry().setFromPoints(
      [
        [-1, 1],
        [-1, -1],
        [1, -1],
        [1, 1],
      ].map(adjust),
    );

    return new THREE.LineLoop(geometry, projetionMaterial);

    function adjust([x, z]: number[]) {
      const vector = baseVector.clone();
      vector.x *= x;
      vector.z *= z;
      return vector;
    }
  }
}
