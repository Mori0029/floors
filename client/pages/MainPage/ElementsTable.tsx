import React, { ReactNode } from "react";
import { v4 as uuid } from "uuid";

import {
  TableHead,
  TableCell,
  Table,
  TableRow,
  TableBody,
  Chip,
  MenuItem,
  Grid,
  Typography,
  Tooltip,
} from "@material-ui/core";

import { Add as CreateIcon, Clear as ClearIcon } from "@material-ui/icons";

import { ElementModel } from "../../store/models";
import { useStore } from "../../store/store";

import { useDragElement } from "../../components/DragDrop";
import { DotMenu } from "../../components/DotMenu";
import { HeadRow, ColumnModel, BodyRow, useStickyHead } from "../../components/BasicTable";

import { mmToFoot, mmToInch } from "../../utils/units";
import { palletFrame } from "../../constants";

export function ElementsTable(): ReactNode {
  // return <pre>{JSON.stringify(props.elements, replacer, 2)}</pre>;

  const store = useStore();

  const { maxPalletLength, maxPalletWidth, maxPalletHeight } = store.settings;

  const stickyHead = useStickyHead();

  const columns: ColumnModel<ElementModel>[] = [
    { label: "#", render: "sequence" },
    {
      label: "name",
      align: "left",
      render(element) {
        return <Chip label={element.name} variant="outlined" />;
      },
    },
    {
      label: "length",
      align: "right",
      render({ length }) {
        const limit = maxPalletLength;
        const wrong = limit < length;
        return (
          <Tooltip title={wrong ? `limit is ${limit}mm (${mmToFoot(limit)})` : ""}>
            <Typography variant="body2" color={wrong ? "error" : "inherit"} component="div">
              <div key="mm">{length}</div>
              <div key="ft">{mmToFoot(length)}</div>
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      label: "width",
      align: "right",
      render({ width }) {
        const limit = maxPalletWidth;
        const wrong = limit < width;
        return (
          <Tooltip title={wrong ? `limit is ${limit}mm (${mmToFoot(limit)})` : ""}>
            <Typography variant="body2" color={wrong ? "error" : "inherit"} component="div">
              <div key="mm">{width}</div>
              <div key="ft">{mmToFoot(width)}</div>
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      label: "height",
      align: "right",
      render({ height }) {
        const limit = maxPalletHeight - palletFrame.height;
        const wrong = limit < height;
        return (
          <Tooltip title={wrong ? `limit is ${limit}mm (${mmToFoot(limit)})` : ""}>
            <Typography variant="body2" color={wrong ? "error" : "inherit"} component="div">
              <div key="mm">{height}</div>
              <div key="in">{mmToInch(height)}</div>
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      align: "left",
      label: "slot",
      render(element) {
        return <ElementSlot element={element} />;
      },
    },
  ];

  return (
    <Table stickyHeader size="small">
      <TableHead className={stickyHead.class}>
        <TableRow>
          <TableCell colSpan={columns.length}>
            <Grid container direction="row" justify="space-between" alignContent="center">
              <Grid item>Elements ({store.elements.length})</Grid>
              <Grid item component={DotMenu}>
                <MenuItem onClick={handleSortByNumber}>sort by number</MenuItem>
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>
        <HeadRow columns={columns} />
      </TableHead>

      <TableBody>
        {store.elements.map((element) => (
          <BodyRow item={element} columns={columns} key={element.id} />
        ))}
      </TableBody>
    </Table>
  );

  function handleSortByNumber() {
    const elements = store.elements
      .map(({ id, name }) => ({ id, num: +name.match(/\d+/) }))
      .sort((a, b) => a.num - b.num)
      .map(({ id }, index) => ({ id, sequence: index + 1 }));

    store.upsert({ elements });
  }
}

function ElementSlot(props: { element: ElementModel }) {
  const { element } = props;

  const store = useStore();
  const slot = store.slots.find(({ id }) => id === element.slotId);
  const handleClear = () => store.upsert({ elements: [{ id: element.id, slotId: null }] });
  const handleCreate = () => store.upsert({ elements: [{ id: element.id, slotId: uuid() }] });

  const [{ hover }, drag] = useDragElement(props.element.id);

  return (
    <Chip
      label={slot?.name || "no slot"}
      onDelete={slot ? handleClear : handleCreate}
      deleteIcon={slot ? <ClearIcon /> : <CreateIcon />}
      color={hover ? "secondary" : slot ? "default" : "primary"}
      variant={hover ? "default" : "outlined"}
      ref={drag}
    />
  );
}
