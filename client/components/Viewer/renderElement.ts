import * as THREE from "three";

import { colors } from "../../../lib/styles/colors";

import { ElementModel } from "../../store/models";

const color = colors.green;
const outlineMaterial = new THREE.MeshStandardMaterial({ color });

export function renderElement(element: ElementModel) {
  const group = new THREE.Group();

  group.name = element.name;

  group.add(renderOutline());

  group
    .translateX(element.width / 2 + element.pos.y)
    .translateY(element.height / 2 + element.pos.z)
    .translateZ(element.length / 2 + element.pos.x);

  group.userData = {
    id: element.id,
    name: element.name,
    type: "element",
  };

  return group;

  function renderOutline() {
    const geometry = new THREE.BoxBufferGeometry(element.width, element.height, element.length);
    const outline = new THREE.Mesh(geometry, outlineMaterial);

    outline.castShadow = true;
    outline.receiveShadow = true;

    return outline;
  }
}
