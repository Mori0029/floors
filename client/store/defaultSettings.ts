import { SettingsModel } from "./models";

export const defaultSettings: SettingsModel = {
  name: "floors",

  /** 1" ~ 25 */
  verticalPadding: 25,
  /** 1.5" ~ 38 */
  horizontalPadding: 38,

  /** 53' ~ 16154 */
  maxPalletLength: 16154,
  /** 8"6' ~ 2591 */
  maxPalletHeight: 2591,
  /** 8"6' ~ 2591 */
  maxPalletWidth: 2591,
};
