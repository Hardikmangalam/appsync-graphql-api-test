import React from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

const SaveTemplate = ({ handleChange }) => (
  <Form>
    <Form.Group className="form-group mb-0">
      <Form.Label>Template Name</Form.Label>
      <Form.Control
        onChange={e => handleChange(e.target.value)}
        type="text"
        placeholder="Enter"
      />
    </Form.Group>
  </Form>
);

SaveTemplate.propTypes = {
  handleChange: PropTypes.func,
};
export default SaveTemplate;
