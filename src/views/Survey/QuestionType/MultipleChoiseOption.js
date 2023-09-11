import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const MultipleChoiseOption = ({
  data,
  pagedata,
  handleOptionChange,
  from,
  onChange,
  erorrs,
  payload,
  errors,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  useEffect(() => {
    if (payload && payload.length > 0) {
      setSelectedOptions(payload);
      onChange({ contentOptions: payload });
    }
  }, [payload]);

  const handleOnChange = (e, index, option) => {
    let updatedData = [];
    if (from === 'logic') {
      if (e.target.checked) {
        updatedData = [...selectedOptions, index.toString()];
        setSelectedOptions([...selectedOptions, index.toString()]);
      } else {
        updatedData =
          selectedOptions &&
          selectedOptions.length > 0 &&
          selectedOptions.filter(opt => opt !== index.toString());
        setSelectedOptions(updatedData);
      }

      onChange({ contentOptions: updatedData });
    }

    if (from === 'preview') {
      handleOptionChange(data, pagedata, index, option);
    }
  };

  return (
    <>
      <Form className="registration-options">
        <Form.Label>
          {data.label} {data.isRequire && '*'}
        </Form.Label>
        {data.optionsValue &&
          data.optionsValue.length > 0 &&
          data.optionsValue.map((option, index) => (
            <>
              <Form.Check
                className={`checkbox ${from === 'logic' &&
                  classNames({ 'is-invalid': errors.options })}`}
              >
                <Form.Check.Input
                  id={`${from}-${data.id}-${index}`}
                  className="checkbox-input"
                  aria-label={option}
                  value={option}
                  checked={
                    from === 'logic'
                      ? selectedOptions &&
                        selectedOptions.includes(index.toString())
                      : data.is_checked &&
                        data.is_checked.includes(index.toString())
                  }
                  onChange={e => handleOnChange(e, index, option)}
                />
                <Form.Check.Label
                  htmlFor={`${from}-${data.id}-${index}`}
                  className="checkbox-label"
                >
                  {option}
                </Form.Check.Label>
              </Form.Check>
            </>
          ))}
        {from === 'logic' && errors && errors.options && (
          <Form.Control.Feedback type="invalid" className="is-invalid-text">
            {errors.options}
          </Form.Control.Feedback>
        )}
        {data && data.has_error && (
          <Form.Control.Feedback type="invalid" className="is-invalid-text">
            {erorrs && erorrs.options}
          </Form.Control.Feedback>
        )}
      </Form>
    </>
  );
};

MultipleChoiseOption.propTypes = {
  data: PropTypes.object,
  pagedata: PropTypes.object,
  handleOptionChange: PropTypes.func,
  onChange: PropTypes.func,
  from: PropTypes.string,
  erorrs: PropTypes.object,
  payload: PropTypes.object,
  errors: PropTypes.object,
};

export default MultipleChoiseOption;
