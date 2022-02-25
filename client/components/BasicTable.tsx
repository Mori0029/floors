import React, { ReactNode } from "react";

import { TableCellProps, TableRow, TableCell, TableRowProps, makeStyles, Theme } from "@material-ui/core";

import { CSSProperties } from "@material-ui/core/styles/withStyles";

import { BasicModel } from "../store/models";

/** CSSProperties for TableHead */
export const style: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 900,
  "& .MuiTableCell-stickyHeader": { position: "relative" },
};

const useStyle = makeStyles((theme: Theme) => ({ tableHead: style }));

export function useStickyHead() {
  const { tableHead } = useStyle();
  return { class: tableHead };
}

export interface ColumnModel<Model extends BasicModel> extends TableCellProps {
  label: string;
  render: keyof Model | ((item: Model) => ReactNode);
}

export function HeadRow<Model extends BasicModel>(headProps: { columns: ColumnModel<Model>[] }) {
  return (
    <TableRow>
      {headProps.columns.map(({ label, render, ...colProps }) => (
        <TableCell {...colProps} key={label}>
          {label}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function BodyRow<Model extends BasicModel>(props: {
  columns: ColumnModel<Model>[];
  item: Model;
  rowProps?: TableRowProps;
}) {
  return (
    <TableRow {...(props.rowProps || {})}>
      {props.columns.map(({ label, render, ...colProps }) => (
        <TableCell key={label} {...colProps}>
          {typeof render === "function" ? render(props.item) : props.item[render]}
        </TableCell>
      ))}
    </TableRow>
  );
}
