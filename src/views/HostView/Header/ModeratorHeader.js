/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import {
  Dropdown,
  Image,
  Navbar,
  Button,
  Spinner,
  Form,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { createBrowserHistory } from 'history';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../store/actions/error';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import logo from '../../../assets/images/EAB_logo.svg';
import seramount_logo from '../../../assets/images/seramount_logo.svg';
import downArrow from '../../../assets/images/down-arrow.svg';
import CustomToast from '../../../common/customToast';
import injectReducer from '../../../utils/injectReducer';
import Video from 'twilio-video';
import { Device } from '@twilio/voice-sdk';

import Attendees from '../../HostView/HostAndPresenters/Attendees';
import Room from './Room';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import useLocalStorage from '../../../hooks/useLocalStorage';
import microIcon from '../../../assets/images/micro.svg';
import microMuteIcon from '../../../assets/images/micro-mute.svg';
import screenRecording from '../../../assets/images/screen-recording.svg';
import screenRecordingActive from '../../../assets/images/screen-recording-active.svg';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { meetingGQL, userGQL, screenGQL } from '../../../graphqlOperations';
import eabBranding from '../../../assets/images/evs.jpg';
import tickIcon from '../../../assets/images/blue/check.svg';
import seramountBranding from '../../../assets/images/seramount.jpeg';
import SoundCheck from '../Modal/SoundCheck';
import { API, graphqlOperation } from 'aws-amplify';
import responseWrapper from '../../../graphqlOperations/responseWrapper';
import {
  unMuteUser,
  intitializeDevice,
  muteUser,
  updateInputDevice,
  updateOutputDevice,
} from '../Dashboard/TwilioFunctions';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';
import { logoutUser } from '../../../graphql/mutations';

var device;

const ModeratorHeader = ({
  attendeesData,
  updateUserData,
  appReceiveError,
  appReceiveSuccess,
}) => {
  const muteCall =
    getSecureSessionData('isMute') && getSecureSessionData('isMute') === 'false'
      ? false
      : true;
  const meetingName = JSON.parse(getSecureSessionData('UserData'));
  const templateName = JSON.parse(getSecureSessionData('templateData'));
  const [connecting, setConnecting] = useState(false);
  const [modConnecting, setModConnecting] = useState(false);
  const [mute, setMute] = useState(muteCall);
  const [recording, setRecording] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const meetId = JSON.parse(getSecureSessionData('meetData')).meetingData.id;
  const [room, setRoom] = useState(null);
  const [sid, setSid] = useState('');
  const [roomName, setRoomName] = useState(meetId);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('default');
  const [localTrack, setLocalTrack] = useState({});
  const [contentEditable, setContentEditable] = useState(false);
  const [tempScreenName, setTempScreenName] = useState(
    templateName && templateName.type_name,
  );
  const [isSeramount, setIsSeramount] = useState(true);

  const [audioActive, setActiveAudio] = useState(0);
  const [audioOutput, setActiveOutput] = useState(0);
  // const [deviceLoaded, setDeviceLoaded] = useState(0);
  const [microphoneOptions, setMicrophoneOptions] = useState([]);
  const [inputDeviceId, setInputDeviceId] = useState('default');
  const [outputDeviceId, setOutputDeviceId] = useState('default');
  const [deviceOption, setDeviceOption] = useState([]);
  const [deviceIds, setDeviceIds] = useState({ audioId: '' });
  const history = createBrowserHistory();
  const clickRef = useRef();
  var localAudio = useRef(null);
  var localStream = useRef(null);
  const audioDefaultDevice = [];
  const [open, setOpen] = useState(true);
  const [called, setCalled] = useState(true);

  let callStarted = false;
  let userAgent = navigator.userAgent;
  let currentMeetingId = null;
  if (meetingName !== null && Object.keys(meetingName).length) {
    const {
      meetingData: { id },
    } = meetingName;
    currentMeetingId = Number(id);
  }

  // ********************************* JQuery start *****************************************
  const [inPutList, setInPutList] = useState([]);
  const [outPutList, setOutPutList] = useState([]);

  let options;

  const speakerDevices = document.getElementById('speaker-devices');
  const ringtoneDevices = document.getElementById('ringtone-devices');
  const audioSelectionDiv = document.getElementById('output-selection');

  useEffect(() => {
    if (getSecureSessionData('role') === 'MODERATOR') {
      window.onbeforeunload = async function(e) {
        await fetch(API.graphql(graphqlOperation(logoutUser)))
          .then(result => result.json())
          .then(console.log);
        e.preventDefault();
      };
    }
  }, []);

  useEffect(() => {
    if (called) {
      twilioMeeting();
    }
  }, []);

  async function twilioMeeting() {
    setCalled(false);

    try {
      const user_id = `${currentMeetingId}-${getSecureSessionData(
        'userId',
      )}-${getSecureSessionData('role')}`;
      const { success, data, message } = await meetingGQL.createTwilioToken({
        user_id,
      });
      if (success) {
        setSecureSessionData('twilioToken', data.token);
        getIntitializeDevice();
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      console.log(err);
      console.log(
        'An error occurred. See your browser console for more information.',
      );
    }
  }

  async function getIntitializeDevice() {
    let newToken = '';
    newToken = getSecureSessionData('twilioToken');
    device = await new Device(newToken, options, {
      logLevel: 1,
      codecPreferences: ['opus', 'pcmu'],
    });
    addDeviceListeners(device);
    device.register();
  }

  // SETUP STEP 4:
  // Listen for Twilio.Device states
  function addDeviceListeners(device) {
    device.on('error', function(error) {
      console.log('Twilio.Device Error: ' + error.message);
    });
    device.audio.on('deviceChange', updateAllAudioDevices.bind(device));
  }

  // AUDIO CONTROLS

  function updateAllAudioDevices() {
    if (device) {
      updateDevices(speakerDevices, device.audio.speakerDevices.get());
    }
  }

  // Update the available ringtone and speaker devices
  function updateDevices() {
    const outputDevice = [];
    if (userAgent.match(/firefox|fxios/i)) {
      const obj = {
        deviceId: 'default',
        groupId: 'default',
        kind: 'audiooutput',
        label: 'Default',
      };
      outputDevice.push(obj);
    } else {
      device.audio.speakerDevices._availableDevices.forEach(function(
        device,
        id,
      ) {
        const obj = {
          deviceId: device.deviceId,
          groupId: device.groupId,
          kind: device.kind,
          label: device.label,
        };
        outputDevice.push(obj);
      });
    }
    setSecureSessionData('outputList', JSON.stringify(outputDevice));

    setOutPutList(JSON.parse(getSecureSessionData('outputList')));
    updateinputDevices(device.audio.availableInputDevices);
  }

  function updateinputDevices(selectedDevices) {
    const inputDevice = [];
    if (userAgent.match(/firefox|fxios/i)) {
      const obj = {
        deviceId: 'default',
        groupId: 'default',
        kind: 'audioinput',
        label: 'Default',
      };
      inputDevice.push(obj);
    } else {
      selectedDevices.forEach(function(device) {
        const obj = {
          deviceId: device.deviceId,
          groupId: device.groupId,
          kind: device.kind,
          label: device.label,
        };
        inputDevice.push(obj);
      });
    }
    setSecureSessionData('inputList', JSON.stringify(inputDevice));
    setInPutList(inputDevice);
  }

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    setIsSeramount(
      branding === null ? true : JSON.parse(getSecureSessionData('branding')),
    );
  }, [JSON.parse(getSecureSessionData('branding'))]);

  useClickOutside(clickRef, () => {
    setContentEditable(false);
  });

  useEffect(() => {
    if (
      !['ADMIN', 'HOST'].includes(getSecureSessionData('role')) &&
      getSecureSessionData('isDeviceChecked') === 'true'
    ) {
      if (getSecureSessionData('isStartMeeting') === 'true') {
        twilioMeetingToken(true);
        callStarted = true;
      }
    }
  }, [
    getSecureSessionData('isStartMeeting'),
    getSecureSessionData('isDeviceChecked'),
  ]);

  // ******************** TWILIO **************************

  async function twilioMeetingToken() {
    console.log('Requesting Access Token...');

    try {
      const user_id = `${currentMeetingId}-${getSecureSessionData(
        'userId',
      )}-${getSecureSessionData('role')}`;
      const { success, data, message } = await meetingGQL.createTwilioToken({
        user_id,
      });
      if (success) {
        console.log('data.token:::::', data.token);
        setSecureSessionData('twilioToken', data.token);
        intitializeDevice();
        setIsStarted(true);

        // document.getElementById('button-call').click();
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      console.log(err);
      console.log(
        'An error occurred. See your browser console for more information.',
      );
    }
  }

  // ******************** TWILIO **************************
  useEffect(() => {
    if (
      getSecureSessionData('isStartMeeting') === 'true' &&
      ['MODERATOR', 'PARTICIPANT', 'OBSERVER'].includes(
        getSecureSessionData('role'),
      ) &&
      !callStarted
    ) {
      twilioMeetingToken(true);
      callStarted = true;
    }
  }, []);

  useEffect(() => {
    if (room) {
      const tidyUp = event => {
        if (event.persisted) {
          return;
        }
      };
      window.addEventListener('pagehide', tidyUp);
      window.addEventListener('beforeunload', tidyUp);
      return () => {
        window.removeEventListener('pagehide', tidyUp);
        window.removeEventListener('beforeunload', tidyUp);
      };
    }
  }, [room]);

  const onLogout = async () => {
    await getlogoutUser();
    let meetData = getSecureSessionData('meetData');
    meetData = JSON.parse(meetData);
    let branding = getSecureSessionData('branding');
    branding = JSON.parse(branding);
    sessionStorage.clear();
    setSecureSessionData('meetData', JSON.stringify(meetData));
    setSecureSessionData('branding', JSON.stringify(branding));

    history.push('/login');
    window.location.reload();
  };

  async function muteStatusHandler(isMute) {
    try {
      const userData = JSON.parse(getSecureSessionData('UserData'));
      const payload = {
        meetingId: Number(currentMeetingId),
        userId: Number(userData.userData.id),
        mute: isMute,
      };
      const { success, message } = await meetingGQL.setMuteStatusHandler(
        payload,
      );
      if (!success) {
        appReceiveError(message);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const onMuteUser = () => {
    setMute(true);
    muteUser();
    muteStatusHandler(true);
    setSecureSessionData('isMute', 'true');
  };
  const onUnmuteUser = () => {
    setMute(false);
    unMuteUser();
    muteStatusHandler(false);
    setSecureSessionData('isMute', 'false');
  };

  const handleKeydown = e => {
    if (e.key == 'Enter') {
      let tempId = getSecureSessionData('templateData');
      tempId = JSON.parse(tempId);
      const payloadData = {
        type_name: e.target.value,
        templateId: Number(tempId.id),
      };
      setTempScreenName(e.target.value);
      editTemplateHandler(payloadData);
    }

    if (e.key == 'Enter' || e.key == 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setContentEditable(false);
    }
  };

  async function editTemplateHandler(payload) {
    try {
      const { success, message } = await meetingGQL.editTemplateHandler(
        payload,
      );
      success ? appReceiveSuccess(message) : appReceiveError(message);
    } catch (err) {
      appReceiveError(err);
    }
  }
  async function getlogoutUser() {
    try {
      const { success, data, message } = await userGQL.getlogoutUser();
      if (success) {
        appReceiveSuccess(message);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  function gotDevices(mediaDevices) {
    const select = document.getElementById('video-devices');
    select.innerHTML = '';
    select.appendChild(document.createElement('option'));
    let count = 1;
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'audioinput') {
        const option = document.createElement('option');
        option.value = mediaDevice.deviceId;
        const label = mediaDevice.label || `Camera ${count}`;
        const textNode = document.createTextNode(label);
        option.appendChild(textNode);
        select.appendChild(option);
      }
    });
  }

  useEffect(() => {
    if (
      ['PARTICIPANT', 'OBSERVER'].includes(getSecureSessionData('role')) &&
      getSecureSessionData('isDeviceChecked')
    ) {
      const element = document.getElementById('main-comp');

      if (element) element.style.display = 'none';
    }
  }, [getSecureSessionData('isDeviceChecked')]);

  const onUnload = event => {
    console.log('page Refreshed :>> ');
  };

  async function handleInformHost(payload) {
    try {
      await meetingGQL.informHostHandler(payload);
      setSecureSessionData('Attendees', JSON.stringify([]));
    } catch (err) {
      console.log('error informing host...', err);
    }
  }

  useEffect(() => {
    if (getSecureSessionData('role') === 'MODERATOR') {
      const user_id = getSecureSessionData('userId');
      const informHostPayload = {
        user_id,
        isAdd: true,
      };
      handleInformHost(informHostPayload);
    }
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  const selectDevice = (id, type) => {
    if (type === 'input') {
      device.audio.setInputDevice(id);
      updateInputDevice(id);
    } else {
      device.audio.speakerDevices.set([id]);
      updateOutputDevice(id);
    }
  };

  const removeDisplayCSS = () =>
    document.getElementById('main-comp')
      ? (document.getElementById('main-comp').style.display = '')
      : '';

  return (
    <>
      {['PARTICIPANT', 'OBSERVER'].includes(getSecureSessionData('role')) &&
        open &&
        getSecureSessionData('isDeviceChecked') && (
          <div className="modal-sound">
            <SoundCheck setOpen={setOpen} removeDisplayCSS={removeDisplayCSS} />
          </div>
        )}
      <header
        style={{
          backgroundImage: `url(${
            isSeramount ? seramountBranding : eabBranding
          })`,
        }}
      >
        <Navbar
          bg={isSeramount ? 'dark-purple' : 'gray-dark'}
          className="custom-navbar"
          fixed="top"
        >
          <div className="d-flex align-items-center">
            <>
              <Navbar.Brand className="py-0 me-4">
                <Link to="/" aria-label="Go to Home">
                  <Image
                    src={isSeramount ? seramount_logo : logo}
                    width={40}
                    height={40}
                    alt={isSeramount ? 'seramount_logo' : 'logo'}
                  />
                </Link>
              </Navbar.Brand>

              {getSecureSessionData('isEditTemplate') === 'true' ||
              getSecureSessionData('isNewTemplate') === 'false' ? (
                <div className="custom-navbar__title">
                  <div className="fw-bold text-truncate text-white">
                    {contentEditable &&
                    getSecureSessionData('isEditTemplate') === 'true' ? (
                      <Form.Control
                        style={{ width: '290px' }}
                        defaultValue={tempScreenName}
                        onKeyDown={handleKeydown}
                        ref={clickRef}
                      />
                    ) : (
                      <div
                        onDoubleClick={() => {
                          setContentEditable(true);
                        }}
                      >
                        {getSecureSessionData('isEditTemplate') === 'true'
                          ? `${tempScreenName} (Edit-Mode)`
                          : tempScreenName}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="custom-navbar__title">
                  <div className="fw-bold text-truncate text-white">
                    {meetingName && meetingName.meetingData.name}
                  </div>
                </div>
              )}
            </>
          </div>

          {getSecureSessionData('fromSession') === 'true' &&
            (loading ? (
              <Spinner
                className="ms-2"
                animation="border"
                role="status"
                size="sm"
                style={{ color: 'white' }}
              />
            ) : (
              <div className="custom-navbar__middle ">
                {getSecureSessionData('role') === 'HOST' ||
                getSecureSessionData('role') === 'ADMIN' ||
                getSecureSessionData('role') === 'MODERATOR' ? (
                  mute ? (
                    <>
                      <Button onClick={onUnmuteUser} aria-label="onUnmuteUser">
                        <Image src={microMuteIcon} alt="microMuteIcon" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={onMuteUser} aria-label="onMuteUser">
                        <Image src={microIcon} alt="microIcon" />
                      </Button>
                    </>
                  )
                ) : (
                  ''
                )}
                {(getSecureSessionData('role') === 'HOST' ||
                  getSecureSessionData('role') === 'ADMIN' ||
                  getSecureSessionData('role') === 'MODERATOR') && (
                  <>
                    <Dropdown
                      align="end"
                      className="px-0"
                      // onClick={() => setDeviceLoaded(deviceLoaded + 1)}
                    >
                      <div className="custom-navbar__dropdown ">
                        <Dropdown.Toggle variant="link">
                          <Image
                            className="custom-navbar__arrow invert-white"
                            id="startup-button"
                            // onClick={() => intitializeDevice()}
                            src={downArrow}
                            width={24}
                            height={24}
                            alt="Arrow"
                          />
                        </Dropdown.Toggle>
                      </div>
                      <Dropdown.Menu>
                        <Dropdown.Item>Microphone</Dropdown.Item>
                        {inPutList &&
                          inPutList.length > 0 &&
                          inPutList.map((obj, index) => (
                            <div key={index} className="audio-option">
                              {audioActive == index && (
                                <Image
                                  className="audio-option__img"
                                  src={tickIcon}
                                  width={24}
                                  height={24}
                                  alt="tick-icon"
                                />
                              )}
                              {obj.label === 'Default' ? (
                                <Dropdown.Item
                                  className="audio-option__a"
                                  key={index}
                                  onClick={() => {
                                    selectDevice('default', 'input');
                                    setActiveAudio(index);
                                  }}
                                >
                                  Same as System
                                </Dropdown.Item>
                              ) : (
                                <Dropdown.Item
                                  className="audio-option__a"
                                  key={index}
                                  onClick={() => {
                                    selectDevice(obj.deviceId, 'input');
                                    setActiveAudio(index);
                                  }}
                                >
                                  {' '}
                                  {obj.label}
                                </Dropdown.Item>
                              )}
                            </div>
                          ))}
                        <Dropdown.Divider />
                        <Dropdown.Item>Speaker</Dropdown.Item>
                        {outPutList &&
                          outPutList.length > 0 &&
                          outPutList.map((obj, index) => (
                            <div key={index} className="audio-option">
                              {audioOutput == index && (
                                <Image
                                  className="audio-option__img"
                                  src={tickIcon}
                                  width={24}
                                  height={24}
                                  alt="tick-icon"
                                />
                              )}
                              {obj.label === 'Default' ? (
                                <Dropdown.Item
                                  className="audio-option__a"
                                  key={index}
                                  onClick={() => {
                                    selectDevice('default', 'output');
                                    setActiveOutput(index);
                                  }}
                                >
                                  Same as System
                                </Dropdown.Item>
                              ) : (
                                <Dropdown.Item
                                  className="audio-option__a"
                                  key={index}
                                  onClick={() => {
                                    selectDevice(obj.deviceId, 'output');
                                    setActiveOutput(index);
                                  }}
                                >
                                  {' '}
                                  {obj.label}
                                </Dropdown.Item>
                              )}
                            </div>
                          ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                )}
              </div>
            ))}
          {room !== null && room && (
            <>
              <Room
                roomName={roomName}
                room={room}
                deviceId={deviceId}
                inputDeviceId={inputDeviceId}
                outputDeviceId={outputDeviceId}
              />
            </>
          )}

          <div>
            <Dropdown align="end">
              <div className="custom-navbar__dropdown">
                <div className="custom-navbar__title">
                  <div className="fw-bold text-truncate text-white">
                    {getSecureSessionData('role') !== 'PARTICIPANT' &&
                      (getSecureSessionData('userName') ||
                        (meetingName && meetingName.user_id))}
                  </div>
                  <div className="text-gray-middle custom-navbar__title-sub">
                    {meetingName && meetingName.userData.role_name}
                  </div>
                </div>
                <Dropdown.Toggle variant="link">
                  <Image
                    className="custom-navbar__arrow invert-white"
                    src={downArrow}
                    width={24}
                    height={24}
                    alt="Arrow"
                  />
                </Dropdown.Toggle>
              </div>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    window.onbeforeunload = null;
                    onLogout();
                  }}
                >
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar>
      </header>
    </>
  );
};

const DropdownCard = ({ obj, ...props }) => {
  const [selected, setSelected] = useState(false);
  const [chat, setChat] = useLocalStorage('chat_expand', false);

  const handleToggle = isSelected => {
    setSelected(!isSelected);
    if (obj.title !== 'Chat') {
      return;
    }
    if (!isSelected) {
      setChat(true);
    } else {
      setChat(false);
    }
  };
  return (
    <>
      <Dropdown key={obj.title}>
        <div className="custom-navbar__dropdown">
          <div
            className={classNames(
              {
                active: selected && obj.title == 'Share Screen',
              },
              'custom-navbar__title cursor-pointer',
            )}
          >
            <Image
              src={
                (props.host_ui.chat_expand &&
                  obj.title == 'Chat' &&
                  obj.icon2) ||
                (selected ? obj.icon2 : obj.icon)
              }
              alt={obj.title}
              onClick={() => handleToggle(selected)}
            />
          </div>
          <Dropdown.Toggle variant="link">
            <Image
              className="custom-navbar__arrow invert-white"
              src={downArrow}
              width={16}
              height={16}
              alt="Arrow"
            />
          </Dropdown.Toggle>
        </div>
        <Dropdown.Menu>
          {obj.options.map((option, i) => (
            <Dropdown.Item key={i}>{option}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {obj.title == 'Recording' && selected && <CustomToast />}
    </>
  );
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

DropdownCard.propTypes = {
  obj: PropTypes.object.isRequired,
  setHostUI: PropTypes.func.isRequired,
  host_ui: PropTypes.object.isRequired,
  attendeesData: PropTypes.array,
  updateUserData: PropTypes.array,
  appReceiveError: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
};

ModeratorHeader.propTypes = {
  attendeesData: PropTypes.array,
  updateUserData: PropTypes.array,
  appReceiveError: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
};

const mapStateToProps = state => {
  const {
    hostUI: { attendeesData, updateUserData },
  } = state;

  return {
    attendeesData,
    updateUserData,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(ModeratorHeader);
