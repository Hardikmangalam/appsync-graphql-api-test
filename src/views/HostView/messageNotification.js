/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Toast, ToastContainer } from 'react-bootstrap';
import injectReducer from '../../utils/injectReducer';
import reducer from '../../store/reducers/error';
import doneIcon from '../../assets/images/doneIcon.png';
import closeIcon from '../../../src/assets/images/crossIcon.png';
import { getSecureSessionData } from '../../graphqlOperations/encryprWrapper';

const MessageNotification = ({ error }) => {
  const [show, setShow] = useState(false);
  const [stateError, setStateError] = useState(error);

  useEffect(() => {
    const { type, message } = error;
    // Add Success, Warning, Alert here
    if (message && message !== undefined && typeof message === 'string') {
      setStateError(error);
      setShow(true);
    }
  }, [error]);

  return show && stateError.message && stateError.message !== undefined ? (
    <div
      aria-live="polite"
      aria-atomic="true"
      // className="bg-dark position-relative"
      // style={{ minHeight: '240px' }}
      // position="top-center"
    >
      <ToastContainer
        className={
          getSecureSessionData('templateView') === 'true'
            ? 'message-container-temp p-3'
            : 'message-container p-3'
        }
        position="top-center"
      >
        <Toast
          delay={5000}
          autohide
          className={
            getSecureSessionData('templateView') === 'true'
              ? 'message-toast-temp'
              : 'message-toast'
          }
          onClose={() => setShow(false)}
          show={show}
        >
          <Toast.Header>
            <img
              src={
                stateError &&
                Object.keys(stateError || {}).length &&
                stateError.type == 'success'
                  ? doneIcon
                  : closeIcon
              }
              className="rounded me-2"
              alt="closeIcon"
            />
            <strong className="me-auto fa-circle-xmark">
              {stateError.message !== undefined && stateError.message}
            </strong>
          </Toast.Header>
        </Toast>
      </ToastContainer>
    </div>
  ) : (
    <></>
  );
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { error } = state;
  return {
    error,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

MessageNotification.propTypes = {
  error: PropTypes.object,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(MessageNotification);
