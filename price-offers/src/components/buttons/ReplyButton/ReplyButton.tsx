import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ReplyIcon from '@material-ui/icons/Reply';

const ReplyButton = ({ handler } : { handler?: (() => void) }) => (
  <IconButton onClick={handler} aria-label="Reply">
    <ReplyIcon color="primary" />
  </IconButton>
);

ReplyButton.defaultProps = {
  handler: undefined,
};

export default ReplyButton;
