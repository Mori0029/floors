import React, { useState } from "react";

import { MenuItem, Menu, ListItemIcon, ListItemText, IconButton, Avatar } from "@material-ui/core";

import iconSrc from "../../../client/icon.svg";

function AppIcon() {
  return (
    <Avatar src={iconSrc} variant="square">
      [FL]
    </Avatar>
  );
}

export interface AppInfo {
  name: string;
  path: string;
  iconUrl: string;
  logoUrl: string;
}

export function AppMenu(props: { apps: AppInfo[] }) {
  const { apps } = props;

  const [anchor, setAnchor] = useState<HTMLButtonElement>(null);

  return (
    <div>
      <IconButton onClick={handleOpen}>
        <AppIcon />
      </IconButton>
      <Menu
        keepMounted
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        getContentAnchorEl={null}
      >
        <MenuItem component="a" href="/">
          to bprobo.com
        </MenuItem>
        {apps.map((app) => (
          <MenuItem component="a" href={app.path} key={app.name}>
            <ListItemIcon>
              <img src={app.iconUrl} alt={app.name} />
            </ListItemIcon>
            <ListItemText>{app.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
  function handleOpen(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchor(event.currentTarget);
  }
  function handleClose() {
    setAnchor(null);
  }
}
