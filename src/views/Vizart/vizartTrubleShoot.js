/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Button,
  DropdownButton,
  Dropdown,
  Form,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import logo from '../../assets/images/locked-logo.svg';
import eabBranding from '../../assets/images/evs.jpg';
import speaker from '../../assets/images/speaker.svg';
import alert from '../../assets/images/alert.svg';
import seramountLogo from '../../assets/images/seramount_locked_logo.svg';
import seramountBranding from '../../assets/images/seramount.jpeg';

import classNames from 'classnames';
import { getSecureSessionData } from '../../graphqlOperations/encryprWrapper';

const WizardTrubleShoot = ({ setVizart, testAgain, setPlaying }) => {
  const [viewContent, setViewContent] = useState(false);
  // const [isSeramount, setIsSeramount] = useState(true);

  return (
    <>
      <form
        className={`${
          getSecureSessionData('isLockedScreen') === 'true' ||
          getSecureSessionData('isLockedScreen') === true
            ? `${testAgain &&
                'thank_wizard_success2'} card col-md-9 thank_wizard_success thank_wizard_check`
            : 'card col-md-9 part_wizard_success'
        }`}
      >
        <div className="d-flex align-items-center modal-inner">
          {getSecureSessionData('isLockedScreen') === 'true' ||
          getSecureSessionData('isLockedScreen') === true ? (
            ''
          ) : (
            <div className="model-left">
              <Image src={speaker} alt="speaker" />
            </div>
          )}
          <div
            className={`${
              getSecureSessionData('isLockedScreen') === 'true' ||
              getSecureSessionData('isLockedScreen') === true
                ? 'ml-100'
                : 'success-model m-0'
            }`}
          >
            {!viewContent ? (
              <>
                <div>
                  <span>
                    <Image
                      src={alert}
                      className="ml-5"
                      style={{ paddingRight: '17px' }}
                      alt="alert"
                    />
                    <b className="fs-4">Check your computer volume</b>
                  </span>
                </div>
                <div className="d-flex">
                  <Button
                    style={{ width: '151px' }}
                    onClick={() => {
                      setViewContent(true);
                      setVizart(false);
                      setPlaying('PLAYING');
                    }}
                    aria-label='Test Again'
                    variant="primary"
                    className="mt-4 scs_btn_no"
                  >
                    Test Again
                  </Button>
                  <Button
                    style={{
                      marginRight: '24px',
                      minWidth: '151px',
                      justifyContent: 'center',
                    }}
                    onClick={() => setViewContent(true)}
                    variant="primary"
                    aria-label='Not Working'
                    className="mt-4 scs_btn_no"
                  >
                    Not Working
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span>
                    <Image
                      src={alert}
                      className="ml-5"
                      style={{ paddingRight: '17px' }}
                      alt="alert"
                    />
                    <b className="fs-4">Troubleshoot audio not working?</b>
                  </span>
                </div>
                <div className="mt-3">
                  <span>
                    Please contact the{' '}
                    <a href="#" accessKey="">
                      Seramount Team
                    </a>{' '}
                    for further assistance.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
};
WizardTrubleShoot.propTypes = {
  setVizart: PropTypes.func,
  setPlaying: PropTypes.func,
  testAgain: PropTypes.bool,
};
export default WizardTrubleShoot;
