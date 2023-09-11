/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Sound from 'react-sound';
import { Form } from 'react-bootstrap';
import EabLogo from '../../../assets/images/EABbrand.svg';
import seraLogo from '../../../assets/images/EABseramount.svg';
import { getSecureSessionData } from '../../../graphqlOperations/encryprWrapper';

const SoundCheck = ({ setOpen, removeDisplayCSS }) => {
  const anon_id =
    JSON.parse(getSecureSessionData('UserData')) &&
    JSON.parse(getSecureSessionData('UserData')).user_id;

  const [isSeramount, setIsSeramount] = useState(true);

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    setIsSeramount(
      branding === null ? true : JSON.parse(getSecureSessionData('branding')),
    );
  }, [JSON.parse(getSecureSessionData('branding'))]);

  return (
    <>
      <div
        className="login_wrapper_main h-100-vh"
        style={{
          backgroundImage: `url(${isSeramount ? seraLogo : EabLogo})`,
        }}
      >
        <div className="container h-100-vh">
          <div className="col-lg-6 mx-auto h-100-vh">
            <form
              className="card p-136-80 align-items-center d-flex top-25"
              style={{ borderColor: '#777' }}
            >
              <p
                style={{ marginBottom: '20px', fontSize: '20px' }}
                className="text-bismark mt-1"
              >
                You will enter the session as:
              </p>
              <Form.Group className="form-group">
                <h3 className="mb-1" style={{ fontSize: '28px' }}>
                  {anon_id}
                </h3>
              </Form.Group>

              <button
                type="submit"
                className="login__submitbtn"
                aria-label="Enter_Session"
                onClick={e => {
                  e.preventDefault();
                  sessionStorage.removeItem('isPageRefreshed');
                  removeDisplayCSS();
                  setOpen(false);
                }}
              >
                Enter session
              </button>
              <span className="mt-3" style={{ fontsize: '16px' }}>
                {' '}
                <p className="text-bismark mt-1">
                  Thank you in advance for joining this Employee Voice Session.
                  Your participation will be completely confidential.Seramount
                  reports responses only in an anonymized and aggregated
                  format.Your name will not appear in any reports on this
                  session, either as a participant or as the individual who
                  provided a particular response, To ensure your anonymity can
                  be maintained, please do not provide any identifying
                  information in the session.
                </p>
              </span>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
SoundCheck.propTypes = {
  setOpen: PropTypes.func,
  removeDisplayCSS: PropTypes.func,
};

export default SoundCheck;
