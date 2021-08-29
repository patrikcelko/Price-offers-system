import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import './EditProfile.css';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FaceIcon from '@material-ui/icons/Face';
import { ListItem } from '@material-ui/core';
import { useRecoilState } from 'recoil';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { menuState, userState, warningState } from '../../store/atom';
import { ESeveritySnackBar, IUpdateProfile, IUserLogOut } from '../../models/interfaces';
import { tryUpdateProfile } from '../../utils/auth';

const EditProfile = ({ logout }: IUserLogOut) => {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = useRecoilState(warningState);
  const [menu, setMenu] = useRecoilState(menuState);
  const [user, setUser] = useRecoilState(userState);
  const { handleSubmit, control } = useForm<IUpdateProfile>();

  const handleClickOpen = () => {
    setOpen(true);
    if (!menu.isOpened) {
      setMenu({
        isOpened: true,
      });
    }
  };

  const handleClose = () => {
    setMenu({
      isOpened: false,
    });
    setOpen(false);
  };

  const tryChangeProfileData = async (data: IUpdateProfile) => {
    const result = await tryUpdateProfile(data, user?.token);
    if ('desc' in result) {
      if (!state.isEnabled) {
        setState({
          isEnabled: true,
          description: result?.desc,
          severity: ESeveritySnackBar.ERROR,
        });
      }
    }
    if ('info' in result) {
      if (user != null) {
        setUser({
          name: data?.name,
          token: user?.token,
          email: user?.email,
          uuid: user?.uuid,
        });
      }
      if (!state.isEnabled) {
        setState({
          isEnabled: true,
          description: result?.info,
          severity: ESeveritySnackBar.SUCCESS,
        });
        if (data.newPassword.length > 1) {
          logout();
        }
      }
      handleClose();
    }
  };

  const onSubmit: SubmitHandler<IUpdateProfile> = async (data) => tryChangeProfileData(data);

  return (
    <div>
      <ListItem button key="Edit profile" onClick={handleClickOpen}>
        <FaceIcon className="edit-profile__face-icon" />
        Edit profile
      </ListItem>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className="edit-profile__title">Edit profile</DialogTitle>
        <DialogContent>
          <DialogContentText>
            In this section you can edit your profile informtaions.
          </DialogContentText>
          <form noValidate autoComplete="off" className="edit-profile__form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              defaultValue={user?.name}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="edit-profile__field"
                  label="First and Last name"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="text"
                />
              )}
            />
            <Controller
              name="oldPasswrod"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="edit-profile__field"
                  label="Old Password"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="password"
                />
              )}
            />
            <Controller
              name="newPassword"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="edit-profile__field"
                  label="New Password"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="password"
                />
              )}
            />
            <Button className="edit-profile__button" type="submit" variant="outlined" color="primary">Update profile</Button>
            <Button className="edit-profile__button" variant="outlined" color="primary" onClick={handleClose}>Cancel</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditProfile;
