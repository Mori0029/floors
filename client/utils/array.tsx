export function uniqueEntries<T>(arr: T[]) {
  const set = new Set(arr);
  return Array.from(set);
}

export function upsertArray<T extends { id: string }>(store: T[] = [], payload: Partial<T>[] = []): T[] {
  if (!payload?.length) {
    return store;
  }

  // update existing
  const newStore = store.map((item) => {
    const partial = payload.find(({ id }) => id === item.id);
    return partial ? { ...item, ...partial } : item;
  });

  // insert new
  payload.forEach((partial) => {
    if (!newStore.some(({ id }) => id === partial.id)) {
      newStore.push(partial as any);
    }
  });

  return newStore;
}

export function getFirstLast<T>(array: T[]): { first: T; last: T } {
  const { 0: first, length, [length - 1]: last } = array;
  return Boolean(length) ? { first, last } : null;
}
