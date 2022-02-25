import React from "react";

import { makeStyles, AppBar, Toolbar, Theme, IconButton, Tooltip } from "@material-ui/core";

import HelpIcon from "@material-ui/icons/HelpOutline";

import { useJwtAuth } from "../../auth/JwtAuthContext";

import { UserMenu } from "./UserMenu";
import { AppMenu, AppInfo } from "./AppMenu";

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: theme.spacing(2) },
  grow: { flexGrow: 1 },
}));

export function Navigation(props: {
  apps: AppInfo[];
  help?: { url?: string };
  children?: string | JSX.Element | JSX.Element[];
}) {
  const { viewer, logout } = useJwtAuth();

  const classes = useStyles({});

  return (
    <AppBar color="default" position="static">
      <Toolbar>
        <AppMenu apps={props.apps} />

        <div className={classes.grow} />

        {props.children}

        <div className={classes.grow} />

        <HelpButton />
        <UserMenu viewer={viewer} onLogout={logout} />
      </Toolbar>
    </AppBar>
  );

  function HelpButton() {
    if (props.help?.url)
      return (
        <Tooltip title="open documentation" placement="left">
          <IconButton component="a" href={props.help.url} target="_blank">
            <HelpIcon />
          </IconButton>
        </Tooltip>
      );

    return null;
  }
}
