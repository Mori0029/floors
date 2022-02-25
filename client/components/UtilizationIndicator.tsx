import React, { ReactNode } from "react";

import { makeStyles, Theme, Chip, Color } from "@material-ui/core";

import redHue from "@material-ui/core/colors/red";
import greenHue from "@material-ui/core/colors/green";

const useStyles = makeStyles((theme: Theme) => ({
  root(props: { utilization: number }) {
    const commonStyles = { width: "100%" };

    if (props.utilization > 1) {
      const color = theme.palette.colors.pink.main;
      return {
        background: color,
        color: theme.palette.getContrastText(color),
        ...commonStyles,
      };
    }

    if (props.utilization > 0.55) {
      const index: keyof Color = (Math.ceil((props.utilization - 0.55) * 20) * 100) as any;
      const color: string = greenHue[index] || "#ffffff";
      return {
        background: color,
        color: theme.palette.getContrastText(color),
        ...commonStyles,
      };
    }

    if (props.utilization < 0.45) {
      const index: keyof Color = (Math.ceil((props.utilization - 0.45) * -20) * 100) as any;
      const color: string = redHue[index] || "#ffffff";
      return {
        background: color,
        color: theme.palette.getContrastText(color),
        ...commonStyles,
      };
    }

    return commonStyles;
  },
}));

export function UtilizationIndicator(props: { utilization: number }): ReactNode {
  const label = `${(100 * props.utilization).toFixed()}%`;

  const classes = useStyles(props);

  return <Chip classes={classes} label={label} />;
}
