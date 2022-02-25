import React, { ReactNode } from "react";

import { Avatar, Tooltip } from "@material-ui/core";

export function UserIcon(props: { user?: { readonly name?: string; readonly imageUrl?: string } }): ReactNode {
  const { user, ...avatarProps } = props;

  const name = (user && user.name) || "unknown";
  const imageUrl = user && user.imageUrl;
  const altImage = imageUrl ? null : user && user.name ? name[0] : "?";

  return (
    <Tooltip title={name}>
      <Avatar {...avatarProps} src={imageUrl} alt={name}>
        {altImage}
      </Avatar>
    </Tooltip>
  );
}
