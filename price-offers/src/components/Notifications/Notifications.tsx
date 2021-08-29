import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NotificationsIcon from '@material-ui/icons/Notifications';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import { useRecoilState, useRecoilValue } from 'recoil';
import useSWR from 'swr';
import {
  Avatar, List, ListItem, ListItemAvatar, ListItemText,
} from '@material-ui/core';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import { notificationsState, userState, warningState } from '../../store/atom';
import { ESeveritySnackBar, INotifications } from '../../models/interfaces';
import DeleteButton from '../buttons/DeleteButton/DeleteButton';
import './Notifications.css';

const Notifications = () => {
  const [open, setOpen] = React.useState(false);
  const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');
  const user = useRecoilValue(userState);
  const [state, setState] = useRecoilState(warningState);
  const [notifications, setNotifications] = useRecoilState(notificationsState);

  const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetcher = (url: string, token: string) => fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(async (res) => setNotifications((await res.json())?.notifications));

  const { data } = useSWR(['/user/notifications', user?.token], fetcher);

  if (!data) {
    if (!state) {
      setState({
        isEnabled: true,
        description: 'Loading notifications',
        severity: ESeveritySnackBar.INFO,
      });
    }
  }

  const deleteNotification = async (uuid: string) => {
    fetch(`/user/notifications/${uuid}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }).then(async (res) => {
      const result = await res.json();
      if ('desc' in result) {
        if (state.isEnabled) {
          return;
        }
        setState({
          isEnabled: true,
          description: result?.info,
          severity: ESeveritySnackBar.ERROR,
        });
        return;
      }
      if ('info' in result) {
        if (state.isEnabled) {
          return;
        }
        setState({
          isEnabled: true,
          description: result?.info,
          severity: ESeveritySnackBar.INFO,
        });

        setNotifications(notifications?.filter((obj: INotifications) => obj.uuid !== uuid));
      }
    });
  };

  const handleClearAll = async () => {
    if (notifications === null) {
      return;
    }
    await Promise.all(notifications?.map(async (notification: INotifications) => {
      await deleteNotification(notification.uuid);
    }));
    setNotifications([]);
    handleClose();
  };

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <>
      <IconButton
        onClick={handleClickOpen('paper')}
        className="notifications__notifications-button"
        aria-label="Notifications"
      >
        {(notifications?.length > 0) ? (<NotificationsIcon />) : (<NotificationsNoneIcon />)}
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">
          <NotificationsIcon className="notifications__title-icon" />
          Notifications
        </DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          {(notifications?.length === 0) ? <div>You do not have any notifications.</div> : null}
          <List>
            {notifications?.map((notification: INotifications) => (
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <InfoIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.description}
                  secondary={new Date(notification?.created).toLocaleString()}
                />
                <IconButton onClick={async () => deleteNotification(notification?.uuid)} className="notifications__delete-button">
                  <DeleteButton />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button onClick={async () => handleClearAll()} color="primary">
            Clear all
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Notifications;
