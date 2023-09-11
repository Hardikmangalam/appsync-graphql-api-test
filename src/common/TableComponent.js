import React from 'react';
import { Table } from 'react-bootstrap';
import PropTypes from 'prop-types';

const TableComponent = ({
  cols,
  data,
  // bordered,
  // hoverable,
  // striped,
  // isDark,
}) => (
  <div className="table-responsive" role="table" aria-label="Table Data">
    <Table className="table">
      <thead>
        <tr>
          {cols.map((headerItem, index) => (
            <th
              scope="col"
              className="text-capitalize"
              colSpan={headerItem.colSpan ? headerItem.colSpan : 0}
              key={index}
            >
              {headerItem.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data &&
          data.map((item, index) => (
            <tr key={index} role="row">
              {cols.map((col, i) => (
                <td key={i} role="cell">
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </Table>
  </div>
);

TableComponent.propTypes = {
  cols: PropTypes.array,
  data: PropTypes.array,
  // bordered: PropTypes.bool,
  // hoverable: PropTypes.bool,
  // striped: PropTypes.bool,
  // isDark: PropTypes.bool,
};

export default TableComponent;
