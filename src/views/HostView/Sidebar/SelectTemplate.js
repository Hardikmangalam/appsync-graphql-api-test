import classNames from 'classnames';
import React, { useState } from 'react';
import { Image, ListGroup } from 'react-bootstrap';
import tickIcon from '../../../assets/images/blue/check.svg';
import PropTypes from 'prop-types';

const SelectTemplate = ({ list, setTemplateId }) => {
  const [activeTemplate, setActiveTemplate] = useState();
  return (
    <ListGroup className="select-template-list">
      {list.map((obj, index) => (
        <ListGroup.Item
          key={index}
          onClick={() => {
            setActiveTemplate(index);
            setTemplateId(obj.id);
          }}
          className={classNames({ 'text-blue': activeTemplate == index })}
        >
          {obj.type_name}
          {activeTemplate == index && (
            <Image
              className="ms-auto"
              src={tickIcon}
              width={24}
              height={24}
              alt="tick-icon"
            />
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

SelectTemplate.propTypes = {
  list: PropTypes.array,
  setTemplateId: PropTypes.func,
};

export default SelectTemplate;
