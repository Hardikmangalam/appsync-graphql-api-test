import React from 'react';
import PropTypes from 'prop-types';
import { Button, Image, Modal } from 'react-bootstrap';
import closeIcon from '../assets/images/close.svg';

const DeleteModal = ({
  size,
  children,
  title,
  handleClick,
  buttonBottomTitle,
  handleSaveClick,
  handleClose,
  isActive,
  buttonTitle,
}) => (
  <Modal size={size || 'sm'} centered show={isActive}>
    <Modal.Header className="d-flex justify-content-between">
      <Modal.Title as="h6" className="fw-bold">
        {title}
      </Modal.Title>
      <Button className="p-0 border-0" onClick={handleClose} aria-label="deleteClose">
        <Image src={closeIcon} alt="Close" />
      </Button>
    </Modal.Header>
    <Modal.Body>{children}</Modal.Body>
    <Modal.Footer>
      <Button
        variant="blue-10"
        aria-label="handleClickSave"
        className="text-blue justify-content-center"
        onClick={handleSaveClick}
      >
        {buttonBottomTitle}
      </Button>
      <Button variant="blue" onClick={handleClick} aria-label="handleClick">
        {buttonTitle}
      </Button>
    </Modal.Footer>
  </Modal>
);
DeleteModal.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  buttonTitle: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  size: PropTypes.string,
  buttonBottomTitle: PropTypes.string,
  handleSaveClick: PropTypes.func,
};
export default DeleteModal;
