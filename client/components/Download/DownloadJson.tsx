import React, { ComponentType, forwardRef, Ref } from "react";

import { Button } from "@material-ui/core";

import { useStore } from "../../store/store";

import { downloadAsFile } from "./downloadAsFile";

export function DownloadJsonButton(props: { component?: ComponentType<any> | string }, ref?: Ref<any>) {
  const Component = props.component || Button;
  const store = useStore();

  return (
    <Component ref={ref} onClick={handleDownload}>
      as *.json
    </Component>
  );

  function handleDownload() {
    const json = JSON.stringify(store, replacer, 4);
    const blob = new Blob([json], { type: "application/json" });
    const fileName = `${store.settings.name}.json`;
    return downloadAsFile(blob, fileName);
  }
}

DownloadJsonButton.withRef = forwardRef(DownloadJsonButton);

function replacer(key: string, value: any) {
  if (key === "") {
    return {
      id: value.id,
      type: value.type,
      settings: value.settings,
      elements: value.elements,
      slots: value.slots,
      pallets: value.pallets,
    };
  }

  if (key !== "" && (value?.elements || value?.slots)) {
    return { ...value, elements: undefined, slots: undefined };
  } else {
    return value;
  }
}
