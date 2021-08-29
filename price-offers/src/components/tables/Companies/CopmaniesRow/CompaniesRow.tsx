import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import CollapseButton from '../../../buttons/CollapseButton/CollapseButton';
import EditCompany from '../../../EditCompany/EditCompany';
import { ICompaniesRowProps } from '../../../../models/interfaces';

const CompaniesRow = ({
  mobile,
  businessId,
  name,
  residence,
  specialization,
  contact,
  uuid,
}: ICompaniesRowProps) => {
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
        <TableCell align="center" component="th" scope="row">
          {businessId}
        </TableCell>
        <TableCell align="center">{name}</TableCell>
        {(mobile) ? null
          : (
            <>
              <TableCell align="center">{residence}</TableCell>
              <TableCell align="center">{specialization}</TableCell>
              <TableCell align="center">{contact}</TableCell>
              <TableCell align="center">
                <EditCompany
                  mobile={mobile}
                  businessId={businessId}
                  name={name}
                  residence={residence}
                  specialization={specialization}
                  contact={contact}
                  uuid={uuid}
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
                  <b>Residence:</b>
                  {' '}
                  {residence}
                  <br />
                  <b>Specialization:</b>
                  {' '}
                  {specialization}
                  <br />
                  <b>Contact:</b>
                  {' '}
                  {contact}
                  <br />
                  <EditCompany
                    mobile={mobile}
                    businessId={businessId}
                    name={name}
                    residence={residence}
                    specialization={specialization}
                    contact={contact}
                    uuid={uuid}
                  />
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        ) : null}
    </>
  );
};

export default CompaniesRow;
