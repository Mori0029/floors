import { StoreModel } from "../../store/models";

export function importJson(file: File): Promise<StoreModel> {
  return new Promise((resolve, reject) => {
    file.text().then(JSON.parse).then(resolve).catch(reject);
  });
}
