import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Image,
  Modal,
  Form,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import closeIcon from '../assets/images/close.svg';

const ShareModal = ({ handleClick, handleClose }) => (
  <Modal centered show>
    <Modal.Header className="d-flex justify-content-between">
      <Modal.Title as="h6" className="fw-bold">
        Share
      </Modal.Title>
      <Button className="p-0 border-0" onClick={handleClose} aria-label="shareClose">
        <Image src={closeIcon} alt="Close" />
      </Button>
    </Modal.Header>
    <Modal.Body>
      <Form.Group className="form-group">
        <Form.Label>Custom URL</Form.Label>
        <InputGroup>
          <InputGroup.Text>https:/evs.com/</InputGroup.Text>
          <FormControl defaultValue="reportlinkexample" />
        </InputGroup>
      </Form.Group>
      <Form.Group className="d-flex">
        <Form.Label className="me-3">Custom URL</Form.Label> WFE
      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="blue" onClick={handleClick} aria-label="Copy">
        Copy
      </Button>
    </Modal.Footer>
  </Modal>
);
ShareModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleClick: PropTypes.func.isRequired,
};
export default ShareModal;
