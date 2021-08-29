import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useRecoilState, useRecoilValue } from 'recoil';
import useSWR from 'swr';
import React from 'react';
import WarningIcon from '@material-ui/icons/Warning';
import { demandState, userState, warningState } from '../../../store/atom';
import DefaultTable from '../DefaultTable/DefaultTable';
import DemandsRow from './DemandsRow/DemandsRow';
import { DemandData, ESeveritySnackBar } from '../../../models/interfaces';
import CreateDemand from '../../CreateDemand/CreateDemand';
import './Demand.css';

export const createData = (demand: DemandData) => ({
  demandId: demand.uuid,
  name: demand.name,
  until: new Date(demand.until),
  budget: demand.budget,
  description: demand.description,
  status: demand.status,
  creatorUUID: demand.creator_uuid,
});

const Demands = () => {
  const mobile = useMediaQuery('(max-width:1000px)');
  const user = useRecoilValue(userState);
  const colNames = (mobile) ? ['', 'Name', 'Status'] : ['Name', 'Status', 'Budget', 'Until', 'Description', 'Actions'];
  const [demands, setDemands] = useRecoilState(demandState);
  const [state, setState] = useRecoilState(warningState);

  const fetcher = (url: string, token: string) => fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(async (res) => res.json());

  const { error, data } = useSWR(['/demand', user?.token], fetcher);
  if (error) {
    if (!state) {
      setState({
        isEnabled: true,
        description: 'Was not able to load data (demands).',
        severity: ESeveritySnackBar.INFO,
      });
    }
  }
  if (!data) {
    if (!state) {
      setState({
        isEnabled: true,
        description: 'Loading user data',
        severity: ESeveritySnackBar.INFO,
      });
    }
    return null;
  }
  if (demands.wasUpdated && data != null) {
    setDemands({
      rows: data?.demands,
      wasUpdated: false,
    });
  }

  const rows: DemandData[] = demands?.rows;
  return rows.length === 0
    ? (
      <>
        <div className="demand__warning-container">
          <div className="demand__warning-container__warning-text">
            <WarningIcon className="demand__warning-container__warning-text__icon" />
            <br />
            Sorry, but now there are no demands in our database.
            Be welcome to create some or came later.
          </div>
        </div>
        <CreateDemand />
      </>
    ) : (
      <>
        <DefaultTable
          colNames={colNames}
          rows={rows.map((row: DemandData) => (
            <DemandsRow
              key={row.uuid}
              mobile={mobile}
              name={row.name}
              demandId={row.uuid}
              until={new Date(row.until)}
              budget={row.budget}
              description={row.description}
              status={row.status}
              creatorUUID={row.creator_uuid}
            />
          ))}
        />
        <CreateDemand />
      </>
    );
};

export default Demands;
