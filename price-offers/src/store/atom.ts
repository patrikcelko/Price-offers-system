import { atom } from 'recoil';
import {
  ESeveritySnackBar,
  IWarningSnackBar,
  IUser,
  IMenuState,
  INotifications,
  CompanyData,
  DemandData,
  INegotiationDataState,
} from '../models/interfaces';

export const warningState = atom<IWarningSnackBar>({
  key: 'warningSnackBar',
  default: {
    isEnabled: false,
    description: 'Unknown error',
    severity: ESeveritySnackBar.ERROR,
  },
});

export const userState = atom<IUser | null>({
  key: 'userState',
  default: null,
});

export const notificationsState = atom<INotifications[]>({
  key: 'notificationsState',
  default: [],
});

export const menuState = atom<IMenuState>({
  key: 'menuState',
  default: {
    isOpened: false,
  },
});

export const companyState = atom<{ rows: CompanyData[], wasUpdated:boolean }>({
  key: 'companyState',
  default: {
    rows: [],
    wasUpdated: true,
  },
});

export const demandState = atom<{ rows: DemandData[], wasUpdated:boolean }>({
  key: 'demandState',
  default: {
    rows: [],
    wasUpdated: true,
  },
});

export const negotiationState = atom<INegotiationDataState>({
  key: 'negotiationState',
  default: {
    rows: [],
    wasUpdated: true,
  },
});
