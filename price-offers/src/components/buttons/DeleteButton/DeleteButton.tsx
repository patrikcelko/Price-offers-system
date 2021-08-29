import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

const DeleteButton = ({ handler } : { handler?: (() => Promise<void>) }) => (
  <IconButton onClick={handler} aria-label="Delete">
    <DeleteIcon color="secondary" />
  </IconButton>
);

DeleteButton.defaultProps = {
  handler: undefined,
};

export default DeleteButton;
