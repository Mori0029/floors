import React, { ComponentType, forwardRef, Ref } from "react";

import { Button } from "@material-ui/core";

import { useStore } from "../../store/store";

import { renderPdf } from "./renderPdf";
import { downloadAsFile } from "./downloadAsFile";

export function DownloadPdfButton(props: { component?: ComponentType<any> | string }, ref?: Ref<any>) {
  const Component = props.component || Button;
  const store = useStore();

  return (
    <Component ref={ref} onClick={handleDownload} disabled={!store.pallets.length}>
      as *.pdf
    </Component>
  );

  async function handleDownload() {
    const pdf = await renderPdf(store);
    const blob = new Blob([pdf], { type: "application/pdf" });
    const fileName = `${store.settings.name}.pdf`;
    return downloadAsFile(blob, fileName);
  }
}

DownloadPdfButton.withRef = forwardRef(DownloadPdfButton);
