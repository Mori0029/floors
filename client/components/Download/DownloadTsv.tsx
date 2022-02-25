import React, { ComponentType, Ref, forwardRef } from "react";

import { Button } from "@material-ui/core";

import { useStore } from "../../store/store";

import { exportTsv } from "./exportTsv";
import { downloadAsFile } from "./downloadAsFile";

const extension = "tsv";

export function DownloadTsvButton(props: { component?: ComponentType<any> | string }, ref?: Ref<any>) {
  const Component = props.component || Button;
  const store = useStore();

  return (
    <Component ref={ref} onClick={handleDownload} disabled={!store.pallets?.length}>
      as *.trailer.{extension}
    </Component>
  );

  function handleDownload() {
    return Object.entries(exportTsv(store)).forEach(([trailer, tsv]) => {
      const blob = new Blob([tsv], { type: "text/csv" });
      const fileName = `${store.settings.name}_${trailer}.${extension}`;
      return downloadAsFile(blob, fileName);
    });
  }
}

DownloadTsvButton.withRef = forwardRef(DownloadTsvButton);
