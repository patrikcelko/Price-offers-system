import React from 'react';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import CollapseButton from '../../../buttons/CollapseButton/CollapseButton';
import { IDemandsRowProps } from '../../../../models/interfaces';
import EditDemand from '../../../EditDemand/EditDemand';
import '../Demand.css';

const DemandsRow = ({
  mobile,
  demandId,
  name,
  until,
  budget,
  description,
  status,
  creatorUUID,
}: IDemandsRowProps) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <TableRow hover>
        {(mobile)
          ? (
            <TableCell>
              <CollapseButton open={open} setOpen={setOpen} />
            </TableCell>
          ) : null}
        <TableCell align="center">{name}</TableCell>
        <TableCell align="center">
          {
            (status === 'open')
              ? (
                <>
                  <LockOpenIcon className="demand__lock-icon-open" />
                  <span className="demand__lock-text-open">
                    OPEN
                  </span>
                </>
              ) : (
                <>
                  <LockIcon className="demand__lock-icon-locked" />
                  <span className="demand__lock-text-locked">
                    CLOSED
                  </span>
                </>
              )
          }
        </TableCell>
        {(mobile) ? null
          : (
            <>
              <TableCell align="center">{`${budget}€`}</TableCell>
              <TableCell align="center">{until.toLocaleDateString()}</TableCell>
              <TableCell align="center">{description}</TableCell>
              <TableCell align="center">
                <EditDemand
                  mobile={mobile}
                  demandId={demandId}
                  name={name}
                  until={until}
                  budget={budget}
                  description={description}
                  status={status}
                  creatorUUID={creatorUUID}
                />
              </TableCell>
            </>
          )}
      </TableRow>
      {mobile
        ? (
          <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <Box margin={1}>
                  <b>{'Until: '}</b>
                  {until.toLocaleDateString()}
                  <br />
                  <b>{'Budget: '}</b>
                  {`${budget}€`}
                  <br />
                  <b>{'Description: '}</b>
                  {description}
                  <br />
                  <EditDemand
                    mobile={mobile}
                    demandId={demandId}
                    name={name}
                    until={until}
                    budget={budget}
                    description={description}
                    status={status}
                    creatorUUID={creatorUUID}
                  />
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        ) : null}
    </>
  );
};

export default DemandsRow;
