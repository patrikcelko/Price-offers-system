import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { DialogActions } from '@material-ui/core';
import {
  DemandData,
  ESeveritySnackBar,
  IDemandsRowProps,
  IUpdateDemand,
} from '../../models/interfaces';
import { demandState, userState, warningState } from '../../store/atom';
import EditButton from '../buttons/EditButton/EditButton';
import DeleteButton from '../buttons/DeleteButton/DeleteButton';
import './EditDemand.css';
import CreateNegotiation from '../CreateNegotiation/CreateNegotiation';
import NumberFormatCustom from '../../utils/numberFormater';

const EditDemand = ({
  demandId,
  name,
  budget,
  description,
  creatorUUID,
}: IDemandsRowProps) => {
  const [open, setOpen] = React.useState(0);
  const { handleSubmit, control, reset } = useForm<IUpdateDemand>();
  const user = useRecoilValue(userState);
  const [demands, setDemands] = useRecoilState(demandState);
  const [state, setState] = useRecoilState(warningState);

  const handleClickOpen = async (id: number) => {
    setOpen(id);
  };

  const handleClose = () => {
    setOpen(0);

    reset({}, {
      keepErrors: true,
      keepDirty: true,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    });
  };

  const tryDelete = async () => {
    fetch(`/demand/${demandId}`, {
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
          severity: ESeveritySnackBar.SUCCESS,
        });

        setDemands({
          rows: demands?.rows?.filter((obj: DemandData) => obj.uuid !== demandId),
          wasUpdated: false,
        });
      }
    });
  };

  const tryUpdateDemand = async (data: IUpdateDemand) => {
    await fetch('/demand', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        demandUUID: demandId,
        budget: Number(data.budget),
        description: data.description,
        until: (data?.until?.length !== 0) ? data.until : undefined,
      }),
    }).then(async (resPost) => {
      const resultPost = await resPost.json();
      if ('desc' in resultPost) {
        if (!state.isEnabled) {
          setState({
            isEnabled: true,
            description: resultPost?.desc,
            severity: ESeveritySnackBar.ERROR,
          });
        }
      } else {
        if (!state.isEnabled) {
          setState({
            isEnabled: true,
            description: 'Demand was successfully updated.',
            severity: ESeveritySnackBar.SUCCESS,
          });
        }

        fetch('/demand', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }).then(async (resGet) => {
          const resultGet = await resGet.json();
          setDemands({
            rows: resultGet?.demands,
            wasUpdated: false,
          });
        });
        handleClose();
      }
    });
  };

  const onSubmit: SubmitHandler<IUpdateDemand> = async (data) => tryUpdateDemand(data);

  return (
    <div>
      {
        (user?.uuid === creatorUUID)
          ? (
            <>
              <DeleteButton handler={() => handleClickOpen(2)} />
              <EditButton handler={() => handleClickOpen(1)} />
            </>
          ) : <CreateNegotiation demandId={demandId} />
      }
      <Dialog open={open === 2} onClose={handleClose} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">Do you want to delete the selected demand?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            By deleting demand &apos;
            {name}
            &apos;
            you will lose all saved information. Also, all opened negotiations will be closed and
            you will lose an opportunity to have any negotiations in future.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={tryDelete} color="primary" autoFocus>
            Delete demand
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open === 1} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className="edit-demand__title">Update demand information</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Now you can change informations about your demand.
          </DialogContentText>
          <form noValidate autoComplete="off" className="edit-demand__form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="budget"
              control={control}
              defaultValue={budget}
              render={({ field: { onChange, value } }) => (
                <TextField
                  className="edit-demand__field"
                  label="Your budget"
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
            <Controller
              name="description"
              control={control}
              defaultValue={description}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="edit-demand__field"
                  label="Description"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="text"
                />
              )}
              rules={{ required: 'Demand description is required' }}
            />
            <Controller
              name="until"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="edit-demand__field"
                  label="Until (YYYY-MM-DD)"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Button className="edit-demand__button" type="submit" variant="outlined" color="primary">Save changes</Button>
            <Button className="edit-demand__button" variant="outlined" color="primary" onClick={handleClose}>Discard changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditDemand;
