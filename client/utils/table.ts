export function swapTable<T>(table: T[][]): T[][] {
  const maxX = table.length;
  const maxY = Math.max(0, ...table.map((row) => row.length));

  const swapped = new Array(maxY).fill(undefined).map(() => new Array(maxX).fill(undefined));
  table.forEach((row, y) => row.forEach((cell, x) => (swapped[x][y] = cell)));

  return swapped;
}
