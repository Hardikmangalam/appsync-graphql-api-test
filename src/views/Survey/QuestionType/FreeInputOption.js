import React from 'react';
import { Form, FormControl, InputGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

const FreeInputOption = ({
  data,
  handleOptionChange,
  from,
  erorrs,
  errors,
}) => {
  const handleOnChange = e => {
    if (from === 'preview') {
      handleOptionChange(data, e.target.value);
    }
  };

  return (
    <div key={data.page_id}>
      <Form className="registration-options">
        <Form.Label>
          {data.label} {data.isRequire && '*'}
        </Form.Label>
        <InputGroup>
          <FormControl
            value={data.answer}
            name="form_input"
            type="text"
            placeholder="Enter"
            onChange={e => handleOnChange(e)}
          />
        </InputGroup>
        {from === 'logic' && errors && errors.input && (
          <Form.Control.Feedback type="invalid" className="is-invalid-text">
            {errors.input}
          </Form.Control.Feedback>
        )}
        {data && data.has_error && erorrs && (
          <Form.Control.Feedback type="invalid" className="is-invalid-text">
            {erorrs && erorrs.input}
          </Form.Control.Feedback>
        )}
      </Form>
    </div>
  );
};

FreeInputOption.propTypes = {
  data: PropTypes.object,
  handleOptionChange: PropTypes.func,
  from: PropTypes.string,
  erorrs: PropTypes.object,
  payload: PropTypes.object,
  errors: PropTypes.object,
};

export default FreeInputOption;
