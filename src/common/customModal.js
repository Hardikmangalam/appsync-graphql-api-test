import React from 'react';
import PropTypes from 'prop-types';
import { Button, Image, Modal, Spinner } from 'react-bootstrap';
import closeIcon from '../assets/images/close.svg';

const CustomModal = ({
  isActive,
  children,
  title,
  handleClose,
  handleButtonClick,
  buttonTitle,
  size,
  buttonBottomTitle,
  buttonBottomFrom,
  handleSaveClick,
  bottomText,
  bottomTextFrom,
  handleModalTextClick,
  handleSpinner,
  isEdit,
  updateOptionData,
  editContent,
  selectKey,
  questionType,
}) => (
  <>
    <Modal size={size || 'sm'} centered show={isActive}>
      <Modal.Header className="d-flex justify-content-between">
        <Modal.Title as="h6" className="fw-bold">
          {title}
        </Modal.Title>
        <Button
          className="p-0 border-0"
          onClick={handleClose}
          aria-label="handleClose"
        >
          <Image src={closeIcon} alt="Close" />
        </Button>
      </Modal.Header>
      {children && <Modal.Body>{children}</Modal.Body>}
      <Modal.Footer>
        {bottomTextFrom && (
          <Button
            variant="link"
            onClick={handleModalTextClick}
            className="justify-content-start me-auto text-blue p-0 text-decoration-none"
            // aria-hidden="true"
            aria-label="Expand Information"
          >
            {bottomText}
          </Button>
        )}
        {!isEdit && buttonBottomFrom && (
          <Button
            variant="blue-10"
            className="text-blue justify-content-center"
            aria-label="handleSaveClick"
            onClick={handleSaveClick}
          >
            {buttonBottomTitle}
          </Button>
        )}
        <Button
          variant="blue"
          onClick={handleButtonClick}
          aria-label="Save-Click"
          disabled={
            editContent === '' ||
            updateOptionData === '' ||
            (questionType && questionType.toString() === '3'
              ? false
              : selectKey &&
                selectKey.response &&
                selectKey.response.length === 0) ||
            (selectKey && selectKey.label === '')
          }
        >
          {buttonTitle}
          {handleSpinner && (
            <Spinner
              className="ms-2"
              animation="border"
              role="status"
              size="sm"
            />
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  </>
);

CustomModal.propTypes = {
  children: PropTypes.element,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
  buttonTitle: PropTypes.string.isRequired,
  size: PropTypes.string,
  buttonBottomTitle: PropTypes.string,
  handleSaveClick: PropTypes.func,
  selectKey: PropTypes.array,
  buttonBottomFrom: PropTypes.bool,
  bottomText: PropTypes.string,
  bottomTextFrom: PropTypes.bool,
  handleModalTextClick: PropTypes.func,
  handleButtonClick: PropTypes.func,
  handleSpinner: PropTypes.bool,
  isEdit: PropTypes.bool,
  updateOptionData: PropTypes.string,
  editContent: PropTypes.object,
  questionType: PropTypes.number,
};
export default CustomModal;
