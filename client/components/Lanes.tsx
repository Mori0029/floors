import React, { ReactNodeArray, ReactNode } from "react";

import { Paper, Grid, GridTypeMap, makeStyles, Theme } from "@material-ui/core";

const useLaneStyles = makeStyles((theme: Theme) => ({
  scrollContainer: {
    marginTop: theme.spacing(1),
    overflowY: "hidden",
  },

  lanesContainer: {
    minWidth: "max-content",
    height: "100%",
  },

  lane: {
    margin: theme.spacing(1),
    minWidth: "max-content",
    overflowX: "hidden",
    overflowY: "auto",
  },
}));

export function Lanes(props: { children: ReactNodeArray; laneProps?: GridTypeMap }): ReactNode {
  const classes = useLaneStyles(props);
  return (
    <Grid item className={classes.scrollContainer}>
      <Grid container direction="row" wrap="nowrap" justify="center" className={classes.lanesContainer}>
        {props.children.map((child: ReactNode, key: number) => (
          <Grid item component={Paper} className={classes.lane} key={key} {...props.laneProps}>
            {child}
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
