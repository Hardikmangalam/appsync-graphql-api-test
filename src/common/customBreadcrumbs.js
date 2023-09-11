import React from 'react';
import Proptypes from 'prop-types';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CustomBreadcrumbs = ({ breadCrumb }) => (
  <Breadcrumb>
    {breadCrumb &&
      breadCrumb.map((obj, idx) => (
        <>
          <Breadcrumb.Item
            linkAs={Link}
            linkProps={{ to: obj.url }}
            active={idx + 1 === breadCrumb.length}
          >
            {obj.title}
          </Breadcrumb.Item>
        </>
      ))}
  </Breadcrumb>
);

CustomBreadcrumbs.propTypes = {
  breadCrumb: Proptypes.array.isRequired,
};

export default CustomBreadcrumbs;
