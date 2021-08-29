import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import MuiPhoneNumber from 'material-ui-phone-number';
import { DialogActions } from '@material-ui/core';
import {
  CompanyData, ESeveritySnackBar, ICompaniesRowProps, IUpdateCompany,
} from '../../models/interfaces';
import { companyState, userState, warningState } from '../../store/atom';
import EditButton from '../buttons/EditButton/EditButton';
import DeleteButton from '../buttons/DeleteButton/DeleteButton';
import './EditCompany.css';

const EditCompany = ({
  name,
  residence,
  specialization,
  contact,
  uuid,
}: ICompaniesRowProps) => {
  const [open, setOpen] = React.useState(0);
  const { handleSubmit, control, reset } = useForm<IUpdateCompany>();
  const user = useRecoilValue(userState);
  const [companies, setCompanies] = useRecoilState(companyState);
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
    fetch(`/company/${uuid}`, {
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

        setCompanies({
          rows: companies?.rows?.filter((obj: CompanyData) => obj.uuid !== uuid),
          wasUpdated: false,
        });
      }
    });
  };

  const tryUpdateCompany = async (data: IUpdateCompany) => {
    await fetch('/company', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyUUID: uuid,
        name: data.name,
        residence: data.residence,
        specialization: data.specialization,
        phone: data.phone,
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
            description: 'Company was successfully updated.',
            severity: ESeveritySnackBar.SUCCESS,
          });
        }

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

  const onSubmit: SubmitHandler<IUpdateCompany> = async (data) => tryUpdateCompany(data);

  return (
    <div>
      <DeleteButton handler={() => handleClickOpen(2)} />
      <EditButton handler={() => handleClickOpen(1)} />
      <Dialog open={open === 2} onClose={handleClose} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">Do you want to delete the selected company?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            By deleting company &apos;
            {name}
            &apos;
            you will lose all saved information and will not be able to
            use this company in future negotiations.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={tryDelete} color="primary" autoFocus>
            Delete company
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open === 1} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className="edit-company__title">Update company information</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Now you can change informations about your company.
          </DialogContentText>
          <form noValidate autoComplete="off" className="edit-company__form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              defaultValue={name}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="edit-company__field"
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
              defaultValue={residence}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="edit-company__field"
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
              defaultValue={specialization}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  className="edit-company__field"
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
              defaultValue={contact}
              render={({ field: { onChange, value } }) => (
                <MuiPhoneNumber
                  className="edit-company__field"
                  label="Phone number"
                  variant="filled"
                  value={value}
                  onChange={onChange}
                />
              )}
              rules={{ required: 'Company phone is required' }}
            />
            <Button className="edit-company__button" type="submit" variant="outlined" color="primary">Save changes</Button>
            <Button className="edit-company__button" variant="outlined" color="primary" onClick={handleClose}>Discard changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditCompany;
