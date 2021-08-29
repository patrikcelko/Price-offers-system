import NumberFormat from 'react-number-format';

export interface IFormInputLogin {
  email: string;
  password: string;
}

export interface IFormInputRegister {
  name: string;
  email: string;
  password: string;
  passwordAgain: string;
}

export interface IUserLogOut {
  logout: () => void;
}

export interface IUpdateProfile {
  name: string,
  oldPasswrod: string,
  newPassword: string
}

export interface IMessageSender {
  message: string
}

export interface INegotiationEditor {
  status: string,
  price: string
}

export interface IUpdateCompany {
  name: string,
  residence: string,
  specialization: string,
  phone: string,
}

export interface ICreateCompany {
  name: string,
  residence: string,
  specialization: string,
  phone: string,
  companyID: string
}

export interface IWarningSnackBar {
  isEnabled: boolean;
  description: string;
  severity: ESeveritySnackBar
}

export interface IUser {
  name: string,
  email: string,
  uuid: string,
  token: string
}

export interface INotifications {
  created: string,
  description: string,
  user_uuid: string,
  uuid: string
}

export enum ESeveritySnackBar {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface IRegisterProps {
  login: boolean,
  setAuthTab: React.Dispatch<React.SetStateAction<number>>,
}

export interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface IMenuState {
  isOpened: boolean;
}

export interface IHeaderProps {
  loggedIn: boolean;
}

export interface CompanyData {
  uuid: string,
  user_uuid: string,
  company_id: number,
  name: string,
  residence: string,
  specialization: string,
  phone: string
}

export interface ICompanyDataAdv {
  uuid: string,
  user_uuid: string,
  company_id: number,
  name: string,
  residence: string,
  specialization: string,
  is_deleted: boolean,
  phone: string
}

export interface CompanyRow {
  businessId: number,
  name: string,
  residence: string,
  specialization: string,
  contact: string
}

export interface DemandData {
  uuid: string,
  creator_uuid: string,
  name: string,
  budget: number,
  create_date: string,
  status: string,
  description: string,
  until: string,
}

export interface IDemandDataAdv {
  uuid: string,
  creator_uuid: string,
  name: string,
  budget: number,
  create_date: string,
  status: string,
  description: string,
  until: string,
}

export interface DemandRow {
  demandId: string,
  name: string,
  until: Date,
  budget: number,
  description: string,
  status: string
}

export interface INegotiationsRowProps {
  mobile: boolean,
  demandName: string,
  negotiationId: string,
  businessId: number,
  price: number,
  messages: MessageData[],
  status: string,
  demandOwner: string,
  businessOwner: string
}

export interface INegotiationDataState {
  rows: NegotiationData[],
  wasUpdated: boolean,
}

export interface NegotiationData {
  uuid: string,
  demand: IDemandDataAdv,
  company: ICompanyDataAdv,
  last_change: string,
  price: number,
  status: string,
  Message: MessageData[]
}

export interface INegotEditProps {
  negotiationData: INegotiationsRowProps;
}

export interface NegotiationRow {
  negotiationId: string,
  demandId: string,
  businessId: number,
  price: number,
  messages: MessageData[],
  status: string,
  demandOwner: string,
  busnisOwner: string
}

export interface MessageData {
  uuid: string,
  sender_uuid: string,
  last_change: string,
  negotiation_uuid: string
  is_deleted: boolean,
  content: string
}

export interface ICompaniesRowProps {
  mobile: boolean,
  businessId: number,
  name: string,
  residence: string,
  specialization: string,
  contact: string,
  uuid: string
}

export interface IDemandsRowProps {
  mobile: boolean,
  demandId: string,
  name: string
  until: Date,
  budget: number,
  description: string,
  status: string,
  creatorUUID: string,
}

export interface ICreateDemand {
  name: string,
  budget: number,
  description: string,
  until: string
}

export interface IUpdateDemand {
  budget: number,
  description: string,
  until: string
}

export interface IDefaultTableProps {
  colNames: string[],
  rows: JSX.Element[],
}

export interface ICreateNegotiation {
  companyId: string,
  price: number,
}

export interface ICreateNegotiationProps {
  demandId: string,
}

export interface INumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}
