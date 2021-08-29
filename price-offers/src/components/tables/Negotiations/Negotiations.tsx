import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useRecoilState, useRecoilValue } from 'recoil';
import useSWR from 'swr';
import WarningIcon from '@material-ui/icons/Warning';
import { ESeveritySnackBar, NegotiationData } from '../../../models/interfaces';
import { negotiationState, userState, warningState } from '../../../store/atom';
import DefaultTable from '../DefaultTable/DefaultTable';
import NegotiationsRow from './NegotiationsRow/NegotiationsRow';
import './Negotiations.css';

const Negotiations = () => {
  const mobile = useMediaQuery('(max-width:1000px)');
  const user = useRecoilValue(userState);
  const colNames = (mobile) ? ['', 'Demand Name', 'Business ID'] : ['', 'Demand Name', 'Business ID', 'Suggested price', 'Status', 'Actions'];
  const [{ rows, wasUpdated }, setNegotations] = useRecoilState(negotiationState);
  const [state, setState] = useRecoilState(warningState);

  const fetcher = (url: string, token: string) => fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(async (res) => res.json());

  const { error, data } = useSWR(['/negotiation', user?.token], fetcher);
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
        description: 'Loading negotation data',
        severity: ESeveritySnackBar.INFO,
      });
    }
  }
  if (wasUpdated && data != null) {
    setNegotations({
      rows: data?.negotiations,
      wasUpdated: false,
    });
  }

  const rowsValue: NegotiationData[] = rows;
  return rowsValue.length === 0
    ? (
      <>
        <div className="negotiations__warning-container">
          <div className="negotiations__warning-container__warning-text">
            <WarningIcon className="negotiations__warning-container__warning-text__icon" />
            <br />
            Sorry, but you do not have any negotiations.
            Please feel free to create some through section Demands.
          </div>
        </div>
      </>
    ) : (
      <DefaultTable
        colNames={colNames}
        rows={rowsValue.map((row: NegotiationData) => (
          <NegotiationsRow
            key={row.uuid}
            mobile={mobile}
            negotiationId={row.uuid}
            demandName={row.demand.name}
            businessId={row.company.company_id}
            price={row.price}
            messages={row.Message}
            status={row.status}
            businessOwner={row.company.user_uuid}
            demandOwner={row.demand.creator_uuid}
          />
        ))}
      />
    );
};

export default Negotiations;
