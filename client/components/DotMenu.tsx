import React, { useState, useMemo } from "react";

import { Menu, Tooltip, IconButton } from "@material-ui/core";

import DotIcon from "@material-ui/icons/MoreVertOutlined";

export function DotMenu(props: {
  children: JSX.Element | JSX.Element[];
  component?: React.ComponentType<any> | string;
}) {
  const [anchor, setAnchor] = useState<HTMLButtonElement>(null);

  const items = useMemo(appendOnClose, [props.children]);
  const Component = props.component || "div";

  return (
    <Component>
      <Tooltip title="more.." placement="left">
        <IconButton size="small" onClick={handleOpen}>
          <DotIcon />
        </IconButton>
      </Tooltip>

      <Menu
        keepMounted
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={handleClose}
        getContentAnchorEl={null}
        onClick={handleClose}
      >
        {items}
      </Menu>
    </Component>
  );

  function handleOpen(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchor(event.currentTarget);
  }

  function handleClose() {
    setAnchor(null);
  }

  function appendOnClose() {
    return [props.children].flat().map((item) => ({
      ...item,
      props: {
        ...item.props,
        onClick() {
          handleClose();
          if ("onClick" in item.props) {
            item.props.onClick();
          }
        },
      },
    }));
  }
}
