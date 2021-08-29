import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import IconButton from '@material-ui/core/IconButton';
import { MenuItem, Select, TextareaAutosize } from '@material-ui/core';
import ForumIcon from '@material-ui/icons/Forum';
import EditButton from '../buttons/EditButton/EditButton';
import {
  ESeveritySnackBar, IMessageSender, INegotEditProps, INegotiationEditor,
} from '../../models/interfaces';
import { negotiationState, userState, warningState } from '../../store/atom';
import './Negotiation.css';
import '../EditProfile/EditProfile.css';
import '../Register/Register.css';
import NumberFormatCustom from '../../utils/numberFormater';

const NegotiationEdit = ({ negotiationData }: INegotEditProps) => {
  const [open, setOpen] = React.useState(2);
  const [state, setState] = useRecoilState(warningState);
  const user = useRecoilValue(userState);
  const { handleSubmit, control, reset } = useForm<INegotiationEditor & IMessageSender>();
  const [, setNegotations] = useRecoilState(negotiationState);

  const handleClickOpen = async (index: number): Promise<void> => {
    setOpen(index);
  };

  const handleClose = () => {
    setOpen(2);

    reset({}, {
      keepErrors: true,
      keepDirty: true,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    });
  };

  const updateData = async () => {
    fetch('/negotiation', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }).then(async (resGet) => {
      const resultGet = await resGet.json();
      setNegotations({
        rows: resultGet?.negotiations,
        wasUpdated: false,
      });
    });
  };

  const trySendMessage = async (data: IMessageSender) => {
    if (data?.message.length < 2) {
      if (!state.isEnabled) {
        setState({
          isEnabled: true,
          description: 'Sorry but your message is too short.',
          severity: ESeveritySnackBar.ERROR,
        });
      }
      return;
    }

    await fetch('/message', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: data.message,
        negotiationID: negotiationData?.negotiationId,
      }),
    }).then(async (res) => {
      const result = await res.json();
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
        if (!state.isEnabled) {
          setState({
            isEnabled: true,
            description: result?.info,
            severity: ESeveritySnackBar.SUCCESS,
          });
        }
        await updateData();
        handleClose();
      }
    });
  };

  const tryUpdateProfile = async (data: INegotiationEditor) => {
    await fetch('/negotiation', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        negotiationUUID: negotiationData.negotiationId,
        status: (negotiationData?.demandOwner === user?.uuid)
          ? data.status.toLowerCase() : undefined,
        price: (negotiationData?.demandOwner !== user?.uuid)
          ? Number(data.price) : undefined,
      }),
    }).then(async (res) => {
      const result = await res.json();
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
        if (!state.isEnabled) {
          setState({
            isEnabled: true,
            description: result?.info,
            severity: ESeveritySnackBar.SUCCESS,
          });
        }
        await updateData();
        handleClose();
      }
    });
  };

  const onSubmitMessage: SubmitHandler<IMessageSender> = async (data) => trySendMessage(data);
  const onSubmit: SubmitHandler<INegotiationEditor> = async (data) => tryUpdateProfile(data);

  return (
    <div>
      <EditButton handler={() => handleClickOpen(0)} />
      <IconButton onClick={() => handleClickOpen(1)}>
        <ForumIcon />
      </IconButton>
      <Dialog open={open === 1} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className="edit-negotiation__title">Reply to negotiation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can reply to this negotiation using text area below.
          </DialogContentText>
          <form noValidate autoComplete="off" className="edit-negotiation__form" onSubmit={handleSubmit(onSubmitMessage)}>
            <Controller
              name="message"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <TextareaAutosize
                  className="edit-negotiation__field"
                  placeholder="Your message"
                  rows={5}
                  maxRows={10}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            <br />
            <Button className="edit-negotiation__button" type="submit" variant="outlined" color="primary">Send message</Button>
            <Button className="edit-negotiation__button" variant="outlined" color="primary" onClick={handleClose}>Cancel</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={open === 0} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className="edit-negotiation__title">Update negotiation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Now you can suggest price or change negotittion status.
          </DialogContentText>
          <form noValidate autoComplete="off" className="edit-negotiation__form" onSubmit={handleSubmit(onSubmit)}>
            {(negotiationData?.demandOwner === user?.uuid) ? (
              <Controller
                name="status"
                control={control}
                defaultValue="not-selected"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <Select
                      className="negotiation__status-control"
                      label="Negotiation status"
                      variant="filled"
                      value={(value === '') ? 'not-selected' : value}
                      onChange={onChange}
                      error={!!error}
                    >
                      <MenuItem value="not-selected">Not Selected</MenuItem>
                      <MenuItem value="rejected">Reject</MenuItem>
                      <MenuItem value="approved">Approve</MenuItem>
                    </Select>
                  </>

                )}
              />
            ) : (
              <Controller
                name="price"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <TextField
                    className="edit-negotiation__field"
                    label="Suggested price"
                    variant="filled"
                    value={value}
                    onChange={onChange}
                    name="numberformat"
                    id="formatted-numberformat-input"
                    InputProps={{
                      inputComponent: NumberFormatCustom as any,
                    }}
                  />
                )}
              />
            )}
            <Button className="edit-negotiation__button" type="submit" variant="outlined" color="primary">Save changes</Button>
            <Button className="edit-negotiation__button" variant="outlined" color="primary" onClick={handleClose}>Cancel</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NegotiationEdit;
