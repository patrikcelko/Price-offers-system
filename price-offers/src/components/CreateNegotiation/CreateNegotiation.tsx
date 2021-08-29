import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import FormControl from '@material-ui/core/FormControl';
import { ESeveritySnackBar, ICreateNegotiation, ICreateNegotiationProps } from '../../models/interfaces';
import {
  companyState, userState, warningState,
} from '../../store/atom';
import ReplyButton from '../buttons/ReplyButton/ReplyButton';
import './CreateNegotiation.css';
import NumberFormatCustom from '../../utils/numberFormater';

const CreateNegotiation = (props: ICreateNegotiationProps) => {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = useRecoilState(warningState);
  const user = useRecoilValue(userState);
  const { handleSubmit, control, reset } = useForm<ICreateNegotiation>();
  const [companies, setCompanies] = useRecoilState(companyState);

  if (companies.rows.length === 0) {
    fetch('/company', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }).then(async (resGet) => {
      const resultGet = await resGet.json();
      if (companies.wasUpdated) {
        setCompanies({
          rows: resultGet?.companies,
          wasUpdated: false,
        });
      }
    });
  }

  const handleClickOpen = () => {
    if (companies.rows.length === 0) {
      if (!state.isEnabled) {
        setState({
          isEnabled: true,
          description: 'No companies registered to current user',
          severity: ESeveritySnackBar.ERROR,
        });
      }
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);

    reset({}, {
      keepErrors: true,
      keepDirty: true,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    });
  };

  const tryCreateNegotiation = async (negotiationInfo: ICreateNegotiation) => {
    const data = {
      demandUUID: props.demandId,
      companyUUID: negotiationInfo.companyId,
      price: Number(negotiationInfo.price),
    };
    await fetch('/demand/negotiation', {
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
            description: 'Negotiation was successfully added to database.',
            severity: ESeveritySnackBar.SUCCESS,
          });
        }
        handleClose();
      }
    });
  };

  const onSubmit: SubmitHandler<ICreateNegotiation> = async (data) => tryCreateNegotiation(data);
  return (
    <>
      <ReplyButton handler={handleClickOpen} />
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className="create-negotation__title">Create negotiation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please specify all important information about your negotiation.
          </DialogContentText>
          <form noValidate autoComplete="off" className="create-negotation__form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="price"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <TextField
                  className="create-negotation__field"
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
            <Controller
              name="companyId"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl variant="filled">
                  <InputLabel id="select-company-label">Your company</InputLabel>
                  <Select
                    className="create-negotation__company-selector"
                    labelId="select-company-label"
                    id="select-company"
                    value={value}
                    onChange={onChange}
                    error={!!error}
                  >
                    {companies.rows.map((company) => (
                      <MenuItem
                        key={company.uuid}
                        value={company.uuid}
                      >
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              rules={{ required: 'Company is required' }}
            />
            <Button className="create-negotation__button" type="submit" variant="outlined" color="primary">Propose</Button>
            <Button className="create-negotation__button" variant="outlined" color="primary" onClick={handleClose}>Cancel</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateNegotiation;
