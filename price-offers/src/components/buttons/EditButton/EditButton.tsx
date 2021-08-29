import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

const EditButton = ({ handler } : { handler?: (() => Promise<void>) }) => (
  <IconButton onClick={handler} aria-label="Edit">
    <EditIcon color="primary" />
  </IconButton>
);

export default EditButton;
