import React, { ComponentType, forwardRef, Ref } from "react";

import { Button } from "@material-ui/core";

import { useStore } from "../../store/store";

import { renderDxf, renderPackoutDxf } from "./renderDxf";
import { downloadAsFile } from "./downloadAsFile";

export function DownloadDxfButton(props: { component?: ComponentType<any> | string }, ref?: Ref<any>) {
  const Component = props.component || Button;
  const store = useStore();

  const extension = "dxf";

  return (
    <Component ref={ref} onClick={handleDownload} disabled={!store.pallets.length}>
      as *.{extension}
    </Component>
  );

  function handleDownload() {
    const dxf = renderDxf(store);
    const blob = new Blob([dxf], { type: "image/vnd.dxf" });
    const fileName = `${store.settings.name}.${extension}`;
    return downloadAsFile(blob, fileName);
  }
}

DownloadDxfButton.withRef = forwardRef(DownloadDxfButton);

export function DownloadTrailerDxfButton(props: { component?: ComponentType<any> | string }, ref?: Ref<any>) {
  const Component = props.component || Button;
  const store = useStore();

  const extension = "trailer.dxf";

  return (
    <Component ref={ref} onClick={handleDownload} disabled={!store.pallets.length}>
      as *.{extension}
    </Component>
  );

  function handleDownload() {
    const dxf = renderPackoutDxf(store);
    const blob = new Blob([dxf], { type: "image/vnd.dxf" });
    const fileName = `${store.settings.name}.${extension}`;
    return downloadAsFile(blob, fileName);
  }
}

DownloadTrailerDxfButton.withRef = forwardRef(DownloadTrailerDxfButton);
