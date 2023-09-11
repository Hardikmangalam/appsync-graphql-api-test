import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/locked-logo.svg';
import seramountLogo from '../../assets/images/seramount_locked_logo.svg';
import eabBranding from '../../assets/images/evs.jpg';
import seramountBranding from '../../assets/images/seramount.jpeg';
import { getSecureSessionData } from '../../graphqlOperations/encryprWrapper';

const isWaiting = true;
const isScreenLocked = false;
const LockedScreen = () => {
  const [isSeramount, setIsSeramount] = useState(true);

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    setIsSeramount(
      branding === null ? true : JSON.parse(getSecureSessionData('branding')),
    );
  }, [JSON.parse(getSecureSessionData('branding'))]);

  return (
    // const LockedScreen = ({ isWaiting, isScreenLocked }) => (
    <>
      <header
        className={classNames(
          { 'is-seramount': isSeramount },
          'locked-screen-header',
        )}
        style={{
          backgroundImage: `url(${
            isSeramount ? seramountBranding : eabBranding
          })`,
        }}
      >
        <Image
          src={isSeramount ? seramountLogo : logo}
          alt="Logo"
          width={isSeramount ? 192 : 108}
          className="mb-2"
        />
        {isSeramount === false ? (
          <div className="text-white mt-1">We Empower Inclusive Workplaces</div>
        ) : (
          ''
        )}
      </header>
      <section className="locked-screen-wrapper text-center">
        {isScreenLocked && (
          <>
            <div className="mb-5 fw-18" style={{ maxWidth: '486px' }}>
              Please join the conference line using the information below and
              wait for further instructions from the facilitator.
            </div>
            <Link
              className="text-blue mb-2 text-decoration-none fw-18"
              to="/"
              aria-label="Go to Dial-In page"
            >
              Dial-In#
            </Link>
            <div className="mt-1 fw-18" style={{ maxWidth: '486px' }}>
              US: +1 201-479-4595 // Outside US: +1 855-346-3893 Meeting Number:
              33911576 followed by the # key
            </div>
            <div className="text-bismark mt-4">
              You must dial in using a separate phone line to hear the audio
              when the session begins
            </div>
            {/* <div>
            Thank you for joining the session! This virtual focus group is
            likely a different medium than you're used to, but our experience
            has shown that the candor, quantitative and qualitative data we are able
            to obtain makes it a powerful research tool. Your participant in
            the session will be kept completely confidential, and we appreciate
            your candid responses.
            <div>
              <b>
                if you do not hear audio, please email{' '}
                <Link className="mt-1 fw-18" style={{ maxWidth: '486px' }}>
                  EVSsupport@seramount.com
                </Link>
                for help troubleshooting.
              </b>
            </div> 
          </div>*/}
          </>
        )}
        {isWaiting && (
          <>
            <div className="wrapper__heading mb-4">
              Waiting for the host to start this meeting
            </div>
            <div className="mb-2 fw-18">This is a recurring meeting</div>
            <div className="mt-1 fw-18">
              If you are the host, please{' '}
              <Link className="text-blue" to="/login" aria-label="Sign-In">
                sign in
              </Link>{' '}
              to start this meeting
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default LockedScreen;
