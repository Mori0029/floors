export const oneInch = 25.4;
export const oneFoot = 304.8;
export const onePound = 0.45359237;

export function mmToInch(mm: number, fixed?: number, unit?: string): string;
export function mmToInch(mm: number, fixed: null): number;

export function mmToInch(mm: number, fixed = 2, unit = `in`) {
  if (fixed === null) {
    return mm / oneInch;
  } else {
    return (mm / oneInch).toFixed(fixed) + unit;
  }
}

export function mmToFoot(mm: number, fixed?: number, unit?: string): string;
export function mmToFoot(mm: number, fixed: null): number;

export function mmToFoot(mm: number, fixed = 2, unit = `ft`) {
  if (fixed === null) {
    return mm / oneFoot;
  } else {
    return (mm / oneFoot).toFixed(fixed) + unit;
  }
}

export function kgToPound(kg: number, fixed?: number, unit?: string): string;
export function kgToPound(kg: number, fixed: null): number;

export function kgToPound(kg: number, fixed = 0, unit = `lb`) {
  if (fixed === null) {
    return kg / onePound;
  } else {
    return (kg / onePound).toFixed(fixed) + unit;
  }
}
