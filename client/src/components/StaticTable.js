import React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function CustomTable({ data, columns }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(10);

  if (!Array.isArray(data)) {
    // Handle the case when data is not an array (e.g., 0 results)
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <p> Sorry, no results found. </p>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sx={{backgroundColor: '#008F7A', color: "white", fontWeight: "bold"}}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, rowIndex) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column.field} align={column.align || 'left'}>
                      {row[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}