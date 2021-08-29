import React from 'react';
import { Button, TextField } from '@material-ui/core';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import {
  ESeveritySnackBar, IFormInputLogin, IFormInputRegister, IRegisterProps,
} from '../../models/interfaces';
import { warningState } from '../../store/atom';
import { tryLogin, tryRegister } from '../../utils/auth';
import './Register.css';

const Register = ({
  login,
  setAuthTab,
}: IRegisterProps) => {
  const { handleSubmit, control } = useForm<IFormInputLogin & IFormInputRegister>();
  const [state, setState] = useRecoilState(warningState);

  const showSnackBar = (message: string, severity: ESeveritySnackBar) => {
    if (state.isEnabled) {
      return;
    }
    setState({
      isEnabled: true,
      description: message,
      severity,
    });
  };

  const onSubmit: SubmitHandler<IFormInputLogin> = async (data) => tryLogin(data, showSnackBar);
  const onSubmitRegister: SubmitHandler<IFormInputRegister> = async (data) => tryRegister(
    data,
    showSnackBar,
    setAuthTab,
  );

  const form = (!login) ? (
    <form noValidate autoComplete="off" className="register__form" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        defaultValue=""
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            className="register__field"
            label="User email"
            variant="filled"
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error ? error.message : null}
            type="email"
          />
        )}
        rules={{ required: 'User email is required' }}
      />
      <Controller
        name="password"
        control={control}
        defaultValue=""
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            className="register__field"
            label="Password"
            variant="filled"
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error ? error.message : null}
            type="password"
          />
        )}
        rules={{ required: 'Password is required' }}
      />
      <Button type="submit" variant="outlined" color="primary">Log in</Button>
    </form>
  ) : (
    <form noValidate autoComplete="off" className="register__form" onSubmit={handleSubmit(onSubmitRegister)}>
      <Controller
        name="name"
        control={control}
        defaultValue=""
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            className="register__field"
            label="First name and Last name"
            variant="filled"
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error ? error.message : null}
            type="text"
          />
        )}
        rules={{ required: 'User name is required' }}
      />
      <Controller
        name="email"
        control={control}
        defaultValue=""
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            className="register__field"
            label="User email"
            variant="filled"
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error ? error.message : null}
            type="email"
          />
        )}
        rules={{ required: 'User email is required' }}
      />
      <Controller
        name="password"
        control={control}
        defaultValue=""
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            className="register__field"
            label="Password"
            variant="filled"
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error ? error.message : null}
            type="password"
          />
        )}
        rules={{ required: 'Password is required' }}
      />
      <Controller
        name="passwordAgain"
        control={control}
        defaultValue=""
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            className="register__field"
            label="Password"
            variant="filled"
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error ? error.message : null}
            type="password"
          />
        )}
        rules={{ required: 'Password confirmation is required' }}
      />
      <Button type="submit" variant="outlined" color="primary">Create account</Button>
    </form>
  );

  return (
    <div className="register">
      {form}
    </div>
  );
};

export default Register;
