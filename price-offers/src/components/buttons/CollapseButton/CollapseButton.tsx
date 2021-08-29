import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

interface CollapseButtonProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

const CollapseButton = ({ open, setOpen }: CollapseButtonProps) => (
  <IconButton aria-label="Expand or Collpse row" size="small" onClick={() => setOpen(!open)}>
    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
  </IconButton>
);

export default CollapseButton;
