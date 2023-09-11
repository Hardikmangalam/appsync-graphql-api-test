/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Route, Switch } from 'react-router-dom';
import Dashboard from './Dashboard/Dashboard';
import Header from './Header/Header';
import MessageNotification from './messageNotification';
import PropTypes, { object } from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Sidebar from './Sidebar/Sidebar';
import reducer, { lockedScreen } from '../../store/reducers/app';
import { Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Video from 'twilio-video';
import { Device } from '@twilio/voice-sdk';
import { intitializeDevice } from './Dashboard/TwilioFunctions';
import logo from '../../assets/images/locked-logo.svg';
import seramountLogo from '../../assets/images/seramount_locked_logo.svg';
import injectReducer from '../../utils/injectReducer';
import ParticipantRightSidebar from './Dashboard/ParticipantRightSidebar';
import {
  setLockScreenSuccess,
  sendPublicChatSuccess,
} from '../../store/actions/app';
import { appReceiveError, appReceiveSuccess } from '../../store/actions/error';
import { API, graphqlOperation } from 'aws-amplify';
import {
  onSetLockScreen,
  onPublicChat,
  onSetMuteStatus,
} from '../../graphql/subscriptions';
import responseWrapper from '../../graphqlOperations/responseWrapper';
import classNames from 'classnames';
import eabBranding from '../../assets/images/evs.jpg';
import seramountBranding from '../../assets/images/seramount.jpeg';
import EabLogo from '../../assets/images/EABbrand.svg';
import seraLogo from '../../assets/images/EABseramount.svg';
import popupSpeaker from '../../assets/images/popupSpeaker.svg';
import WizardSpeaker from '../Vizart';
import { meetingGQL } from '../../graphqlOperations';
import ModeratorHeader from './Header/ModeratorHeader';
import Sound from 'react-sound';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../graphqlOperations/encryprWrapper';
const track1 = 'https://dpryujcmbjcxr.cloudfront.net/TRACK1.mp3';
const track2 = 'https://dpryujcmbjcxr.cloudfront.net/TRACK2.mp3';
const track3 = 'https://dpryujcmbjcxr.cloudfront.net/TRACK3.mp3';

const meetingName = JSON.parse(getSecureSessionData('meetData'));
let currentMeetingId = null;
if (meetingName !== null && Object.keys(meetingName).length) {
  const {
    meetingData: { id },
  } = meetingName;
  currentMeetingId = Number(id);
}

let device;
let call;
let calledAPI = false;

const HostView = ({
  lockedScreen,
  setLockScreenSuccess,
  sendPublicChatSuccess,
  appReceiveError,
}) => {
  const usrData = JSON.parse(getSecureSessionData('UserData')) || {};
  let role_name = '';
  let role_id = '';
  let userDBId = '';
  if (usrData && Object.keys(usrData).length) {
    role_name =
      JSON.parse(getSecureSessionData('UserData')).userData.role_name ||
      JSON.parse(getSecureSessionData('UserData')).role_name;

    role_id =
      JSON.parse(getSecureSessionData('UserData')).userData.role_id ||
      JSON.parse(getSecureSessionData('UserData')).role_id;
    userDBId = JSON.parse(getSecureSessionData('UserData')).userData.id;
  }
  const meetId = JSON.parse(getSecureSessionData('meetData')).meetingData.id;
  const lockedScr = getSecureSessionData('isLockedScreen');
  const [userRole, setUserRole] = useState(role_name || 'OBSERVER');
  const [lockScreen, setLockScreen] = useState(true);
  const [activeTrack, setActiveTrack] = useState(track1);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isStart, setIsStart] = useState('PAUSED');
  const trackArray = [track1, track2, track3];
  //twilio
  const [room, setRoom] = useState(null);
  const [open, setOpen] = useState(false);
  const [isSeramount, setIsSeramount] = useState(true);

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    setIsSeramount(
      branding === null ? true : JSON.parse(getSecureSessionData('branding')),
    );
  }, [JSON.parse(getSecureSessionData('branding'))]);

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    if (branding === null || branding === true) {
      document.body.style.backgroundImage = `url('${seraLogo}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = `url('${EabLogo}')`;
      document.body.style.backgroundSize = 'cover';
    }
  }, [JSON.parse(getSecureSessionData('branding'))]);

  useEffect(() => {
    setLockScreen(lockedScreen);
  }, [lockedScreen]);

  useEffect(() => {
    if (
      ['true', true].includes(getSecureSessionData('isLockedScreen')) &&
      ['OBSERVER', 'PARTICIPANT'].includes(getSecureSessionData('role'))
    ) {
      getMuteStatusHandler();
    } else {
      setIsStart('PAUSED');
    }
  }, []);

  useEffect(() => {
    if (lockedScr === 'true' && room) {
      muteUser();
    }
  }, [room, lockedScr]);

  const muteUser = () => {
    room.localParticipant.audioTracks.forEach(publication => {
      publication.track.disable();
    });
  };
  useEffect(() => {
    if (['HOST', 'ADMIN', 'MODERATOR'].includes(getSecureSessionData('role'))) {
      navigator.permissions.query({ name: 'microphone' }).then(result => {
        if (result && result.state !== 'granted') {
          getUserMediaAccess();
        }
      });
    }
  }, []);

  const getUserMediaAccess = () => {
    var constraints = {
      audio: ['HOST', 'ADMIN', 'MODERATOR'].includes(
        getSecureSessionData('role'),
      )
        ? true
        : false,
      speaker: true,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function success(stream) {
        appReceiveSuccess('Access Granted');
      })
      .catch(function(err) {
        if (err) {
          // appReceiveError(err.message);
        }

        if (err.name == 'NotFoundError' || err.name == 'DevicesNotFoundError') {
          //required track is missing
        } else if (
          err.name == 'NotReadableError' ||
          err.name == 'TrackStartError'
        ) {
          //webcam or mic are already in use
        } else if (
          err.name == 'OverconstrainedError' ||
          err.name == 'ConstraintNotSatisfiedError'
        ) {
          //constraints can not be satisfied by avb. devices
        } else if (
          err.name == 'NotAllowedError' ||
          err.name == 'PermissionDeniedError'
        ) {
          //permission denied in browser
        } else if (err.name == 'TypeError' || err.name == 'TypeError') {
          //empty constraints object
        } else {
          //other errors
        }
      });
  };

  useEffect(() => {
    if (
      [true, 'true'].includes(getSecureSessionData('isLockedScreen')) &&
      [true, 'true'].includes(getSecureSessionData('isStartMeeting')) &&
      !['HOST', 'ADMIN'].includes(getSecureSessionData('role'))
    ) {
      twilioMeetingToken();
    }
  }, []);

  async function twilioMeetingToken(isStartParams) {
    try {
      const user_id = `${currentMeetingId}-${getSecureSessionData(
        'userId',
      )}-${getSecureSessionData('role')}`;
      const { success, data, message } = await meetingGQL.createTwilioToken({
        user_id,
      });
      if (success) {
        setSecureSessionData('twilioToken', data.token);
        intitializeDevice();
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

  async function getMuteStatusHandler() {
    try {
      const payload = {
        meetingId: Number(currentMeetingId),
      };
      const { success, data, message } = await meetingGQL.getMuteStatusHandler(
        payload,
      );
      if (success) {
        if (
          data.allMute &&
          [true, 'true'].includes(getSecureSessionData('isLockedScreen')) &&
          [true, 'true'].includes(getSecureSessionData('isDeviceChecked'))
        ) {
          if (isStart !== 'PLAYING') {
            if (
              [true, 'true'].includes(getSecureSessionData('isLockRefresh'))
            ) {
              setTimeout(() => {
                setIsStart('PLAYING');
                sessionStorage.removeItem('isLockRefresh');
              }, 7000);
            } else {
              setIsStart('PLAYING');
            }
          }
        } else {
          setIsStart('PAUSED');
        }
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (!['HOST', 'MODERATOR'].includes(userRole)) {
      const subscription = API.graphql(
        graphqlOperation(onSetMuteStatus, { meeting_id: currentMeetingId }),
      ).subscribe({
        next: ({ value }) => {
          const { success, data } = responseWrapper(value, 'onSetMuteStatus');
          if (
            success &&
            currentMeetingId.toString() == data.meetingId.toString()
          ) {
            if (
              data.allMute &&
              [true, 'true'].includes(getSecureSessionData('isLockedScreen'))
            ) {
              if (isStart !== 'PLAYING') {
                setIsStart('PLAYING');
              }
            } else {
              setIsStart('PAUSED');
            }
          }
        },
        error: error => console.warn(error),
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [trackArray, userRole, isStart]);

  const onUnload = event => {
    console.log('page Refreshed :>> ');
    setSecureSessionData('isLockRefresh', 'true');
    event.preventDefault();
  };

  useEffect(() => {
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onSetLockScreen, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data } = responseWrapper(value, 'onSetLockScreen');
        // Action to add screen data
        if (success && data && currentMeetingId == data.meeting_id) {
          setLockScreenSuccess(data);
          setSecureSessionData(
            'isLockedScreen',
            data.isLockedScreen.toString(),
          );
          if (
            data.isLockedScreen &&
            !['HOST', 'MODERATOR'].includes(userRole)
          ) {
            getMuteStatusHandler();
          }
          setIsStart('PAUSED');
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onPublicChat, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onPublicChat',
        );

        const { chat, meeting_id, typeId } = data;
        let updateReducer = true;
        if (
          success &&
          Number(meeting_id) === currentMeetingId &&
          userDBId.toString() !== chat.userDBId.toString()
        ) {
          let newData = data,
            newTypeId;
          if (data.typeName.includes('HOSTS-MODERATORS')) {
            if (role_id == 2 || role_id == 1) {
              newTypeId = 3;
            } else if (role_id == 3) {
              newTypeId = 2;
            }

            newData = {
              ...data,
              typeId: newTypeId,
              chat: {
                ...data.chat,
                typeId: newTypeId,
              },
            };
          } else if (
            data.typeName.includes('HOST-HOST') &&
            role_id == 3 &&
            getSecureSessionData('role') !== 'HOST'
          ) {
            updateReducer = false;
          }

          if (updateReducer) {
            sendPublicChatSuccess(newData);
          }
        } else {
          appReceiveError(message);
        }
      },
      error: error => appReceiveError(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    // <BrowserRouter path="/host">

    <>
      <Sound
        url={activeTrack}
        playStatus={isStart}
        volume={20}
        onFinishedPlaying={() => {
          setIsStart('PAUSED');
          if (activeTrackIndex === 2) {
            setActiveTrack(trackArray[0]);
            setActiveTrackIndex(0);
          } else {
            const curTr = trackArray[activeTrackIndex + 1];
            setActiveTrack(curTr);
            setActiveTrackIndex(activeTrackIndex + 1);
          }
          setIsStart('PLAYING');
        }}
      />

      {/* <button id="button-call" hidden type="submit"></button> */}
      {(lockScreen === true ||
        getSecureSessionData('isLockedScreen') === 'true' ||
        getSecureSessionData('isLockedScreen') === true) &&
      userRole !== 'HOST' &&
      userRole !== 'ADMIN' ? (
        <>
          {' '}
          {userRole === 'MODERATOR' ? (
            <>
              <div className="userDashboard dashboard participant">
                {/* {['PARTICIPANT', 'OBSERVER'].includes(
                  getSecureSessionData('role'),
                ) &&
                  (getSecureSessionData('isStartMeeting') === true ||
                    getSecureSessionData('isStartMeeting') === 'true') && (
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip>
                          <strong>Please Note:</strong> You have been
                          automatically muted and will not be able to speak
                          during the session
                        </Tooltip>
                      }
                    >
                      <Image
                        className="One cursor"
                        src={popupSpeaker}
                        style={{
                          height: '70px',
                          marginLeft: '5px',
                          cursor: 'pointer',
                        }}
                      />
                    </OverlayTrigger>
                  )} */}
                <ModeratorHeader />
                <div className="dashboard-header d-flex align-items-center">
                  <div
                    style={{
                      width: '60%',
                      height: '56px',
                      marginLeft: '2rem',
                      top: '5px',
                    }}
                  ></div>
                </div>
              </div>
            </>
          ) : (
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
                <div className="text-white mt-1">
                  We Empower Inclusive Workplaces
                </div>
              ) : (
                ''
              )}
              {/* {room && <Room roomName={roomName} room={room} />} */}
            </header>
          )}
          <section className="locked-screen-wrapper text-center">
            {/* <div className="mb-5 fw-18" style={{ maxWidth: '486px' }}>
              Please join the conference line using the information below and
              wait for further instructions from the facilitator.
            </div>
            <Link className="text-blue mb-2 text-decoration-none fw-18" to="/">
              Dial-In#
            </Link>
            <div className="mt-1 fw-18" style={{ maxWidth: '486px' }}>
              US: +1 201-479-4595 // Outside US: +1 855-346-3893 Meeting Number:
              33911576 followed by the # key
            </div>
            <div className="text-bismark mt-4">
              You must dial in using a separate phone line to hear the audio
              when the session begins
            </div> */}
            {/* <div className="col-md-9 "> */}
            {/* Thank you for joining the session! This virtual focus group is
              likely a different medium than you're used to, but our experience
              has shown that the candor, quantitative and qualitative data we
              are able to obtain makes it a powerful research tool. Your
              participant in the session will be kept completely confidential,
              and we appreciate your candid responses. */}
            {/* ------------------------------------------------------------- */}
            {/* Thank you for joining the session! This virtual focus group is
              likely a different medium than you're used to, but our experience
              has shown that the candor, quantitative and qualitative data we
              are able to obtain makes it a powerful research tool. Your
              participation in the session will be kept completely confidential,
              and we appreciate your candid responses. */}
            {/* --------------------------------------------------------- */}

            <div className="col-md-12">
              {['PARTICIPANT', 'OBSERVER'].includes(
                getSecureSessionData('role'),
              ) && (
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip>
                      <strong>Please Note:</strong> You have been automatically
                      muted and will not be able to speak during the session
                    </Tooltip>
                  }
                >
                  <Image
                    className="One"
                    alt="popupSpeaker"
                    src={popupSpeaker}
                    style={{
                      height: '70px',
                      position: 'absolute',
                      cursor: 'pointer',
                      top: '125px',
                      left: '5px',
                    }}
                  />
                </OverlayTrigger>
              )}
              <div>
                <div
                  className="text-start col-lg-6 col-md-9 mx-auto"
                  style={{ position: 'relative', width: '100%' }}
                  // style={{ textAlign: 'start', width: '54%', margin: 'auto' }}
                >
                  <form
                    className={`card col-md-9 ${
                      userRole === 'MODERATOR'
                        ? 'custom-card-moderator'
                        : 'custom-card'
                    }`}
                  >
                    <h3 className="heading-title1" style={{ fontsize: '28px' }}>
                      Thank you for joining us for your Employee Voice Session.
                    </h3>
                    <span
                      className="heading-title"
                      style={{ fontsize: '18px' }}
                    >
                      We are so glad you are here!
                    </span>
                    <span
                      className="heading-title"
                      style={{ fontsize: '18px' }}
                    >
                      We will get started in just a few minutes.
                    </span>
                    <hr style={{ borderColor: 'black' }} />
                    <h5 className="heading-title2" style={{ fontsize: '20px' }}>
                      <strong>While you wait, feel free to:</strong>
                    </h5>
                    <ul className="p-0">
                      <li
                        className="heading-title"
                        style={{ fontsize: '16px' }}
                      >
                        Check your <strong>audio</strong> and make sure you can
                        hear music in the background.
                      </li>
                      <li
                        className="heading-title"
                        style={{ fontsize: '16px' }}
                      >
                        Watch this{' '}
                        <strong>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://fast.wistia.com/embed/medias/qsqe412jus/"
                          >
                            short video
                          </a>
                        </strong>{' '}
                        to learn more about the technology that powers this
                        session.
                      </li>
                      <li
                        className="heading-title"
                        style={{ fontsize: '16px' }}
                      >
                        Take a couple of <strong>deep breaths</strong> and get
                        into a calm mental space that will allow you to share
                        authentic feedback.
                      </li>
                    </ul>
                  </form>
                  {!open && (
                    <WizardSpeaker
                      setOpen={setOpen}
                      setIsStartLS={setIsStart}
                      getMuteStatusHandler={getMuteStatusHandler}
                    />
                  )}
                </div>
              </div>
            </div>
            {/* </div> */}
          </section>
          {userRole !== 'PARTICIPANT' && (
            <ParticipantRightSidebar userRole={userRole} />
          )}
        </>
      ) : (
        <div className="host-view-wrapper">
          <div>
            <Header />
            <div className="row mx-0" id="main-comp">
              <Sidebar />
              <div
                className={`${!['PARTICIPANT', 'OBSERVER'].includes(userRole) &&
                  'wrapper'}`}
              >
                <Switch>
                  <Route exact path="/" component={Dashboard} />
                </Switch>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const withReducer = injectReducer({ key: 'app', reducer });

const mapStateToProps = state => {
  const { app } = state;
  return {
    lockedScreen: lockedScreen(app),
  };
};
export function mapDispatchToProps(dispatch) {
  return {
    setLockScreenSuccess: payload => dispatch(setLockScreenSuccess(payload)),
    sendPublicChatSuccess: payload => dispatch(sendPublicChatSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    dispatch,
  };
}

HostView.propTypes = {
  lockedScreen: PropTypes.bool,
  setLockScreenSuccess: PropTypes.func,
  sendPublicChatSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(HostView);
