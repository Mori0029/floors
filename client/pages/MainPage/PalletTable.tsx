import React, { useState, useEffect, ReactNode } from "react";

import {
  TableHead,
  TableCell,
  Table,
  TableRow,
  TableBody,
  MenuItem,
  Chip,
  TextField,
  ClickAwayListener,
  Grid,
  Tooltip,
  Typography,
} from "@material-ui/core";

import { PalletModel, BasicModel } from "../../store/models";
import { useStore } from "../../store/store";

import { UtilizationIndicator } from "../../components/UtilizationIndicator";
import { useDropSlot } from "../../components/DragDrop";
import { DotMenu } from "../../components/DotMenu";
import { ColumnModel, HeadRow, useStickyHead, BodyRow } from "../../components/BasicTable";

import { mmToFoot, kgToPound } from "../../utils/units";
import { maxPalletWeight } from "../../constants";

export function PalletTable(): ReactNode {
  // return <pre>{JSON.stringify(props.pallets, replacer, 2)}</pre>;

  const store = useStore();

  const { maxPalletLength, maxPalletWidth, maxPalletHeight } = store.settings;

  const [editId, setEditId] = useState<PalletModel["id"]>(null);

  const stickyHead = useStickyHead();

  const columns: ColumnModel<PalletModel>[] = [
    { label: "#", render: "sequence" },
    {
      label: "name",
      align: "left",
      render(pallet) {
        if (editId === pallet.id) {
          return <RenamePallet pallet={pallet} onChange={() => setEditId(null)} />;
        } else {
          return <Chip label={pallet.name} onClick={() => setEditId(pallet.id)} variant="outlined" />;
        }
      },
    },
    {
      label: "weight",
      align: "right",
      // render: (pallet) => renderPound(pallet.weight),
      render({ weight }) {
        const limit = maxPalletWeight;
        const wrong = limit < weight;
        return (
          <Tooltip title={wrong ? `limit is ${limit}kg (${kgToPound(limit)})` : ""}>
            <Typography variant="body2" color={wrong ? "error" : "inherit"} component="div">
              <div key="kg">{weight}</div>
              <div key="lb">{kgToPound(weight)}</div>
            </Typography>
          </Tooltip>
        );
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
        const limit = maxPalletHeight;
        const wrong = limit < height;
        return (
          <Tooltip title={wrong ? `limit is ${limit}mm (${mmToFoot(limit)})` : ""}>
            <Typography variant="body2" color={wrong ? "error" : "inherit"} component="div">
              <div key="mm">{height}</div>
              <div key="in">{mmToFoot(height)}</div>
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      label: "utilization",
      align: "center",
      render(pallet) {
        return <UtilizationIndicator utilization={pallet.utilization} />;
      },
    },
  ];

  return (
    <Table stickyHeader size="small">
      <TableHead className={stickyHead.class}>
        <TableRow>
          <TableCell colSpan={columns.length}>
            <Grid container direction="row" justify="space-between" alignContent="center">
              <Grid item>Pallets ({store.pallets.length})</Grid>
              <Grid item component={DotMenu}>
                <MenuItem onClick={handleRename}>rename all pallets</MenuItem>
                <MenuItem onClick={handleSortBySequence}>sort by sequence</MenuItem>
                <MenuItem onClick={handleSortByName}>sort by name</MenuItem>
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>
        <HeadRow columns={columns} />
      </TableHead>

      <TableBody>
        {store.pallets.map((pallet) => (
          <PalletRow pallet={pallet} key={pallet.id} />
        ))}
      </TableBody>
    </Table>
  );

  function handleRename() {
    const pattern = prompt(
      [`Set a Pattern for renaming:`, `$n\tnth pallet`, `$(n+x)\tnth+x pallet`].join("\n"),
      "pallet_$(n+0)",
    );

    const exp = /\$\(n\+(\d+)\)/;

    if (pattern) {
      store.upsert({
        pallets: store.pallets.map((item: BasicModel, index: number) => {
          if (exp.test(pattern)) {
            const [search, plus] = pattern.match(exp);
            const replace = String(index + 1 + +plus).padStart(3, "0");
            const name = pattern.replace(search, replace);
            return { id: item.id, name };
          } else {
            const replace = String(index + 1).padStart(3, "0");
            const name = pattern.replace(/\$n/, replace);
            return { id: item.id, name };
          }
        }),
      });
    }
  }

  function handleSortByName() {
    store.upsert({
      pallets: store.pallets
        .map((pallet) => pallet)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ id }, index) => ({ id, sequence: index + 1 })),
    });
  }

  function handleSortBySequence() {
    store.upsert({
      pallets: store.pallets
        .map(({ id, slots }) => ({
          id,
          sequence: Math.min(...slots.flatMap((element) => element.sequence)),
        }))
        .sort((a, b) => a.sequence - b.sequence)
        .map(({ id }, index) => ({ id, sequence: index + 1 })),
    });
  }

  function PalletRow({ pallet }: { pallet: PalletModel }) {
    const [{ hover }, drop] = useDropSlot(pallet);

    return (
      <BodyRow
        item={pallet}
        columns={columns}
        rowProps={{
          selected: hover,
          ref: drop,
        }}
      />
    );
  }
}

function RenamePallet(props: { pallet: PalletModel; onChange: () => void }) {
  const store = useStore();

  const [name, setName] = useState(props.pallet.name);

  useEffect(() => setName(props.pallet.name), [props.pallet.name]);

  return (
    <ClickAwayListener onClickAway={props.onChange}>
      <TextField
        value={name}
        onBlur={handleBlur}
        onChange={({ target }) => setName(target.value)}
        variant="outlined"
        margin="dense"
        size="small"
      />
    </ClickAwayListener>
  );

  function handleBlur() {
    if (name !== props.pallet.name) store.upsert({ pallets: [{ id: props.pallet.id, name }] });
  }
}
