import React, { useEffect, useRef, useState, useMemo } from "react";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import DndBackend from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

import {
  Button,
  ButtonGroup,
  Grid,
  TableRow,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableContainer,
  makeStyles,
  Theme,
  Chip,
} from "@material-ui/core";

import { PalletModel, SlotModel, ElementModel } from "../../store/models";

import { mmToFoot, kgToPound } from "../../utils/units";
import { getFirstLast } from "../../utils/array";

import { useDragElement, useDropElement } from "../DragDrop";

import { renderPallet } from "./renderPallet";

const useStyles = makeStyles((theme: Theme) => ({
  view: { position: "absolute", right: theme.spacing(2), bottom: theme.spacing(2) },
}));

enum ViewType {
  "iso",
  "side",
  "front",
}

export function PalletViewer(props: { pallet: PalletModel; width?: number; height?: number }) {
  const { pallet } = props;

  const ref = useRef(null);

  const [updateView, setUpdateView] = useState<(view: ViewType) => void>(null);
  const [pickedId, setPickedId] = useState<PalletModel["id"]>(null);

  const { first, last } = useMemo(() => {
    return getFirstLast(pallet.slots.flatMap((slot) => slot.elements).sort((a, b) => a.sequence - b.sequence));
  }, [pallet.slots]);

  useEffect(render3d, [ref, pallet]);

  const slots: SlotModel[] = [...pallet.slots, { id: null, palletId: pallet.id } as SlotModel];

  const classes = useStyles(props);

  return (
    <Grid container direction="row" wrap="nowrap" justify="center" alignItems="stretch">
      <Grid container direction="column" wrap="nowrap" justify="space-evenly">
        <Grid item component={TableContainer}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="right">length</TableCell>
                <TableCell align="right">width</TableCell>
                <TableCell align="right">height</TableCell>
                <TableCell align="right">weight</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="right">
                  <div>{pallet?.length}mm</div>
                  <div>{mmToFoot(pallet?.length, 2)}</div>
                </TableCell>
                <TableCell align="right">
                  <div>{pallet?.width}mm</div>
                  <div>{mmToFoot(pallet?.width, 2)}</div>
                </TableCell>
                <TableCell align="right">
                  <div>{pallet?.height}mm</div>
                  <div>{mmToFoot(pallet?.height, 2)}</div>
                </TableCell>
                <TableCell align="right">
                  <div>{pallet?.weight}kg</div>
                  <div>{kgToPound(pallet?.weight)}</div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>

        <Grid item component={TableContainer}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">fist element</TableCell>
                <TableCell align="center">last element</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="center">{first?.name}</TableCell>
                <TableCell align="center">{last?.name}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>

        <Grid item component={TableContainer}>
          <DndProvider backend={DndBackend}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell> slot </TableCell>
                  <TableCell> elements </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map((slot) => (
                  <PalletViewerSlot slot={slot} key={slot.id} />
                ))}
              </TableBody>
            </Table>
          </DndProvider>
        </Grid>
      </Grid>

      <ButtonGroup className={classes.view} variant="contained">
        <Button onClick={handleSetView(ViewType.front)}> front </Button>
        <Button onClick={handleSetView(ViewType.side)}> side </Button>
        <Button onClick={handleSetView(ViewType.iso)} color="secondary">
          iso
        </Button>
      </ButtonGroup>

      <Grid item component="canvas" ref={ref} width={800} height={600} />
    </Grid>
  );

  function PalletViewerSlot({ slot }: { slot: SlotModel }) {
    const [{ hover }, drop] = useDropElement(slot);

    return (
      <TableRow ref={drop} selected={hover}>
        <TableCell>{slot.name || "new slot"}</TableCell>
        <TableCell>
          {slot.elements?.map((element) => (
            <PalletViewerElement element={element} key={element.id} />
          ))}
        </TableCell>
      </TableRow>
    );
  }

  function PalletViewerElement({ element }: { element: ElementModel }) {
    const [{ hover }, drag] = useDragElement(element.id);

    const isSelected = element.id === pickedId;

    return (
      <Chip
        label={element.name}
        variant={hover || isSelected ? "default" : "outlined"}
        color={hover ? "secondary" : isSelected ? "primary" : "default"}
        ref={drag}
      />
    );
  }

  function handleSetView(viewType: ViewType) {
    return () => updateView(viewType);
  }

  function render3d() {
    const { width = 800, height = 600 } = ref.current;

    const scene = new THREE.Scene();
    scene.matrixAutoUpdate = false;

    const renderer = new THREE.WebGLRenderer({
      canvas: ref.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;

    /** add content to scene */
    const stage = renderPallet(pallet);
    // stage.rotateY(Math.PI / -6);
    scene.add(stage);

    const { radius } = new THREE.Box3().setFromObject(stage).getBoundingSphere(new THREE.Sphere());

    const camDist = 1e5;
    const camera = new THREE.PerspectiveCamera(
      (Math.atan(radius / camDist) * 360) / Math.PI,
      width / height,
      camDist - radius,
      camDist + radius,
    );
    setCamera(4, 1, 4);
    camera.lookAt(0, 0, 0);

    setUpdateView(() => (view: ViewType) => {
      switch (view) {
        case ViewType.front:
          return setCamera(0, 0, 1);

        case ViewType.side:
          return setCamera(1, 0, 0);

        case ViewType.iso:
          return setCamera(4, 1, 4);

        default:
          return setCamera(1, 1, 1);
      }
    });

    function setCamera(x: number, y: number, z: number) {
      return camera.position.set(x, y, z).normalize().multiplyScalar(camDist);
    }

    /** set up lights */
    const lights = new THREE.Group();
    scene.add(lights);
    {
      const dist = radius * 10;
      const angle = Math.atan(radius / dist);

      const topRight = new THREE.SpotLight("#ffffff", 0.9, 0, angle);
      topRight.angle = angle;
      topRight.position.set(1, 1, 0).normalize().multiplyScalar(dist);

      const topLeft = new THREE.SpotLight("#ffffff", 0.8, 0, angle);
      topLeft.angle = angle;
      topLeft.position.set(0, 1, 1).normalize().multiplyScalar(dist);

      topLeft.castShadow = true;
      // topLeft.shadow.mapSize.width = 1024;
      // topLeft.shadow.mapSize.height = 1024;
      topLeft.shadow.camera.near = dist - radius;
      topLeft.shadow.camera.far = dist + radius;
      // topLeft.shadow.camera.fov = angle;

      const bottomCenter = new THREE.SpotLight("#ffffff", 0.7, 0, angle);
      bottomCenter.angle = angle;
      bottomCenter.position.set(1, 0, 1).normalize().multiplyScalar(dist);

      lights.add(topRight, topLeft, bottomCenter);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableKeys = false;
    controls.enablePan = false;
    controls.enableZoom = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(width / 2, height / 2);

    (function animate() {
      requestAnimationFrame(animate);

      updatePicker();

      controls.update();

      lights.quaternion.copy(camera.quaternion);

      renderer.render(scene, camera);
    })();

    function updatePicker() {
      raycaster.setFromCamera(mouse, camera);
      const [picked] = raycaster.intersectObject(stage, true);
      setPickedId(
        (function getParent(object: THREE.Object3D = null): string {
          return object && (object.userData?.id || getParent(object.parent));
        })(picked?.object),
      );
    }

    function updateMouse(event: MouseEvent) {
      const { left, top } = renderer.domElement.getBoundingClientRect();
      mouse.set((2 * (event.clientX - left)) / width - 1, (2 * (top - event.clientY)) / height + 1);
    }

    renderer.domElement.addEventListener("mousemove", updateMouse);
    return () => {
      renderer.domElement.removeEventListener("mousemove", updateMouse);
    };
  }
}
