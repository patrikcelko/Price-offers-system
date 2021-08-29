import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useRecoilState, useRecoilValue } from 'recoil';
import useSWR from 'swr';
import React, { Fragment } from 'react';
import WarningIcon from '@material-ui/icons/Warning';
import CompaniesRow from './CopmaniesRow/CompaniesRow';
import DefaultTable from '../DefaultTable/DefaultTable';
import { companyState, userState, warningState } from '../../../store/atom';
import { CompanyData, ESeveritySnackBar } from '../../../models/interfaces';
import CreateCompany from '../../CreateCompany/CreateCompany';
import './Companies.css';

const Companies = () => {
  const mobile = useMediaQuery('(max-width:1000px)');
  const user = useRecoilValue(userState);
  const colNames = (mobile) ? ['', 'Business ID', 'Name'] : ['Business ID', 'Name', 'Residence', 'Specialization', 'Contact', 'Actions'];
  const [companies, setCompanies] = useRecoilState(companyState);
  const [state, setState] = useRecoilState(warningState);

  const fetcher = (url: string, token: string) => fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(async (res) => res.json());

  const { error, data } = useSWR(['/company', user?.token], fetcher);
  if (error && !state) {
    setState({
      isEnabled: true,
      description: 'Failed to load data.',
      severity: ESeveritySnackBar.ERROR,
    });
  }
  if (!data) {
    if (!state) {
      setState({
        isEnabled: true,
        description: 'Loading copanies data',
        severity: ESeveritySnackBar.INFO,
      });
    }
  }
  if (companies.wasUpdated && data != null) {
    setCompanies({
      rows: data?.companies,
      wasUpdated: false,
    });
  }

  const rows: CompanyData[] = companies?.rows;
  return rows.length === 0
    ? (
      <>
        <div className="companies__warning-container">
          <div className="companies__warning-container__warning-text">
            <WarningIcon className="companies__warning-container__warning-text__icon" />
            <br />
            Sorry, but you do not have any company in our database.
          </div>
        </div>
        <CreateCompany />
      </>
    ) : (
      <>
        <DefaultTable
          colNames={colNames}
          rows={rows?.map((row: CompanyData) => (
            <CompaniesRow
              key={row?.uuid}
              mobile={mobile}
              businessId={row?.company_id}
              name={row?.name}
              residence={row?.residence}
              specialization={row?.specialization}
              contact={row?.phone}
              uuid={row?.uuid}
            />
          ))}
        />
        <CreateCompany />
      </>
    );
};

export default Companies;
