/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Image,
  Modal,
  Button,
  DropdownButton,
  Dropdown,
  Form,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import Video from 'twilio-video';
import Sound from 'react-sound';
import logo from '../../assets/images/locked-logo.svg';
import eabBranding from '../../assets/images/evs.jpg';
import speaker from '../../assets/images/speaker.svg';
import alert from '../../assets/images/alert.svg';
import slowicon from '../../assets/images/slow.svg';
import high from '../../assets/images/high.svg';
import seramountLogo from '../../assets/images/seramount_locked_logo.svg';
import seramountBranding from '../../assets/images/seramount.jpeg';
import classNames from 'classnames';
import WizardTrubleShoot from './vizartTrubleShoot';
import WizardSpeaker from '../Vizart/index';
import DeviceSelect from './deviceSelect';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../graphqlOperations/encryprWrapper';
const beep = 'https://dpryujcmbjcxr.cloudfront.net/notify.mp3';

const WizardSuccess = ({ setVizart, setSuccessBtn, setPlaying }) => {
  const [viewContent, setViewContent] = useState(false);
  const [isSeramount, setIsSeramount] = useState(false);
  const [testAgain, setTestAgain] = useState(false);
  const [browserDetection, setBrowserDetection] = useState('');
  const [volume, setVolume] = useState(100);
  const [pauseAudio, setPauseAudio] = useState(false);
  const [roledata, setroleData] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [valueLength, setValueLength] = useState(0);
  const [dynamicDataLength, setDynamicDataLength] = useState();

  let instant = 0.0;
  let slow = 0.0;
  let clip = 0.0;
  let script;
  let mic;
  let context;

  let userAgent = navigator.userAgent;

  // Put variables in global scope to make them available to the browser console.
  const constraints = (window.constraints = {
    audio: ['HOST', 'ADMIN', 'MODERATOR'].includes(
      getSecureSessionData('role'),
    ),
    video: false,
  });

  let meterRefresh = null;

  useEffect(() => {
    if (
      getSecureSessionData('role') === 'HOST' ||
      getSecureSessionData('role') === 'ADMIN' ||
      getSecureSessionData('role') === 'MODERATOR'
    ) {
      setroleData(true);
    }
  }, []);

  useEffect(() => {
    const BrowserRouter = (navigator.browserDetection = (function() {
      var ua = navigator.userAgent,
        tem,
        M =
          ua.match(
            /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
          ) || [];
      if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
      }
      if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null)
          return tem
            .slice(1)
            .join(' ')
            .replace('OPR', 'Opera');
      }
      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
      if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
      return M[0];
    })());

    if (BrowserRouter === 'Chrome') {
      setBrowserDetection('https://support.google.com/chrome/answer/2693767');
    } else if (BrowserRouter === 'Firefox') {
      setBrowserDetection(
        'https://support.mozilla.org/en-US/kb/block-autoplay',
      );
    } else if (BrowserRouter === 'Safari') {
      setBrowserDetection(
        'https://support.apple.com/en-in/guide/mac-help/mchlp2567/mac',
      );
    } else if (BrowserRouter === 'Edge') {
      setBrowserDetection(
        'https://support.microsoft.com/en-us/windows/windows-camera-microphone-and-privacy-a83257bc-e990-d54a-d212-b5e41beba857',
      );
    }
  }, []);

  const handleSuccess = stream => {
    if (roledata || userAgent.match(/firefox|fxios/i)) {
      window.stream = stream;
      const soundMeter = (window.soundMeter = new SoundMeter(
        window.audioContext,
      ));
      soundMeter.connectToSource(stream, function(e) {
        if (e) {
          alert(e);
          return;
        }
      });
    }
  };

  const SoundMeter = contex => {
    context = contex;
    instant = 0.0;
    slow = 0.0;
    clip = 0.0;
    script = context.createScriptProcessor(2048, 1, 1);
    // const that = this;
    if (!roledata) {
      stop();
    }
    if (!testAgain && roledata) {
      script.onaudioprocess = function(event) {
        const input = event.inputBuffer.getChannelData(0);
        let i;
        let sum = 0.0;
        let clipcount = 0;
        for (i = 0; i < input.length; ++i) {
          sum += input[i] * input[i];
          if (Math.abs(input[i]) > 0.99) {
            clipcount += 1;
          }
        }
        instant = Math.sqrt(sum / input.length);
        slow = 0.95 * slow + 0.05 * instant;
        clip = clipcount / input.length;

        setBarValue(instant * 1000);
        return { instant, slow, clip };
      };
    }
  };
  SoundMeter.prototype.connectToSource = function(stream, callback) {
    console.log('SoundMeter connecting');
    try {
      mic = context.createMediaStreamSource(stream);
      mic.connect(script);
      // necessary to make sample run, but should not be.
      script.connect(context.destination);
      if (typeof callback !== 'undefined') {
        callback(null);
      }
    } catch (e) {
      console.error(e);
      if (typeof callback !== 'undefined') {
        callback(e);
      }
    }
  };
  SoundMeter.prototype.stop = function() {
    console.log('SoundMeter stopping');
    mic.disconnect();
    script.disconnect();
  };
  useEffect(() => {
    if (!testAgain && !pauseAudio) {
      start();
    }
  }, [testAgain, pauseAudio, roledata]);
  const start = () => {
    console.log('Requesting local stream');

    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      window.audioContext = new AudioContext();
    } catch (e) {
      alert('Web Audio API not supported.');
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(handleSuccess)
      .catch(handleError);
  };
  const stop = () => {
    console.log('Stopping local stream');
    if (window.stream) {
      window.stream.getTracks().forEach(track => track.stop());
      window.soundMeter.stop();
      window.audioContext.close();
      clearInterval(meterRefresh);
      setBarValue(0);
    }
  };
  const handleError = error => {
    console.log(
      'navigator.MediaDevices.getUserMedia error: ',
      error.message,
      error.name,
    );
  };
  const setBarValue = props => {
    var bars = document.getElementsByClassName('barhorizontal');
    for (var i = 0; i < bars.length; i++) {
      if (props / (100 / bars.length) > i) {
        bars[i].classList.add('on');
      } else {
        bars[i].classList.remove('on');
      }
    }
  };

  return (
    <>
      {!viewContent && (
        <>
          <form
            className={`${
              getSecureSessionData('isLockedScreen') === 'true' ||
              getSecureSessionData('isLockedScreen') === true
                ? `${testAgain &&
                    'thank_wizard_success2'} card col-md-9 thank_wizard_success`
                : `${
                    testAgain ? 'part_wizard_success2' : 'part_wizard_success'
                  } card col-md-9 `
            }`}
          >
            {console.log(`testAgain>>`, testAgain)}
            <div
              className={`${
                testAgain ? 'successModel2' : 'successModel'
              } d-flex align-items-center`}
            >
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
                    : ''
                }`}
              >
                <div>
                  <span>
                    <Image
                      src={alert}
                      className="ml-5"
                      style={{ paddingRight: '17px' }}
                      alt="alert"
                    />
                    <b className="fs-4">Please make sure audio is enabled</b>
                  </span>
                  <h6 className="mt-5">
                    Ensure the Allow sites to play sound (recommended) option
                    <br />
                    is enabled in the Chrome sound settings
                    <br />(
                    <a
                      target="_blank"
                      href={browserDetection && browserDetection}
                      rel="noreferrer"
                    >
                      {browserDetection && browserDetection}
                    </a>
                    )
                  </h6>
                  <h6 className="mt-2">
                    Make sure the page is not muted by right-clicking on <br />
                    its tab. If it's muted, you'll see an Unmute site option.
                  </h6>
                </div>

                <div className="d-flex">
                  <Button
                    onClick={() => {
                      // audio.play();
                      // setIsStart('PLAYING');
                      setPlaying('PLAYING');
                      setVizart(false);
                      // setTestAgain(true);
                      // setSuccessBtn(false);
                    }}
                    aria-label="Test Again"
                    className="mt-4 scs_btn"
                  >
                    Test Again
                  </Button>
                  <Button
                    onClick={() => {
                      // audio.play();
                      // setPlaying('PLAYING');
                      setIsPlay(true);
                      setViewContent(true);
                      setTestAgain(true);
                      start();
                    }}
                    aria-label="No-Play"
                    className="mt-4 scs_btn"
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </>
      )}
      {/* </div> */}
      <div
        className={`${
          getSecureSessionData('isLockedScreen') === 'true' ||
          getSecureSessionData('isLockedScreen') === true
            ? 'ml-100'
            : ''
        }`}
      >
        <div>
          {testAgain && (
            <>
              <form
                className={`${
                  getSecureSessionData('isLockedScreen') === 'true' ||
                  getSecureSessionData('isLockedScreen') === true
                    ? `${testAgain &&
                        'thank_wizard_success2'} card col-md-9 thank_wizard_success`
                    : `${
                        testAgain
                          ? 'part_wizard_success2'
                          : 'part_wizard_success'
                      } card col-md-9 `
                }`}
              >
                {console.log(`testAgain>>`, testAgain)}
                <div
                  className={`${
                    testAgain ? 'successModel2 checkModel' : 'successModel'
                  } d-flex align-items-center`}
                >
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
                        ? 'ml-85'
                        : ''
                    }`}
                  >
                    <div>
                      <h4>
                        <b>Check you have the correct speaker enabled</b>
                      </h4>
                    </div>
                    <div
                      className={`${
                        getSecureSessionData('isLockedScreen') === 'true' ||
                        getSecureSessionData('isLockedScreen') === true
                          ? 'align-items-center d-flex'
                          : 'align-items-center'
                      }`}
                    >
                      <h6 className="py-2 me-3">
                        <b>Did you hear the sound?</b>
                      </h6>
                      <div className="d-flex">
                        <Button
                          onClick={() => {
                            setPauseAudio(true);
                            stop();
                            setTimeout(() => {
                              setViewContent(true);
                              setVizart(false);
                              setSuccessBtn(true);
                              setTestAgain(false);
                              setSecureSessionData('isDeviceChecked', 'true');
                            }, 800);
                          }}
                          aria-label="Yes"
                          variant="primary"
                          className="scs_btn"
                        >
                          Yes
                        </Button>
                        <Button
                          onClick={() => {
                            setPauseAudio(true);
                            setIsPlay(false);
                            stop();
                            setPlaying('STOP');
                            setTimeout(() => {
                              setIsSeramount(true);
                              setTestAgain(false);
                            }, 800);
                            // pauseAudio();
                          }}
                          aria-label="No"
                          className="scs_btn_no"
                          variant="primary"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                    <br />
                    <div className="dropdown-view">
                      <Form.Label>
                        <div>Speaker</div>
                        <div>
                          Testing {valueLength + 1}/{dynamicDataLength || '1'}
                        </div>
                      </Form.Label>
                      <DeviceSelect
                        isAudioPause={pauseAudio}
                        isPlay={isPlay}
                        volume={volume}
                        testAgain={testAgain}
                        setValueLength={setValueLength}
                        setDynamicDataLength={setDynamicDataLength}
                        setPlaying={setPlaying}
                      />
                      <div className="mt-3">
                        {roledata ? (
                          <Form.Group className="vol-wrap">
                            <Form.Label>Output Level:</Form.Label>
                            <div className="audio-progress">
                              <div className="barhorizontal"></div>
                              <div className="barhorizontal"></div>
                              <div className="barhorizontal"></div>
                              <div className="barhorizontal"></div>
                              <div className="barhorizontal"></div>
                              <div className="barhorizontal"></div>
                              <div className="barhorizontal"></div>
                              <div className="barhorizontal"></div>
                              <div className="barhorizontal"></div>
                              <div className="barhorizontal"></div>
                            </div>
                          </Form.Group>
                        ) : (
                          ''
                        )}
                        <Form.Label className="mt-3">Output Volume:</Form.Label>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="speaker_style">
                            <Image src={slowicon} alt="slowIcon" />{' '}
                          </div>
                          <div className="style_range">
                            <Form.Range
                              value={volume}
                              onChange={e => {
                                e.preventDefault();
                                setVolume(e.target.value);
                              }}
                              className="rangevolume"
                            />
                          </div>
                          <div className="speaker_style">
                            <Image src={high} alt="highIcon" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      {isSeramount && (
        <WizardTrubleShoot setPlaying={setPlaying} setVizart={setVizart} />
      )}
    </>
  );
};
WizardSuccess.propTypes = {
  setVizart: PropTypes.func,
  setOpen: PropTypes.func,
  setSuccessBtn: PropTypes.func,
  setPlaying: PropTypes.func,
  valueLength: PropTypes.func,
  dynamicDataLength: PropTypes.func,
};
export default WizardSuccess;
