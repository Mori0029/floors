import React, { useState } from "react";

import { MenuItem, IconButton, Menu, ListItemIcon, ListItemText } from "@material-ui/core";

import LogOutIcon from "@material-ui/icons/ExitToApp";

import { UserIcon } from "../UserIcon";

export function UserMenu(props: { viewer: any; onLogout: () => void }) {
  const { viewer, onLogout: handleLogout } = props;

  const [anchor, setAnchor] = useState<HTMLButtonElement>(null);

  return (
    <div>
      <IconButton onClick={handleOpen}>
        <UserIcon user={viewer} />
      </IconButton>
      <Menu
        keepMounted
        open={!!anchor}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={handleLogout} disabled={!viewer}>
          <ListItemIcon>
            <LogOutIcon />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
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
