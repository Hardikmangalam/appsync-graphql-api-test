/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Switch, Router, Route } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { createBrowserHistory } from 'history';
import { meetingGQL, screenGQL, userGQL } from './graphqlOperations';
// //store
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Button, Modal } from 'react-bootstrap';

import {
  getMeetingSuccess,
  getMeeetingFailed,
  getMeetingRequest,
  loginSuccess,
  getPermissionSuccess,
} from './store/actions/login';
import 'react-datepicker/dist/react-datepicker.css';
import './assets/scss/style.scss';
import Login from './views/Login';
import HostView from './views/HostView';
import Dashboard from './views/HostView/Dashboard/Dashboard';
import reducer, { getMeetings } from './store/reducers/login';
import injectReducer from './utils/injectReducer';
import NotFound from './views/404';
import { appReceiveError, appReceiveSuccess } from '../src/store/actions/error';
import {
  onGetScreenSuccess,
  onGetAttendeesSuccess,
} from '../src/store/actions/host-ui';
import waitingScreen from './views/waitingScreen';
import { API, graphqlOperation } from 'aws-amplify';

import {
  onStartStopMeeting,
  onSetLockScreen,
  onChangeUserPermission,
  onLoggedInUsers,
} from './graphql/subscriptions';
import responseWrapper from './graphqlOperations/responseWrapper';
import { setLockScreenSuccess } from './store/actions/app';
import { hangUpCall } from './views/HostView/Dashboard/TwilioFunctions';
import favicon from './assets/images/favicon.ico';
import favicon_eab from './assets/images/favicon_eab.ico';
import Vizart from './views/Vizart';
import VizartSuccess from './views/Vizart/vizartSuccess';
import vizartTrubleShoot from './views/Vizart/vizartTrubleShoot';
import CustomModal from './common/customModal';
import Preview from './views/Survey/Preview';
import InviteICS from './views/Survey/InviteICS';
import GlobalCookieBanner from './common/GlobalCookieBanner';
import {
  getSecureSessionData,
  setSecureSessionData,
} from './graphqlOperations/encryprWrapper';
import GlobalCookiePreferance from './common/GlobalCookiePreferance';

const history = createBrowserHistory();
const queryList = ['templateId', 'authURI', 'url', 'isEdit'];

const Routes = ({
  getMeetingSuccess,
  meetingList,
  getMeetingRequest,
  appReceiveError,
  onGetScreenSuccess,
  setLockScreenSuccess,
  appReceiveSuccess,
  app,
  loginSuccess,
  // permissions,
}) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isStart, setIsStart] = useState(
    [true, 'true'].includes(getSecureSessionData('isStartMeeting')),
  );
  const [show, setShow] = useState(false);
  const [started, setStarted] = useState(false);

  const meetingName = JSON.parse(getSecureSessionData('meetData'));
  const pathName = window.location.origin;
  const hrefURL = pathName + '/';
  let currentMeetingId = null;

  if (
    document.referrer !== '' &&
    document.referrer !== hrefURL &&
    !getSecureSessionData('referrerUrl')
  ) {
    setSecureSessionData('referrerUrl', document.referrer);
  }

  // useEffect(() => {
  //   var Cookies = document.cookie.split(';');
  //   // set past expiry to all cookies
  //   const data = Cookies.some(
  //     el => el.replace(/^\s+|\s+$/gm, '') === 'CookieConsent=true',
  //   );
  //   if (data) {
  //     setSecureSessionData('CookieConsent', 'true');
  //     // sessionStorage.setItem('CookieConsent', true);
  //     manageCookie({ isEnable: true });
  //   } else {
  //     manageCookie({ isEnable: false });
  //     clearCookie.remove('CookieConsent');
  //   }
  // }, []);

  useEffect(() => {
    setIsStart([true, 'true'].includes(getSecureSessionData('isStartMeeting')));
  }, [getSecureSessionData('isStartMeeting')]);

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (branding === null || branding === true) {
      link.href = favicon;
      document.title = 'Seramount';
    } else {
      link.href = favicon_eab;
      document.title = 'EAB';
    }
  }, [JSON.parse(getSecureSessionData('branding'))]);

  if (meetingName !== null && Object.keys(meetingName).length) {
    const {
      meetingData: { id },
    } = meetingName;
    currentMeetingId = Number(id);
  }

  const removeUser = () => {
    // sessionStorage.clear();
    setShow(false);
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

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onChangeUserPermission, {
        meeting_id: currentMeetingId,
      }),
    ).subscribe({
      next: ({ value }) => {
        const { data, success, message } = responseWrapper(
          value,
          'onChangeUserPermission',
        );
        // Action to add screen data
        if (success) {
          let existingUserData = JSON.parse(getSecureSessionData('UserData'));
          // const existingRole = getSecureSessionData('role')
          if (
            existingUserData.userData.id == data.userData.id &&
            data.meeting_id == currentMeetingId
          ) {
            // Removing user from room
            if (data.isAdd == false) {
              // TODO :- Add custom pop-up with OK button
              // alert(
              //   `You've been removed from session. Thank you for your participantion. You have been removed from the session. if you would like to rejoin or belive this happened in error, please email `,
              // );
              setShow(true);
              // setTimeout(() => {
              //   sessionStorage.clear();
              //   window.location.reload();
              // }, 5000);
            } else if (data.promote) {
              // Promoting user
              existingUserData = {
                ...existingUserData,
                userData: data.userData,
                token: data.token,
                user_id: data.user_id,
              };
              setSecureSessionData('role', data.userData.role_name);
              setSecureSessionData('userId', data.user_id);
              setSecureSessionData(
                'UserData',
                JSON.stringify(existingUserData),
              );
              setSecureSessionData('token', data.token);
              // getPermissionHandler(data.userData.role_id);
              setShowModal(true);
            } else if (!data.promote) {
              existingUserData = {
                ...existingUserData,
                userData: data.userData,
                token: data.token,
                user_id: data.user_id,
              };
              setSecureSessionData('role', data.userData.role_name);
              setSecureSessionData('userId', data.user_id);
              setSecureSessionData(
                'UserData',
                JSON.stringify(existingUserData),
              );
              setSecureSessionData('token', data.token);
              // getPermissionHandler(data.userData.role_id);
              setShowModal(true);
            }
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

  // async function getPermissionHandler() {
  //   await hangUpCall();
  //   try {
  //     const { success, data, message } = await userGQL.getPermissionsHandler();
  //     if (success) {
  //       if (data.meeting_id == currentMeetingId)
  //         getPermissionSuccess(data.permissions);
  //     } else {
  //       appReceiveError(message);
  //     }
  //   } catch (err) {
  //     appReceiveError(err);
  //   }
  // }
  const onRoleChange = async () => {
    if (!isStart) {
      setSecureSessionData('isStartMeeting', !isStart.toString());
    } else {
      setSecureSessionData('isRoleChanged', 'true');
      // await document.getElementById('button-hangup-outgoing').click();
    }
    window.onbeforeunload = null;
    window.location.reload();
  };

  async function getmeetingsHandler(meet) {
    sessionStorage.clear();
    getMeetingRequest();
    try {
      const payload = {
        meeting_id: Number(meet),
      };

      const { success, data, message } = await meetingGQL.getMeetingHandler(
        payload,
      );
      if (success) {
        !getSecureSessionData('meetData')
          ? setSecureSessionData('meetData', JSON.stringify(data))
          : '';
        setSecureSessionData(
          'isLockedScreen',
          data &&
            data.meetingData &&
            data.meetingData.is_screen_lock.toString(),
        );
        setLockScreenSuccess({
          isLockedScreen:
            data &&
            data.meetingData &&
            data.meetingData.is_screen_lock.toString(),
        });
        if (data && data.isValid) {
          if (data.isExpired) {
            alert('Meeting is Expired');
          } else {
            setSecureSessionData(
              'branding',
              JSON.stringify(data.meetingData.is_seramount),
            );
            if (
              history.location.search.includes('user') ||
              history.location.search.includes('obs')
            ) {
              loginCall();
            } else {
              history.replace('/login');
            }
          }
        } else {
          alert('Invalid meeting URL');
        }
        getMeetingSuccess(data);
      } else {
        appReceiveError(message);
        getMeeetingFailed(message);
      }
    } catch (err) {
      getMeeetingFailed(err);
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

  //for the magiclink
  const loginCall = async () => {
    const meetingUrl = history.location.pathname.split('_');
    const meetingID = Number(meetingUrl[meetingUrl.length - 1]);

    const userId = history.location.search.split('=');
    setSecureSessionData('obs_token', userId[1]);
    if (
      history.location.search.includes('user') ||
      history.location.search.includes('obs')
    ) {
      let payload = {};
      if (history.location.search.includes('user')) {
        payload = {
          login_token: userId[1],
          meeting_id: meetingID,
        };
      } else {
        payload = {
          obs_token: userId[1],
          meeting_id: meetingID,
        };
      }
      const { data, success, message } = await meetingGQL.loginHandler(payload);
      if (success && data) {
        appReceiveSuccess(message);
        setLoading(false);
        loginSuccess(data);
        if (data && data.meetingData) {
          setSecureSessionData(
            'isStartMeeting',
            data.meetingData.is_started.toString(),
          );
        }
        if (
          data &&
          data.meetingData &&
          data.meetingData.is_started &&
          data.screenData
        ) {
          setSecureSessionData(
            'selectedScreen',
            JSON.stringify(data.screenData),
          );
        }
        setSecureSessionData('UserData', JSON.stringify(data));
        setSecureSessionData('token', data.token);

        setSecureSessionData('role', data.userData.role_name);
        setSecureSessionData('userId', data.user_id);
        setSecureSessionData('fromSession', 'true');
        if (
          data.userData.role_name === 'HOST' ||
          data.userData.role_name === 'ADMIN'
        ) {
          const informHostPayload = {
            user_id: data.user_id,
            isAdd: true,
          };

          await handleInformHost(informHostPayload);
        }
        if (data.userData.role_name == 'OBSERVER') {
          if (history.location.search.includes('obs')) {
            setSecureSessionData('isObserverLink', 'true');
          }
          history.replace({ pathname: '/login/observer', state: { data } });
        } else if (data.userData.role_name == 'MODERATOR') {
          history.replace({ pathname: '/login/moderator', state: { data } });
        } else if (data.userData.role_name == 'PARTICIPANT') {
          history.replace({ pathname: '/login/participant', state: { data } });
        } else {
          window.location.href = `${pathName}/`;
        }
      } else {
        setLoading(false);
        appReceiveError(message);
      }
    }
  };

  async function handleInformHost(payload) {
    try {
      await meetingGQL.informHostHandler(payload);
      setSecureSessionData('Attendees', JSON.stringify([]));
    } catch (err) {
      console.log('error informing host...', err);
    }
  }

  async function getTemplateHandler(payload) {
    try {
      setLoading(true);
      const {
        success,
        data,
        message,
      } = await screenGQL.validateAdminForTemplateHandler(payload);
      if (success) {
        setLoading(false);
        setSecureSessionData('isNewTemplate', data.isNEw.toString());
        setSecureSessionData('meetData', JSON.stringify(data));
        setSecureSessionData('UserData', JSON.stringify(data));
        setSecureSessionData('templateData', JSON.stringify(data.templateData));
        setSecureSessionData('token', data.token);
        setSecureSessionData('role', data.userData.role_name);
        setSecureSessionData('fromSession', 'false');
        setSecureSessionData('templateView', 'true');
        localStorage.setItem('templateId', payload.templateId);
        getMeetingSuccess(data);
        onGetScreenSuccess(data.screens);
        const pathName = window.location.origin;
        window.location.href = `${pathName}/`;
      } else {
        alert(message);
        setLoading(false);
        appReceiveError(message);
      }
    } catch (err) {
      setLoading(false);
      appReceiveError(err);
    }
  }

  const getTemplate = async () => {
    const query = new URLSearchParams(history.location.search);
    let obj = {};
    queryList.forEach(e => {
      obj[e] = query.get(e);
    });
    obj.authURI = obj.authURI.replace(/ /g, '+');
    if (obj.isEdit === 'true') {
      setSecureSessionData('isEditTemplate', 'true');
      setSecureSessionData('allowEditTemplate', 'true');
      getTemplateHandler(obj);
    } else {
      getTemplateHandler(obj);
    }
  };

  useEffect(() => {
    const meetingUrl = history.location.pathname.split('_');
    const meetingID = Number(meetingUrl[meetingUrl.length - 1]);
    if (history.location.pathname.includes('/meeting/')) {
      if (meetingID && typeof meetingID == 'number') {
        getmeetingsHandler(meetingID);
      }
    } else if (history.location.pathname.includes('/template')) {
      getTemplate();
    } else {
      if (!getSecureSessionData('meetData')) {
        console.log('history', history);
        const routeData = history.location.pathname.split('/');
        console.log('routeData', routeData);
        if (
          !routeData.includes('user-survey') &&
          !routeData.includes('survey-share') &&
          !routeData.includes('invite')
        ) {
          history.replace('/invalid');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (currentMeetingId === null) return;
    const subscription = API.graphql(
      graphqlOperation(onStartStopMeeting, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data } = responseWrapper(value, 'onStartStopMeeting');
        if (success) {
          let meetingData = JSON.parse(getSecureSessionData('meetData'));
          let userData = JSON.parse(getSecureSessionData('UserData'));
          if (
            meetingData.meetingData.id == data.id &&
            userData.meetingData.id == data.id
          ) {
            window.onbeforeunload = null;
            setSecureSessionData(
              'isLockedScreen',
              data.is_screen_lock.toString(),
            );
            setSecureSessionData('isStartMeeting', data.is_started.toString());
            const extIsWait = userData.isWait;
            delete meetingData.meetingData;
            delete userData.meetingData;
            delete userData.isWait;
            meetingData = { ...meetingData, meetingData: data };
            userData = {
              ...userData,
              isWait:
                getSecureSessionData('role') === 'OBSERVER' &&
                data.is_started &&
                extIsWait
                  ? true
                  : false,
              meetingData: data,
            };
            setSecureSessionData('meetData', JSON.stringify(meetingData));
            setSecureSessionData('UserData', JSON.stringify(userData));
            if (!['ADMIN', 'HOST'].includes(getSecureSessionData('role'))) {
              if (userData && data.is_screen_lock && !data.is_started) {
                getlogoutUser();
                setStarted(true);
                // window.location.href = `/login`;
              } else if (
                !data.is_started &&
                ['PARTICIPANT', 'OBSERVER', 'MODERATOR'].includes(
                  getSecureSessionData('role'),
                )
              ) {
                getlogoutUser();
                hangUpCall();
                let branding = getSecureSessionData('branding');
                branding = JSON.parse(branding);

                sessionStorage.clear();
                setStarted(true);
                // setSecureSessionData('meetData', JSON.stringify(meetingData));
                setSecureSessionData('branding', JSON.stringify(branding));
              } else {
                window.location.href = '/';
              }
            }
            if (['ADMIN', 'HOST'].includes(getSecureSessionData('role'))) {
              window.location.reload();
            }
          }
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentMeetingId]);

  // useEffect(() => {
  //   const subscription = API.graphql(
  //     graphqlOperation(onLoggedInUsers, { meeting_id: currentMeetingId }),
  //   ).subscribe({
  //     next: ({ provider, value }) => {
  //       const { success, data, allJoinUsers } = responseWrapper(
  //         value,
  //         'onLoggedInUsers',
  //       );

  //       // Action to add screen data
  //       if (
  //         success &&
  //         data &&
  //         data.meeting_id.toString() === currentMeetingId.toString()
  //       ) {
  //         const { isAdd } = data;
  //         let existingJoinedUser = JSON.parse(
  //           getSecureSessionData('Attendees'),
  //         );
  //         existingJoinedUser =
  //           existingJoinedUser &&
  //           Array.isArray(existingJoinedUser) &&
  //           existingJoinedUser.length
  //             ? existingJoinedUser
  //             : [];
  //         if (isAdd) {
  //           existingJoinedUser = [
  //             ...existingJoinedUser.filter(
  //               e => e.userData.id !== data.userData.id,
  //             ),
  //             data,
  //           ];
  //         } else {
  //           existingJoinedUser = [
  //             ...existingJoinedUser.filter(
  //               e => e.userData.id !== data.userData.id,
  //             ),
  //           ];
  //         }
  //         const usrId = getSecureSessionData('userId');

  //         if (getSecureSessionData('role') === 'PARTICIPANT') {
  //           const findData = allJoinUsers.find(e => e.user_id === usrId);
  //           if (
  //             findData &&
  //             findData.userData &&
  //             findData.userData.meetingGroupId
  //           ) {
  //             setSecureSessionData(
  //               'meetingGroupIds',
  //               findData.userData.meetingGroupId,
  //             );
  //           }
  //         }
  //         if (getSecureSessionData('role') === 'HOST') {
  //           const usrList = allJoinUsers.filter(e => e.user_id !== usrId);
  //           usrList.push(data);
  //           onGetAttendeesSuccess(usrList); //set in store
  //           setSecureSessionData('Attendees', JSON.stringify(usrList));
  //         }
  //         // onGetAttendeesSuccess(existingJoinedUser); //set in store
  //         existingJoinedUser = JSON.stringify(existingJoinedUser);
  //         setSecureSessionData('Attendees', existingJoinedUser);
  //       }
  //     },
  //     error: error => console.warn(error),
  //   });
  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);

  useEffect(() => {
    let data = getSecureSessionData('UserData');
    data = JSON.parse(data);
    setUserData(data);
  }, [getSecureSessionData('UserData')]);

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
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const redirectUser = () => {
    let branding = getSecureSessionData('branding');
    branding = JSON.parse(branding);
    if (branding === true) {
      window.location.href = `https://seramount.com/`;
    } else {
      window.location.href = `https://eab.com/`;
    }
  };

  return (
    <>
      {![true, 'true'].includes(getSecureSessionData('templateView')) &&
        !history.location.pathname.includes('/template') &&
        !history.location.pathname.includes('/invite') &&
        !history.location.pathname.includes('/invalid') && (
          <div className="GlobalCookieBanner">
            <GlobalCookiePreferance />
            {/* <GlobalCookieBanner /> */}
          </div>
        )}
      {started && (
        <Modal show={started} style={{ marginTop: '20%' }}>
          <Modal.Header>
            <Modal.Title>
              <div className="model-title1">
                <strong>
                  The session has ended. Thank you again for your participation.
                </strong>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button
              variant="blue-10"
              className="ms-3 text-blue"
              aria-label="OK"
              onClick={() => redirectUser()}
            >
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {meetingList && meetingList.fetching ? (
        <div style={{ height: '80vh', display: 'flex' }}>
          <Spinner
            className="m-auto"
            animation="border"
            role="status"
            size="lg"
          />
        </div>
      ) : (
        <Router history={history}>
          <Switch>
            {history.location.pathname.includes('/template') && loading ? (
              <div style={{ height: '80vh', display: 'flex' }}>
                <Spinner
                  className="m-auto"
                  animation="border"
                  role="status"
                  size="lg"
                />
              </div>
            ) : getSecureSessionData('meetData') ? (
              <>
                {(userData &&
                  userData.userData &&
                  userData.userData.role_name !== 'HOST' &&
                  userData.userData.role_name !== 'ADMIN' &&
                  userData.isWait === true) ||
                (userData &&
                  userData.userData &&
                  (userData.userData.role_name === 'OBSERVER' ||
                    userData.userData.role_name === 'MODERATOR') &&
                  isStart === false) ? (
                  <Route path="/" exact component={waitingScreen} />
                ) : (
                  <Route path="/" exact component={HostView} />
                )}
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/login" component={Login} />
              </>
            ) : (
              <>
                <Route exact path="/invalid" component={NotFound} />
                <Route path="/user-survey/:id" component={Preview} />
                <Route path="/survey-share/:id/:text" component={Preview} />
                <Route exact path="/invite/ics/:id" component={InviteICS} />
                <Route exact path="/speaker" component={Vizart} />
                <Route exact path="/success" component={VizartSuccess} />
                <Route
                  exact
                  path="/trubleShoot"
                  component={vizartTrubleShoot}
                />
              </>
            )}
          </Switch>
        </Router>
      )}
      <CustomModal
        title={`You are set as ${getSecureSessionData('role')}`}
        isActive={showModal}
        handleClose={() => {
          setShowModal({ showModal: false });
        }}
        handleButtonClick={onRoleChange}
        buttonTitle="Ok"
      />

      {show && (
        <Modal show={show}>
          <Modal.Body>
            Thank you for your participantion. You have been removed from the
            session. If you would like to rejoin or believe this happened in
            error, please email EVSsupport@seramount.com
            {/* <a href="mailto:EVSsupport@seramount.com">
              EVSsupport@seramount.com
            </a> */}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="blue"
              onClick={() => removeUser()}
              aria-label="blue-Ok"
            >
              Ok
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

const withReducer = injectReducer({ key: 'logIn', reducer });

const mapStateToProps = state => {
  const { logIn, app, hostUI } = state;
  return {
    meetingList: getMeetings(logIn),
    app,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    getMeetingSuccess: payload => dispatch(getMeetingSuccess(payload)),
    getMeetingRequest: payload => dispatch(getMeetingRequest(payload)),
    getMeeetingFailed: payload => dispatch(getMeeetingFailed(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    onGetScreenSuccess: payload => dispatch(onGetScreenSuccess(payload)),
    setLockScreenSuccess: payload => dispatch(setLockScreenSuccess(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    loginSuccess: payload => dispatch(loginSuccess(payload)),
    getPermissionSuccess: payload => dispatch(getPermissionSuccess(payload)),
    onGetAttendeesSuccess: payload => dispatch(onGetAttendeesSuccess(payload)),
    dispatch,
  };
}

Routes.propTypes = {
  isAuth: PropTypes.string,
  getMeetingSuccess: PropTypes.func,
  getMeetingRequest: PropTypes.func,
  getMeeetingFailed: PropTypes.func,
  meetingList: PropTypes.object,
  appReceiveError: PropTypes.func,
  onGetScreenSuccess: PropTypes.func,
  setLockScreenSuccess: PropTypes.func,
  app: PropTypes.object,
  appReceiveSuccess: PropTypes.func,
  loginSuccess: PropTypes.func,
  onGetAttendeesSuccess: PropTypes.func,
  permissions: PropTypes.array,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Routes);
