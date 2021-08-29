import Cookies from 'universal-cookie';
import {
  IUpdateProfile,
  ESeveritySnackBar, IFormInputLogin, IFormInputRegister,
} from '../models/interfaces';

export const tryLogin = async (formData: IFormInputLogin, showSnackBar: {
  (message: string, severity: ESeveritySnackBar): void;
  (arg0: string, arg1: ESeveritySnackBar): void;
}) => {
  await fetch('/user', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
    }),
  }).then(async (res) => {
    const cookies = new Cookies();
    const result = await res.json();
    if ('desc' in result) {
      showSnackBar(result?.desc, ESeveritySnackBar.ERROR);
      return;
    }

    if ('token' in result) {
      showSnackBar('Login was successful.', ESeveritySnackBar.SUCCESS);
      cookies.set('token', result?.token, { path: '/' });
    }
  });
};

export const tryRegister = async (formData: IFormInputRegister, showSnackBar: {
  (message: string, severity: ESeveritySnackBar): void;
  (arg0: string, arg1: ESeveritySnackBar): void;
}, setAuthTab: React.Dispatch<React.SetStateAction<number>>) => {
  if (formData.password !== formData.passwordAgain) {
    showSnackBar('Passwords do not match.', ESeveritySnackBar.ERROR);
    return;
  }

  await fetch('/user', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: formData.email,
      name: formData.name,
      password: formData.password,
    }),
  }).then(async (res) => {
    const result = await res.json();
    if ('desc' in result) {
      showSnackBar(result?.desc, ESeveritySnackBar.ERROR);
      return;
    }
    if ('info' in result) {
      showSnackBar(result?.info, ESeveritySnackBar.SUCCESS);
      setAuthTab(0);
    }
  });
};

export const tryUpdateProfile = async (formData: IUpdateProfile, token: string | undefined): Promise<{ desc: string } | { info: string }> => fetch('/user/profile', {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: (formData?.name.length > 2) ? formData.name : undefined,
    oldPassword: (formData?.oldPasswrod.length > 2) ? formData?.oldPasswrod : undefined,
    newPassword: (formData?.newPassword.length > 2) ? formData?.newPassword : undefined,
  }),
}).then(async (res) => res.json());
