import React, { ReactNode } from "react";

import { IconButton, Menu, MenuItem, Divider, ListSubheader } from "@material-ui/core";

import DownloadIcon from "@material-ui/icons/GetApp";

import { DownloadTrailerDxfButton } from "./DownloadDxf";
import { DownloadCsvButton } from "./DownloadCsv";
import { DownloadJsonButton } from "./DownloadJson";
import { DownloadPdfButton } from "./DownloadPdf";
import { DownloadTsvButton } from "./DownloadTsv";

export function DownloadMenu(): ReactNode {
  const [anchor, setAnchor] = React.useState<HTMLElement>(null);
  return (
    <div>
      <IconButton onClick={handleOpen} color={Boolean(anchor) ? "primary" : "default"}>
        <DownloadIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose} keepMounted>
        <DownloadJsonButton.withRef component={MenuItem} />
        <Divider />

        <ListSubheader>for packout</ListSubheader>
        <DownloadCsvButton.withRef component={MenuItem} />
        <DownloadPdfButton.withRef component={MenuItem} />

        <ListSubheader>for install</ListSubheader>
        <DownloadTrailerDxfButton.withRef component={MenuItem} />
        <DownloadTsvButton.withRef component={MenuItem} />
      </Menu>
    </div>
  );
  function handleOpen({ currentTarget }: React.MouseEvent<HTMLButtonElement>) {
    setAnchor(currentTarget);
  }
  function handleClose() {
    setAnchor(null);
  }
}
