import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import './DefaultTable.css';
import { IDefaultTableProps } from '../../../models/interfaces';

const DefaultTable = ({
  colNames,
  rows,
}: IDefaultTableProps) => (
  <TableContainer component={Paper} className="default-table">
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          {colNames?.map((name: string) => <TableCell key={name} align="center">{name}</TableCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows?.map((row) => row)}
      </TableBody>
    </Table>
  </TableContainer>
);

export default DefaultTable;
