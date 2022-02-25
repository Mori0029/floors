import React, { ComponentType, forwardRef, Ref } from "react";

import { Button } from "@material-ui/core";

import { useStore } from "../../store/store";

import { exportCsv } from "./exportCsv";
import { downloadAsFile } from "./downloadAsFile";

export function DownloadCsvButton(props: { component?: ComponentType<any> | string }, ref?: Ref<any>) {
  const Component = props.component || Button;
  const store = useStore();

  return (
    <Component ref={ref} onClick={handleDownload} disabled={!store.pallets?.length}>
      as *.csv
    </Component>
  );

  function handleDownload() {
    const csv = exportCsv(store);
    const blob = new Blob([csv], { type: "text/csv" });
    const fileName = `${store.settings.name}.csv`;
    return downloadAsFile(blob, fileName);
  }
}

DownloadCsvButton.withRef = forwardRef(DownloadCsvButton);
