import { BasicModel } from "./models";

interface PositionModel {
  x: number;
  y: number;
}

interface PackOptions {
  min?: PositionModel;
  max?: PositionModel;

  /** "grid" size in mm (305 = 1ft) (25 = 1in) */
  threshold?: PositionModel;
  padding?: number;
}

const maxRecursion = 100;

class PlaceError<Model extends BasicModel> extends Error {
  items: Model[];
  cursor: PositionModel;
  constructor(message: string, items?: Model[], cursor?: PositionModel) {
    super(message);
    this.name = "PlaceError";
    this.items = items;
    this.cursor = cursor;
  }
}

export function placeOnArea<Model extends BasicModel>(items: Model[], options: PackOptions): Model[] {
  let dog = 0;
  let last: { itemId: string; x: number; y: number } = null;

  const {
    min = { x: 0, y: 0 },
    max = {
      x: Math.max(...items.map((item) => item.length), options.max?.x || 0),
      y: Math.max(...items.map((item) => item.width), options.max?.y || 0),
    },
    threshold = { x: 305, y: 25 },
    padding = 0,
  } = options;

  try {
    const ids = items.map(({ id }) => id);

    const sorted = Array.from(items)
      /** sort for better placing */
      .sort((a, b) => Math.round((b.width - a.width) / threshold.y))
      .sort((a, b) => Math.round((b.length - a.length) / threshold.x));

    return (
      place(sorted)
        /** redo sorting */
        .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
    );
  } catch (error) {
    if (error instanceof PlaceError) {
      console.error(error);
      return error.items.map((element) => ({
        ...element,
        pos: element.pos || { x: -element.length, y: -element.width, z: 0 },
      }));
    } else {
      throw error;
    }
  }

  /** recursive placer */
  function place(
    [item = null, ...others]: Model[],
    placed: Model[] = [],
    cursor: PositionModel = { x: min.x, y: min.y },
  ): Model[] {
    console.debug(`[place] #${dog}`, item?.name, cursor);
    // console.table([...placed, item, ...others]);

    if (last?.itemId === item?.id && last?.x === cursor.x && last?.y === cursor.y) {
      throw new PlaceError(`invalid repitition ${item?.name}`, [...placed, item, ...others], cursor);
    } else {
      last = { itemId: item?.id, ...cursor };
    }

    if (++dog > maxRecursion) {
      throw new PlaceError(`recursion exceeds ${maxRecursion}`, [...placed, item, ...others], cursor);
    }

    /** all items done */
    if (!item) {
      // console.debug(`all items placed`);
      return placed;
    }

    /** check if item exeeds pack limits */
    // if (item.width > max.y - min.y || item.length > max.x - min.x) {
    //   console.debug({ min, max }, item);
    //   throw new PlaceError(
    //     `OBJECT EXCEEDS LIMITS`,
    //     [...placed, item, ...others],
    //     cursor
    //   );
    // }

    /** get all collisions at this position */
    const collisions = placed.filter(overlapX).filter(overlapY);

    /** move in Y if collides with placed items */
    if (collisions.length) {
      cursor.y += padding + Math.min(...collisions.map(overlapY));
      return place([item, ...others], placed, cursor);
    }

    // object does not fit in Y direction
    if (cursor.y && cursor.y + item.width > max.y) {
      cursor.y = min.y;
      cursor.x += padding + Math.min(...placed.map(overlapX).filter((val) => val));

      return place([item, ...others], placed, cursor);
    }

    // object does not fit in X direction
    if (cursor?.x && cursor.x + item.length > max.x) {
      return placed;
    }

    // apply position and continue with next object
    // console.debug("apply position and continue with next object");
    return place(others, [...placed, { ...item, pos: { ...cursor, z: 0 } }], cursor);

    /** return how much b has to move in X to fit */
    function overlapX(other: Model): number {
      if (cursor.x - other.pos.x < other.length && other.pos.x - cursor.x < item.length) {
        return other.pos.x - cursor.x + other.length;
      } else {
        return 0;
      }
    }

    /** return how much b has to move in Y to fit */
    function overlapY(other: Model): number {
      if (cursor.y - other.pos.y < other.width && other.pos.y - cursor.y < item.width) {
        return other.pos.y - cursor.y + other.width;
      } else {
        return 0;
      }
    }
  }
}
