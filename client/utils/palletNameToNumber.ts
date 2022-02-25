export function palletNameToNumber(name: string): string {
  const [, no = "0", char = "A"] = name.match(/(\d+)_([A-Z])?/i) || [];
  return `${no.padStart(3, "0")}_${String(char.toLowerCase().charCodeAt(0) - 96).padStart(2, "0")}`;
}
