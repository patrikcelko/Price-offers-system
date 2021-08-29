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
import MuiPhoneNumber from 'material-ui-phone-number';
import { ESeveritySnackBar, ICreateCompany } from '../../models/interfaces';
import { companyState, userState, warningState } from '../../store/atom';
import './CreateCompany.css';

const CreateCompany = () => {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = useRecoilState(warningState);
  const user = useRecoilValue(userState);
  const { handleSubmit, control, reset } = useForm<ICreateCompany>();
  const [, setCompanies] = useRecoilState(companyState);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const tryCreateCompany = async (data: ICreateCompany) => {
    await fetch('/company', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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
            description: 'Company was successfully added to database.',
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

        fetch('/company', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }).then(async (resGet) => {
          const resultGet = await resGet.json();
          setCompanies({
            rows: resultGet?.companies,
            wasUpdated: false,
          });
        });
        handleClose();
      }
    });
  };

  const onSubmit: SubmitHandler<ICreateCompany> = async (data) => tryCreateCompany(data);

  return (
    <div>
      {(!open) ? (
        <Fab color="primary" aria-label="add" className="companies-table__add-button" onClick={handleClickOpen}>
          <AddIcon />
        </Fab>
      ) : null}
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className="create-company__title">Create company record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please specify all important informations about your company.
          </DialogContentText>
          <form noValidate autoComplete="off" className="create-company__form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="create-company__field"
                  label="Company name"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="text"
                />
              )}
              rules={{ required: 'Company name is required' }}
            />
            <Controller
              name="residence"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="create-company__field"
                  label="Residence"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="text"
                />
              )}
              rules={{ required: 'Company residence is required' }}
            />
            <Controller
              name="specialization"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="create-company__field"
                  label="Specialization"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="text"
                />
              )}
              rules={{ required: 'Specialization is required' }}
            />
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <MuiPhoneNumber
                  className="create-company__field"
                  label="Phone number"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                />
              )}
              rules={{ required: 'Company phone is required' }}
            />
            <Controller
              name="companyID"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="create-company__field"
                  label="Company ID"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="text"
                />
              )}
              rules={{ required: 'Company ID is required' }}
            />
            <Button className="create-company__button" type="submit" variant="outlined" color="primary">Save company</Button>
            <Button className="create-company__button" variant="outlined" color="primary" onClick={handleClose}>Cancel</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCompany;
