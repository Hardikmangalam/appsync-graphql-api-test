import React from 'react';
import { Dropdown, Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import moreIcon from '../assets/images/more-horizontal.svg';

const DropdownAction = ({ options, changeUserPermissionHandler, user_id }) => (
  <Dropdown align="end" className="ms-auto">
    <div className="custom-navbar__dropdown">
      <Dropdown.Toggle className="p-0">
        <Image
          className="custom-navbar__arrow"
          src={moreIcon}
          width={24}
          height={24}
          alt="Arrow"
        />
      </Dropdown.Toggle>
    </div>
    <Dropdown.Menu>
      {options.map((option, i) =>
        typeof option == 'object' ? (
          <Dropdown.Item
            onClick={() =>
              changeUserPermissionHandler({
                showModal: true,
                permission_id: option.id,
                user_id,
                permission_name: option.name,
              })
            }
            key={option.id}
            value={option.id}
          >
            {option.name}
          </Dropdown.Item>
        ) : (
          <Dropdown.Item key={i}>{option}</Dropdown.Item>
        ),
      )}
    </Dropdown.Menu>
  </Dropdown>
);

DropdownAction.propTypes = {
  options: PropTypes.array,
  changeUserPermissionHandler: PropTypes.func,
  user_id: PropTypes.number,
};

export default DropdownAction;
