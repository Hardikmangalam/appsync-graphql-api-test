import React, { useRef, useState } from 'react';
import {
  Dropdown,
  Form,
  Image,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { useClickOutside } from '../../../hooks/useClickOutside';
import plusIcon from '../../../assets/images/plus.svg';
import checkIcon from '../../../assets/images/blue/check.svg';
import broadcastIcon from '../../../assets/images/broadcast.svg';
import downArrow from '../../../assets/images/down-arrow.svg';

const VoiceSessionDropdown = () => {
  const OPTIONS = [
    'Employee Voice Session Demo',
    'Session Demo Name 2',
    'Session Demo Name 3',
    'Session Demo Name 4',
  ];

  const [activeOptionIndex, setActiveOptionIndex] = useState(1);
  const [contentEditable, setContentEditable] = useState(false);
  const [options, setOptions] = useState(OPTIONS);

  const clickRef = useRef();

  useClickOutside(clickRef, () => {
    setContentEditable(false);
  });

  const handleKeydown = e => {
    if (e.key == 'Enter') {
      const newArr = [...options]; // copying the old datas array
      newArr[activeOptionIndex] = e.target.value;
      setOptions(newArr);
    }

    if (e.key == 'Enter' || e.key == 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setContentEditable(false);
    }
  };

  return (
    <Dropdown className="voice-session ms-0">
      <div className="custom-navbar__dropdown">
        {contentEditable ? (
          <Form.Control
            defaultValue={options[activeOptionIndex]}
            onKeyDown={handleKeydown}
            ref={clickRef}
          />
        ) : (
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none fs-6"
            onDoubleClick={() => {
              setContentEditable(true);
            }}
          >
            <div className="custom-navbar__title">
              <div className="fw-bold text-truncate text-white">
                {options[activeOptionIndex]}
              </div>
            </div>
            <Image
              className="custom-navbar__arrow invert-white ms-2"
              src={downArrow}
              width={24}
              height={24}
              alt="Arrow"
            />
          </Dropdown.Toggle>
        )}
      </div>
      <Dropdown.Menu>
        {options.map((option, index) => (
          <Dropdown.Item
            active={index == activeOptionIndex}
            key={option}
            onClick={() => setActiveOptionIndex(index)}
          >
            {index == activeOptionIndex && <Image src={checkIcon} alt="checkIcon"/>}
            {option}
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip className="voice-session-tooltip">
                  Session Started
                </Tooltip>
              }
            >
              <Image src={broadcastIcon} className="broadcast" alt="broadcastIcon"/>
            </OverlayTrigger>
          </Dropdown.Item>
        ))}

        <Dropdown.Divider />
        <Dropdown.Item>
          <Image src={plusIcon} alt="plusIcon"/>
          New Session
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default VoiceSessionDropdown;
