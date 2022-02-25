/* eslint-disable no-console */

import assert from "assert";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const temlpatePath = resolve(__dirname, process.argv[2] || "app.template.yaml");
const appYamlPath = resolve(__dirname, process.argv[3] || "app.yaml");

try {
  const template = readFileSync(temlpatePath, "utf8");

  assert(template, `template is missing: ${temlpatePath}`);

  const appYaml = Object.entries(process.env).reduce((content, [key, value]) => {
    const exp = new RegExp(`<${key}>`, "g");

    if (exp.test(content)) {
      assert(value, `env.${key} is missing`);

      console.log(`replaced <${key}>`);
      return content.replace(exp, value);
    } else {
      return content;
    }
  }, template);

  const notReplaced = appYaml.match(/<\w+>/g);

  if (notReplaced instanceof Array) {
    throw Error(`no replacements found for: ${notReplaced.join(", ")}`);
  }

  writeFileSync(appYamlPath, appYaml, { encoding: "utf8" });

  console.log(`\nwrote app.yaml to ${appYamlPath}\n`);
} catch (error) {
  const message = `\naborting due to an error:\n${error.name}: ${error.message}\n`;
  console.error(message);
  process.exit(1);
}
