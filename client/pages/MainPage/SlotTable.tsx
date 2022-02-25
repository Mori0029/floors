import React, { ReactNode } from "react";

import { v4 as uuid } from "uuid";

import {
  TableHead,
  TableCell,
  Table,
  TableRow,
  TableBody,
  MenuItem,
  Chip,
  Grid,
  Tooltip,
  Typography,
} from "@material-ui/core";

import { Add as CreateIcon, Clear as ClearIcon } from "@material-ui/icons";

import { SlotModel, BasicModel } from "../../store/models";
import { useStore } from "../../store/store";

import { useDropElement, useDragSlot } from "../../components/DragDrop";
import { DotMenu } from "../../components/DotMenu";
import { HeadRow, ColumnModel, BodyRow, useStickyHead } from "../../components/BasicTable";

import { mmToFoot, kgToPound, mmToInch } from "../../utils/units";
import { palletFrame, maxPalletWeight } from "../../constants";

export function SlotTable(): ReactNode {
  // return <pre>{JSON.stringify(props.slots, replacer, 2)}</pre>;

  const store = useStore();

  const { maxPalletLength, maxPalletWidth, maxPalletHeight } = store.settings;

  const stickyHead = useStickyHead();

  const columns: ColumnModel<SlotModel>[] = [
    { label: "#", render: "sequence" },
    {
      label: "name",
      align: "left",
      render(slot) {
        return <Chip label={slot.name} variant="outlined" />;
      },
    },
    {
      label: "weight",
      align: "right",
      // render: (slot) => renderPound(slot.weight),
      render({ weight }) {
        const limit = maxPalletWeight - palletFrame.weight;
        const wrong = limit < weight;
        return (
          <Tooltip title={wrong ? `limit is ${limit}kg (${mmToFoot(limit)})` : ""}>
            <Typography variant="body2" color={wrong ? "error" : "inherit"} component="div">
              <div key="kg">{weight}</div>
              <div key="lb">{mmToFoot(weight)}</div>
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
      label: "pallet",
      align: "left",
      render(slot) {
        return <SlotPallet slot={slot} />;
      },
    },
  ];

  return (
    <Table stickyHeader size="small">
      <TableHead className={stickyHead.class}>
        <TableRow>
          <TableCell colSpan={columns.length}>
            <Grid container direction="row" justify="space-between" alignContent="center">
              <Grid item>Slots ({store.slots.length})</Grid>
              <Grid item component={DotMenu}>
                <MenuItem onClick={handleRename}>rename all slots</MenuItem>
                <MenuItem onClick={handleSortBySequence}> sort by sequence </MenuItem>
                <MenuItem onClick={handleSortByName}> sort by name </MenuItem>
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>
        <HeadRow columns={columns} />
      </TableHead>

      <TableBody>
        {store.slots.map((slot) => (
          <SlotRow slot={slot} key={slot.id} />
        ))}
      </TableBody>
    </Table>
  );

  function handleRename() {
    const pattern = prompt(
      [`Set a Pattern for renaming:`, `$n\tnth slot`, `$(n+x)\tnth+x slot`].join("\n"),
      "slot_$(n+0)",
    );

    const exp = /\$\(n\+(\d+)\)/;

    if (pattern) {
      store.upsert({
        slots: store.slots.map((item: BasicModel, index: number) => {
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
      slots: store.slots
        .map((slot) => slot)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ id }, index) => ({ id, sequence: index + 1 })),
    });
  }

  function handleSortBySequence() {
    store.upsert({
      slots: store.slots
        .map(({ id, elements }) => ({ id, sequence: Math.min(...elements.map((element) => element.sequence)) }))
        .sort((a, b) => a.sequence - b.sequence)
        .map(({ id }, index) => ({ id, sequence: index + 1 })),
    });
  }

  function SlotRow({ slot }: { slot: SlotModel }) {
    const [{ hover }, drop] = useDropElement(slot);

    return (
      <BodyRow
        item={slot}
        columns={columns}
        rowProps={{
          selected: hover,
          ref: drop,
        }}
      />
    );
  }
}

function SlotPallet(props: { slot: SlotModel }) {
  const { slot } = props;

  const store = useStore();
  const pallet = store.pallets.find(({ id }) => id === slot.palletId);
  const handleClear = () => store.upsert({ slots: [{ id: slot.id, palletId: null }] });
  const handleCreate = () => store.upsert({ slots: [{ id: slot.id, palletId: uuid() }] });

  const [{ hover }, drag] = useDragSlot(props.slot.id);

  return (
    <Chip
      label={pallet?.name || "no pallet"}
      onDelete={pallet ? handleClear : handleCreate}
      deleteIcon={pallet ? <ClearIcon /> : <CreateIcon />}
      color={hover ? "secondary" : pallet ? "default" : "primary"}
      variant={hover ? "default" : "outlined"}
      ref={drag}
    />
  );
}
