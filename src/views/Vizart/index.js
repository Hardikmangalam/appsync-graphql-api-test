/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Sound from 'react-sound';
import { Image, Button } from 'react-bootstrap';
import speaker from '../../assets/images/speaker.svg';
import smallSpeaker from '../../assets/images/img.svg';
import right from '../../assets/images/right.svg';
import WizardSuccess from './vizartSuccess';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../graphqlOperations/encryprWrapper';
const beep = 'https://dpryujcmbjcxr.cloudfront.net/notify.mp3';

const WizardSpeaker = ({ setOpen, getMuteStatusHandler }) => {
  const [successbtn, setSuccessBtn] = useState(false);
  const [vizart, setVizart] = useState(false);
  const [vizartCalled, setVizartCalled] = useState(false);
  const [isStart, setIsStart] = useState('PLAYING');

  useEffect(() => {
    setTimeout(() => {
      setVizartCalled(true);
    }, 100);
    if (
      getSecureSessionData('isDeviceChecked') === true ||
      getSecureSessionData('isDeviceChecked') === 'true'
    ) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (getSecureSessionData('isDeviceChecked') !== true) {
      if (vizartCalled) {
        if (getSecureSessionData('isPageRefreshed')) {
          setIsStart('STOPPED');
          setTimeout(() => {
            setIsStart('PLAYING');
          }, 5000);
        } else {
          setIsStart('PLAYING');
        }
      }
    }
  }, [vizartCalled]);

  const onUnload = event => {
    console.log('page Refreshed :>> ');
    setSecureSessionData('isDeviceChvbvbecked', 'true');
  };

  useEffect(() => {
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  return (
    <>
      <form
        className={`${
          getSecureSessionData('isLockedScreen') === 'true' ||
          getSecureSessionData('isLockedScreen') === true
            ? 'card col-md-9 thank_wizard'
            : 'card col-md-9 part_wizard'
        }`}
      >
        <div
          className={`${
            getSecureSessionData('isLockedScreen') === 'true' ||
            getSecureSessionData('isLockedScreen') === true
              ? 'd-flex align-items-center fix-success'
              : 'd-flex align-items-center modal-inner'
          }`}
        >
          {getSecureSessionData('isLockedScreen') === 'true' ||
          getSecureSessionData('isLockedScreen') === true ? (
            <>
              <Image className="One" src={smallSpeaker} alt="smallSpeaker" />
            </>
          ) : (
            <div className="model-left">
              <>
                <Image className="Two" src={speaker} alt="speaker" />
              </>
            </div>
          )}
          <Sound url={beep} playStatus={'PLAYING'} loop />
          {!successbtn ? (
            <>
              <div
                className={`${
                  getSecureSessionData('isLockedScreen') === 'true' ||
                  getSecureSessionData('isLockedScreen') === true
                    ? 'model-rights m-0'
                    : 'model-right'
                }`}
              >
                <h4
                  className={`${
                    getSecureSessionData('isLockedScreen') === 'true' ||
                    getSecureSessionData('isLockedScreen') === true
                      ? 'text-styles'
                      : 'text-style'
                  }`}
                >
                  Did you hear that sound?
                </h4>
                <div className="d-flex">
                  <Button
                    variant="primary"
                    aria-label="Yes-Stop"
                    onClick={() => {
                      setIsStart('STOP');
                      setSuccessBtn(true);
                      sessionStorage.removeItem('isPageRefreshed');
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="primary"
                    aria-label="No-Stop"
                    onClick={() => {
                      setIsStart('STOP');
                      setVizart(true);
                    }}
                  >
                    No
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="success-model m-0">
                {getSecureSessionData('isLockedScreen') === 'true' ||
                getSecureSessionData('isLockedScreen') === true ? (
                  <h4>
                    <Image
                      src={right}
                      style={{ paddingRight: '17px' }}
                      alt="rightIcon"
                    />{' '}
                    Your audio is working properly!
                  </h4>
                ) : (
                  <h4 className="text-style">
                    <Image
                      src={right}
                      style={{ paddingRight: '17px' }}
                      alt="rightIcon"
                    />{' '}
                    Your audio is working properly!
                  </h4>
                )}
                <Button
                  onClick={() => {
                    setOpen(true);
                    setSecureSessionData('isDeviceChecked', 'true');
                    if (
                      ['OBSERVER', 'PARTICIPANT'].includes(
                        getSecureSessionData('role'),
                      )
                    ) {
                      getMuteStatusHandler();
                    }
                  }}
                  variant="primary"
                  aria-label='Ok'
                  style={{ marginRight: '272px' }}
                  className="scs_btn_no m-0 mt-4"
                >
                  Ok
                </Button>
              </div>
            </>
          )}
        </div>
      </form>
      {vizart ? (
        <WizardSuccess
          setOpen={setOpen}
          setSuccessBtn={setSuccessBtn}
          setVizart={setVizart}
          setPlaying={setIsStart}
        />
      ) : (
        ''
      )}
    </>
  );
};
WizardSpeaker.propTypes = {
  setOpen: PropTypes.func,
  getMuteStatusHandler: PropTypes.func,
};

export default WizardSpeaker;
