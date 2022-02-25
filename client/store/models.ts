export interface PositionModel {
  x: number;
  y: number;
  z: number;
}

export interface BasicModel {
  readonly id: string;
  readonly name: string;

  /** in [mm] */
  readonly length: number;

  /** in [mm] */
  readonly width: number;

  /** in [mm] */
  readonly height: number;

  /** in [kg] */
  readonly weight: number;

  readonly sequence?: number;

  readonly pos?: PositionModel;
}

export enum ElementType {
  floor = "FloorPanel",
  roof = "RoofPanel",
}

export interface ElementModel extends BasicModel {
  readonly type: ElementType;
  readonly slotId?: string;
}

export interface SlotModel extends BasicModel {
  readonly palletId?: string;
  readonly elements: ElementModel[];
}

export interface PalletModel extends BasicModel {
  readonly slots: SlotModel[];
  readonly utilization: number;
}

export interface SettingsModel {
  /** project/packout name */
  readonly name: string;

  /** padding between floors in one slot [mm] */
  readonly verticalPadding: number;

  /** padding between slots in one pallet [mm] */
  readonly horizontalPadding: number;

  /** max inner length of a 8'x13.5' Floor Pallet */
  readonly maxPalletLength: number;

  /** max inner height of a 8'x13.5' Floor Pallet */
  readonly maxPalletHeight: number;

  /** max inner width of a 8'x13.5' Floor Pallet */
  readonly maxPalletWidth: number;
}

export interface StoreModel {
  readonly id: string;
  readonly type: "floors";
  readonly elements: ElementModel[];
  readonly slots: SlotModel[];
  readonly pallets: PalletModel[];
  readonly settings: SettingsModel;
}

export interface PartialStoreModel {
  readonly id?: string;
  readonly elements?: Partial<ElementModel>[];
  readonly slots?: Partial<SlotModel>[];
  readonly pallets?: Partial<PalletModel>[];
  readonly settings?: Partial<SettingsModel>;
}
