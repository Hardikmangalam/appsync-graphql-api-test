/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Image, Button, Form, Modal } from 'react-bootstrap';
import closeIcon from '../../assets/images/close.svg';
import PropTypes from 'prop-types';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../graphqlOperations/encryprWrapper';

const beep = 'https://dpryujcmbjcxr.cloudfront.net/notify.mp3';
let isDeviceLoaded = false;
let audioOutputList = [];

const TestingSpeaker = ({ testSpeaker, setTestSpeaker }) => {
  const [viewContent, setViewContent] = useState(false);
  // const [audioOutputList, setAudioOutputList] = useState([]);
  const [testAgain, setTestAgain] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [speakerTest, setSpeakerTest] = useState(false);
  const [selectedValue, setSelectedValue] = useState('Default');
  const [show, setShow] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [compKey, setCompKey] = useState(1);
  const [deviceListData, setDeviceListData] = useState([]);
  const [listData, setListData] = useState([]);
  const [dynamicDataLength, setDynamicDataLength] = useState();
  const [valueLength, setValueLength] = useState(0);
  const [roledata, setroleData] = useState(false);
  var videoElement;
  let userAgent = navigator.userAgent;

  videoElement = document.querySelector('audio');

  let instant = 0.0;
  let slow = 0.0;
  let clip = 0.0;
  let script;
  let mic;
  let context;

  // Put variables in global scope to make them available to the browser console.
  const constraints = (window.constraints = {
    audio: ['HOST', 'ADMIN', 'MODERATOR'].includes(
      getSecureSessionData('role'),
    ),
    video: false,
  });

  let meterRefresh = null;

  useEffect(() => {
    setTimeout(() => {
      setViewContent(true);
    }, 100);
    if (
      getSecureSessionData('isDeviceChecked') === true ||
      getSecureSessionData('isDeviceChecked') === 'true'
    ) {
      setTestSpeaker(true);
    }
  }, [setTestSpeaker]);

  useEffect(() => {
    setListData(selectedValue);
  }, [setListData]);

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
    if (testSpeaker) {
      var player = document.getElementById('localAudio');
      if (player !== null) {
        player.src = beep;
        player.load();
        player.play();
        // audio.play();
        player.loop = true;
      }
      // setPlaying(true);
    } else {
      // audio.pause();
    }
  }, [testSpeaker]);

  useEffect(() => {
    if (!testAgain && !playing) {
      var player = document.getElementById('localAudio');
      if (player !== null) {
        player.src = beep;
        player.load();
        player.play();
        // audio.play();
        player.loop = true;
      }
      // setPlaying(true);
    } else {
      // audio.pause();
    }
  }, [testAgain, playing]);

  useEffect(() => {
    if (show && !testAgain && (roledata || userAgent.match(/firefox|fxios/i))) {
      start();
    }
  }, [show, start, testAgain, roledata]);

  const handleSuccess = stream => {
    if (roledata) {
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
    if (roledata) {
      window.stream.getTracks().forEach(track => track.stop());
      window.soundMeter.stop();
      window.audioContext.close();
      clearInterval(meterRefresh);
    }
  };

  const handleError = error => {
    // var select = document.getElementById('deviceSelect');
    // if (select.options.length <= 0) {
    //   var option = document.createElement('option');
    //   option.text = 'Default';
    //   option.value = '';
    //   select.appendChild(option);
    // }
    console.log(
      'navigator.MediaDevices.getUserMedia error: ',
      error.message,
      error.name,
    );
  };

  const setBarValue = props => {
    var bars = document.getElementsByClassName('bar');
    for (var i = 0; i < bars.length; i++) {
      if (props / (100 / bars.length) > i) {
        bars[i].classList.add('on');
      } else {
        bars[i].classList.remove('on');
      }
    }
  };

  const changeAudioDestination = e => {
    const idx = document.getElementById('deviceSelect').selectedIndex;
    setValueLength(idx);
    var player = document.getElementById('localAudio');
    player.pause();
    player.src = '';
    player.load();
    videoElement = document.querySelector('audio');
    const { value } = e.target;
    // if (value) {
    //   setSelectedValue();
    //   pauseAudio();
    // } else {
    audioOutputList.filter(el => {
      if (el.deviceId === value) {
        setSelectedValue(el.label);
      }
    });
    attachSinkId(videoElement, value);
    // }
  };

  const attachSinkId = (element, sinkId) => {
    var player = document.querySelector('audio');
    player.pause();
    player.load();
    if (typeof element.sinkId !== 'undefined') {
      if (userAgent.match(/firefox|fxios/i)) {
        element.setAttribute('deviceid', sinkId);
        element.setAttribute('value', sinkId);
        player.src = beep;
        player.load();
        player.setSinkId(sinkId);
        player.play();
        player.loop = true;
      } else {
        element.setAttribute('deviceid', sinkId);
        element.setAttribute('value', sinkId);
        element
          .setSinkId(sinkId)
          .then(() => {
            player.setSinkId(sinkId);
            player.src = beep;
            player.play();
            player.loop = true;

            console.log(`Success, audio output device attached: ${sinkId}`);
          })
          .catch(error => {
            let errorMessage = error;
            if (error.name === 'SecurityError') {
              errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
            }
            console.error(errorMessage);
          });
      }
    } else {
      console.warn('Browser does not support output device selection.');
    }
  };

  const gotDevices = deviceInfos => {
    const data = deviceInfos.length;
    if (data <= 0 && isDeviceLoaded) {
      isDeviceLoaded = false;
    }
    setDynamicDataLength(data);
    if (deviceInfos.length < deviceListData.length) {
      isDeviceLoaded = false;
    }
    const masterOutputSelector = document.createElement('select');
    masterOutputSelector.setAttribute('id', 'deviceSelect');
    if (deviceInfos && deviceInfos.length && !isDeviceLoaded) {
      if (deviceInfos.length <= 0) getMediaDeviceList();
      // setAudioOutputList(deviceInfos);
      audioOutputList = deviceInfos;

      for (let i = 0; i !== deviceInfos.length; ++i) {
        const option = document.createElement('option');
        const deviceInfo = deviceInfos[i];
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audiooutput') {
          setDeviceListData(deviceInfos);
          console.info('Found audio output device: ', deviceInfo.label);
          option.text = deviceInfo.label || `Default`;
          masterOutputSelector.appendChild(option);
        } else {
          console.log('Found non audio output device: ', deviceInfo.label);
        }
      }

      // Clone the master outputSelector and replace outputSelector placeholders.
      const allOutputSelectors = document.querySelectorAll('select');
      for (let selector = 0; selector < allOutputSelectors.length; selector++) {
        const newOutputSelector = masterOutputSelector.cloneNode(true);
        newOutputSelector.addEventListener('change', changeAudioDestination);
        allOutputSelectors[selector].parentNode.replaceChild(
          newOutputSelector,
          allOutputSelectors[selector],
        );
      }
      // setIsDeviceLoaded(true);
    } else {
      const option = document.createElement('option');
      option.text = `Default`;
      masterOutputSelector.appendChild(option);
    }
  };

  const pauseAudio = () => {
    var player = document.getElementById('localAudio');
    player.pause();
    player.removeAttribute('src');
    player.load();
    setCompKey(compKey + 1);
  };

  useEffect(() => {
    getMediaDeviceList();
    setTimeout(() => {
      getMediaDeviceList();
      isDeviceLoaded = true;
    }, 200);
    setDeviceListData([]);
    getMediaDeviceList();
  }, []);

  const getMediaDeviceList = () => {
    if (!['PARTICIPANT', 'OBSERVER'].includes(getSecureSessionData('role'))) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(allDevices => {
          gotDevices(allDevices.filter(ele => ele.kind === 'audiooutput'));
        })
        .catch(handleError);
    }
  };

  return (
    <>
      <Modal size={'sm'} centered show={show}>
        <Modal.Header className="d-flex justify-content-between">
          <Modal.Title as="h6" className="fw-bold">
            Test Computer Speaker
          </Modal.Title>
          <Button
            className="p-0 border-0"
            aria-label='Close'
            // onClick={() => {
            //   setShow(false);
            //   if (testSuccess) {
            //     setShow(true);
            //     setTestSpeaker(false);
            //   }
            // }}
          >
            <Image
              onClick={() => {
                isDeviceLoaded = false;
                setDeviceListData([]);
                getMediaDeviceList();
                setTimeout(() => {
                  setTestSpeaker(false);
                }, 100);
              }}
              src={closeIcon}
              alt="Close"
            />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="form-group">
            {!testAgain ? (
              <Form.Label className="fw-bold rington_title mb-3">
                Do you hear a ringtone?
              </Form.Label>
            ) : (
              <Form.Label className="fw-bold rington_title mb-3">
                We have tested all your Speakers
              </Form.Label>
            )}
            <Form.Label>
              <div>Speaker</div>
              <div>
                Testing {valueLength + 1}/{dynamicDataLength || '1'}
              </div>
            </Form.Label>
            <div className="dropdown-view">
              <audio id="localAudio" />

              <Form.Select id="deviceSelect">
                <option value="">Default</option>
              </Form.Select>
            </div>
          </Form.Group>
          {roledata ? (
            <Form.Group className="vol-wrap">
              <Form.Label>Output Level:</Form.Label>
              <div className="audio-progress">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            </Form.Group>
          ) : (
            ''
          )}
        </Modal.Body>
        <Modal.Footer>
          {!testAgain ? (
            <>
              <Button
                className="scs_btn"
                aria-label='No, Try Another'
                onClick={() => {
                  pauseAudio();
                  stop();
                  setTimeout(() => {
                    setTestAgain(true);
                  }, 800);
                }}
              >
                No, Try Another
              </Button>
              {!testSuccess && (
                <Button
                  className="scs_btn_no my-primary-btn"
                  variant="primary"
                  aria-label='Yes'
                  onClick={() => {
                    pauseAudio();
                    stop();
                    setTimeout(() => {
                      setTestSuccess(true);
                      setSpeakerTest(true);
                      setShow(false);
                      setCompKey(compKey + 1);
                    }, 800);
                  }}
                >
                  Yes
                </Button>
              )}
            </>
          ) : (
            <Button
              className="scs_btn_no my-primary-btn"
              aria-label='Test Again'
              onClick={() => {
                setTestAgain(false);
              }}
            >
              Test Again
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      <Modal show={speakerTest} centered>
        <Modal.Header>
          <Modal.Title as="h6" className="fw-bold">
            Test Computer Speaker
          </Modal.Title>
          <Button
            className="p-0 border-0"
            aria-label='Close'
            // onClick={() => setSpeakerTest(false)}
          >
            <Image
              onClick={() => {
                isDeviceLoaded = false;
                setDeviceListData([]);
                getMediaDeviceList();
                setTimeout(() => {
                  setTestSpeaker(false);
                }, 500);
              }}
              src={closeIcon}
              alt="Close"
            />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="form-group">
            <Form.Label className="fw-bold rington_title mb-3">
              {/* Speaker looks good */}
              Thank you for testing your speakers, the speaker listed below is
              working and should allow you to hear the facilitator’s audio when
              you enter the session.
            </Form.Label>
            <Form.Label>
              <div key={compKey}>Speaker: {selectedValue || ''}</div>
            </Form.Label>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="scs_btn_no my-primary-btn"
            aria-label='Ok'
            onClick={() => {
              setShow(true);
              setTestSpeaker(false);
              setSecureSessionData('isDeviceChecked', 'true');
              isDeviceLoaded = false;
              setDeviceListData([]);
              getMediaDeviceList();
              setTimeout(() => {
                setTestSpeaker(false);
              }, 500);
            }}
          >
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

TestingSpeaker.propTypes = {
  setTestSpeaker: PropTypes.func,
  testSpeaker: PropTypes.bool,
};

export default TestingSpeaker;
