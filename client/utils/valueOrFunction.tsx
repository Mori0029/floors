export type ValueOrFunction<T> = T | ((arg?: unknown) => T);

export function valueOrFunction<T>(valOrFn: T | (() => T)): T;
export function valueOrFunction<T, A>(valOrFn: (arg: A) => T, arg: A): T;

export function valueOrFunction<T, A = unknown>(valOrFn: ValueOrFunction<T>, arg?: A): T {
  return valOrFn instanceof Function ? valOrFn(arg) : valOrFn;
}
