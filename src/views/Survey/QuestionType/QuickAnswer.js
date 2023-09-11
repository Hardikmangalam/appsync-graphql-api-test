/* eslint-disable indent */
/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import classNames from 'classnames';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

const QuickAnswer = ({
  data,
  onChange,
  handleValidationChange,
  // erorrs,
  emailValue,
  from,
  handleEmailChange,
  confirmMail,
  setConfirmMail,
  setIsvalid,
  setIsvalidBranding,
  domainArray,
}) => {
  const [confirmMailError, setconfirmError] = useState();
  const [barndingError, setBarndingError] = useState();

  const handleChange = val => {
    if (from === 'preview') {
      handleValidationChange(val);
      handleEmailChange(data);
    } else {
      onChange({ contentOptions: val });
    }
  };

  const validateForm = val => {
    const error = {};
    if (emailValue !== val) {
      error.confirmEmail = 'Email fields do not match';
      setIsvalid(true);
    }
    if (emailValue === val) {
      error.confirmEmail = '';
      setIsvalid(false);
    }
    if (val === '') {
      error.confirmEmail = 'Please confirm your email';
    }
    setconfirmError(error.confirmEmail);
    setConfirmMail(val);
  };

  const validateBranding = val => {
    const error = {};

    if (confirmMail !== undefined && confirmMail !== '') {
      setconfirmError('Email fields do not match');
      setIsvalid(true);
    }
    if (val === confirmMail) {
      setconfirmError('');
      setIsvalid(false);
    }

    if (confirmMail === '') {
      setconfirmError('Please confirm your email');
    }

    if (confirmMail === undefined || confirmMail === '') {
      setIsvalid(true);
    }

    const isEmail = RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
    if (!isEmail.test(val)) {
      error.email = 'Please enter a valid Email';
      setBarndingError(error.email);
      return;
    }
    if (isEmail.test(val)) {
      error.email = '';
      setBarndingError(error.email);
      setIsvalidBranding(false);
    }

    if (!val.includes('@') && !val.includes('.')) {
      error.email = 'Please enter a valid Email';
      setIsvalidBranding(true);
    } else {
      if (domainArray && domainArray.length > 0) {
        var res = val.split('@');
        if (res.length > 1 && domainArray.includes(res[1])) {
          error.email = '';
          setIsvalidBranding(false);
        } else {
          error.email = 'Please enter a valid Email';
          setIsvalidBranding(true);
        }
      } else {
        error.email = '';
        setIsvalidBranding(false);
      }
    }
    setBarndingError(error.email);
  };

  return (
    <>
      <div className="d-flex my-5">
        <Form.Group className="form-group mb-0">
          <Form.Label>
            {data.label}
            {data.isRequire && '*'}
          </Form.Label>
          <Form.Control
            type="email"
            required
            name="email"
            value={emailValue}
            placeholder="Enter"
            style={{ width: '484px' }}
            onChange={e => {
              setIsvalid(true);
              handleChange(e.target.value);
              validateBranding(e.target.value);
            }}
            className={classNames({ 'is-invalid': barndingError })}
          />
          {barndingError && (
            <Form.Control.Feedback type="invalid">
              {barndingError}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </div>
      <div className="d-flex my-5">
        <Form.Group className="form-group mb-0">
          <Form.Label>
            Please confirm your email address
            {data.isRequire && '*'}
          </Form.Label>
          <Form.Control
            type="confirmEmail"
            required
            name="confirmEmail"
            value={confirmMail}
            placeholder="Enter"
            style={{ width: '484px' }}
            onChange={e => {
              validateForm(e.target.value);
            }}
            className={`${
              confirmMailError !== '' && confirmMailError !== undefined
                ? 'is-invalid'
                : ''
            }`}
          />
          {confirmMailError && (
            <Form.Control.Feedback
              type="invalid"
              className={`${
                confirmMailError !== '' && confirmMailError !== undefined
                  ? 'is-invalid'
                  : ''
              }`}
            >
              &nbsp;{confirmMailError}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </div>
    </>
  );
};

QuickAnswer.propTypes = {
  onChange: PropTypes.func,
  data: PropTypes.object,
  from: PropTypes.string,
  handleValidationChange: PropTypes.func,
  domainArray: PropTypes.array,
  emailValue: PropTypes.string,
  handleEmailChange: PropTypes.func,
  confirmMail: PropTypes.string,
  setConfirmMail: PropTypes.func,
  setIsvalid: PropTypes.func,
  setIsvalidBranding: PropTypes.func,
};
export default QuickAnswer;
