import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { ESeveritySnackBar, ICreateDemand } from '../../models/interfaces';
import { demandState, userState, warningState } from '../../store/atom';
import './CreateDemand.css';
import NumberFormatCustom from '../../utils/numberFormater';

const CreateDemand = () => {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = useRecoilState(warningState);
  const user = useRecoilValue(userState);
  const { handleSubmit, control, reset } = useForm<ICreateDemand>();
  const [, setDemands] = useRecoilState(demandState);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const tryCreateDemand = async (data: ICreateDemand) => {
    const dataWithNumber = {
      name: data.name,
      budget: Number(data.budget),
      description: data.description,
      until: data.until,
    };

    await fetch('/demand', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataWithNumber),
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
            description: 'Demand was successfully added to database.',
            severity: ESeveritySnackBar.SUCCESS,
          });
        }
        reset({}, {
          keepErrors: true,
          keepDirty: true,
          keepIsSubmitted: false,
          keepTouched: false,
          keepIsValid: false,
          keepSubmitCount: false,
        });

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

  const onSubmit: SubmitHandler<ICreateDemand> = async (data) => tryCreateDemand(data);

  return (
    <div>
      {(!open) ? (
        <Fab color="primary" aria-label="add" className="demands-table__add-button" onClick={handleClickOpen}>
          <AddIcon />
        </Fab>
      ) : null}
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className="create-demand__title">Create a demand record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please specify all important information about your demand.
          </DialogContentText>
          <form noValidate autoComplete="off" className="create-demand__form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="create-demand__field"
                  label="Demand name"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="text"
                />
              )}
              rules={{ required: 'Demand name is required' }}
            />
            <Controller
              name="budget"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <TextField
                  className="create-demand__field"
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
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="create-demand__field"
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
              defaultValue={(new Date()).toDateString()}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="create-demand__field"
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
              rules={{ required: 'Demand deadline is required' }}
            />
            <Button className="create-demand__button" type="submit" variant="outlined" color="primary">Save demand</Button>
            <Button className="create-demand__button" variant="outlined" color="primary" onClick={handleClose}>Cancel</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateDemand;
