import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useRecoilState } from 'recoil';
import { warningState } from '../../store/atom';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const WarningSnackBar = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [state, setState] = useRecoilState(warningState);

  if (state.isEnabled) {
    setState({
      isEnabled: false,
      description: state.description,
      severity: state.severity,
    });
    if (!open) {
      setOpen(true);
    }
  }

  const handleClose = (_event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={state.severity} elevation={6} variant="filled">
          {state.description}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default WarningSnackBar;
