/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import injectReducer from '../../../utils/injectReducer';
import { API, graphqlOperation } from 'aws-amplify';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import {
  onCreateNote,
  onCreateQuestionByScreen,
  onCreateScreens,
  onDeleteScreens,
  onUpdateQuestionByScreen,
  onUpdateQuestionOrders,
  onLoggedInUsers,
  onSubmitResponses,
  onQuickAnswer,
  onDeleteQuestionByScreen,
  onSetSelectedScreen,
  onChangeCardSize,
  onStartStopMeeting,
  onUpdateUserWaitlist,
  onLogoutUser,
  onScreenLayout,
} from '../../../graphql/subscriptions';
import responseWrapper from '../../../graphqlOperations/responseWrapper';
import {
  onCreateQuestionSuccess,
  onCreateScreenSuccess,
  onUpdateQuestionSuccess,
  onUpdateUserSuccess,
  onDeleteScreenSuccess,
  onUpdateQuestionOrdersuccess,
  onSubmitResponsesSuccess,
  onGetAttendeesSuccess,
  onGetQuickAnswerSuccess,
  onDeleteQuestionSuccess,
  onUpdateSelectedScreenSuccess,
  onGetCardResizeSuccess,
  onGetQuestionNumbersSuccess,
  onGetQuestionSuccess,
  updateNotes,
  submitResponse,
  onGetLayoutSuccess,
  meetingGroupChat,
} from '../../../store/actions/host-ui';
import HostDashboard from './HostDashboard';
import ParticipantDashboard from './ParticipantDashboard';
import ModeratorUserDashboard from './ModeratorDashboard';
import ObserverDashboard from './ObserverDashboard';
import {
  setLockScreenSuccess,
  sendPublicChatSuccess,
} from '../../../store/actions/app';
import { getPermissionSuccess } from '../../../store/actions/login';
import { userGQL, questionGQL } from '../../../graphqlOperations';
import {
  appReceiveSuccess,
  appReceiveError,
} from '../../../store/actions/error';
import { createBrowserHistory } from 'history';

import { logoutUser } from '../../../graphql/mutations';
import WizardSpeaker from '../../Vizart';
import EabLogo from '../../../assets/images/EABbrand.svg';
import seraLogo from '../../../assets/images/EABseramount.svg';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

const meetingName = JSON.parse(getSecureSessionData('UserData'));
let currentMeetingId = null;
if (meetingName !== null && Object.keys(meetingName).length) {
  const {
    meetingData: { id },
  } = meetingName;
  currentMeetingId = Number(id);
}

const Dashboard = ({
  host_ui,
  selected_screen,
  onCreateScreenSuccess,
  onCreateQuestionSuccess,
  onUpdateQuestionSuccess,
  onUpdateUserSuccess,
  onDeleteScreenSuccess,
  onUpdateQuestionOrdersuccess,
  onGetQuickAnswerSuccess,
  onSubmitResponsesSuccess,
  onGetAttendeesSuccess,
  getPermissionSuccess,
  sendPublicChatSuccess,
  appReceiveError,
  appReceiveSuccess,
  submitResponse,
  /// test purpose
  chatArray,
  onDeleteQuestionSuccess,
  onUpdateSelectedScreenSuccess,
  onGetCardResizeSuccess,
  onGetQuestionNumbersSuccess,
  updateNotes,
  onGetQuestionSuccess,
  onGetLayoutSuccess,
  meetingGroupChat,
  meetingGroupChatId,
}) => {
  const role_name =
    JSON.parse(getSecureSessionData('UserData')) &&
    JSON.parse(getSecureSessionData('UserData')).userData &&
    JSON.parse(getSecureSessionData('UserData')).userData.role_name;
  // const userDBId = JSON.parse(getSecureSessionData('UserData')).userData.id;
  const [userRole, setUserRole] = useState(role_name || 'OBSERVER');
  const [selectedScreen, setSelectedScreen] = useState({});
  const [open, setOpen] = useState(false);
  const history = createBrowserHistory();
  const [compKey, setCompKey] = useState(0);
  const [chatId, setChatId] = useState([]);
  const [isStart, setIsStart] = useState(
    [true, 'true'].includes(getSecureSessionData('isStartMeeting')),
  );
  const prevSomeProp = useRef(meetingGroupChatId);
  const [isSeramount, setIsSeramount] = useState(true);
  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    setIsSeramount(
      branding === null ? true : JSON.parse(getSecureSessionData('branding')),
    );
  }, [JSON.parse(getSecureSessionData('branding'))]);
  let userData = JSON.parse(getSecureSessionData('UserData'));

  async function getPermissionHandler() {
    try {
      const { success, data, message } = await userGQL.getPermissionsHandler();
      if (success) {
        if (data.meeting_id == currentMeetingId)
          getPermissionSuccess(data.permissions);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    sessionStorage.removeItem('newMessage');
    setSelectedScreen(selected_screen);
  }, [selected_screen]);

  useEffect(() => {
    getPermissionHandler();
  }, []);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateQuestionByScreen, {
        meeting_id: currentMeetingId,
      }),
    ).subscribe({
      next: ({ value }) => {
        const { success, data, meeting_id, message } = responseWrapper(
          value,
          'onCreateQuestionByScreen',
        );
        // Action to add screen data
        if (success && data.length && meeting_id == currentMeetingId) {
          onCreateQuestionSuccess(data[0]);
          getQuestionNumberHandler();
        }
      },
      error: error => {
        const {
          data: { meeting_id },
          message,
        } = error;
        if (meeting_id == currentMeetingId) appReceiveError(message);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    appReceiveError,
    getQuestionNumberHandler,
    onCreateQuestionSuccess,
    selectedScreen,
  ]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onSubmitResponses, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ value }) => {
        const { success, data } = responseWrapper(value, 'onSubmitResponses');
        if (
          success &&
          userRole == 'PARTICIPANT' &&
          currentMeetingId == data.meeting_id
        ) {
          // submitResponse({ ...data, fromSubscription: true });
          onSubmitResponsesSuccess(data[0]);
        }

        if (
          success &&
          ['MODERATOR', 'OBSERVER', 'PARTICIPANT'].includes(userRole) &&
          currentMeetingId == data.meeting_id
        ) {
          let screenData = JSON.parse(getSecureSessionData('selectedScreen'));
          getQuestionHandler(screenData.id);
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [host_ui.selected_screen, submitResponse, userRole]);

  async function getQuestionNumberHandler() {
    try {
      const payload = {
        meetingId: currentMeetingId,
      };

      const {
        success,
        data,
        message,
      } = await questionGQL.getQuestionNumbersHandler(payload);
      if (success) {
        onGetQuestionNumbersSuccess(data);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateQuestionByScreen, {
        meeting_id: currentMeetingId,
      }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, message, meeting_id } = responseWrapper(
          value,
          'onUpdateQuestionByScreen',
        );
        // Action to add screen data
        if (success) {
          if (data && data.length && meeting_id == currentMeetingId) {
            onUpdateQuestionSuccess(data[0]);
          }
        } else {
          appReceiveError(message);
        }
      },
      error: error => {
        const {
          data: { meeting_id },
          message,
        } = error;
        if (meeting_id == currentMeetingId) appReceiveError(message);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appReceiveError, onUpdateQuestionSuccess]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateUserWaitlist, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onUpdateUserWaitlist',
        );
        if (success && data && data.meeting_id == currentMeetingId) {
          if (userRole === 'HOST' || userRole === 'ADMIN') {
            let TotalWaitlist = JSON.parse(getSecureSessionData('Waitlist'));
            TotalWaitlist =
              TotalWaitlist && TotalWaitlist.length > 0 ? TotalWaitlist : [];
            // Action to add screen data
            if (TotalWaitlist.length) {
              const newTotalWaitlist = TotalWaitlist.filter(
                obj => !data.user_id.includes(obj.id),
              );
              onUpdateUserSuccess(newTotalWaitlist);
              setSecureSessionData(
                'Waitlist',
                JSON.stringify(newTotalWaitlist),
              );
            }
          }
        } else {
          if (data && data.meeting_id == currentMeetingId) {
            appReceiveError(message);
          }
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appReceiveError, onUpdateUserSuccess, userRole]);

  useEffect(() => {
    let meetData = JSON.parse(getSecureSessionData('meetData'));
    const subscription = API.graphql(
      graphqlOperation(onCreateNote, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onCreateNote',
        );
        if (success) {
          if (data.id == currentMeetingId) {
            let dataVal = JSON.parse(getSecureSessionData('meetData'));
            dataVal = {
              ...dataVal,
              meetingData: {
                ...dataVal.meetingData,
                note_description: data.note_description,
                note_title: data.note_title,
              },
            };
            setCompKey(Math.random());
            updateNotes({
              note_desc: data.note_description,
              note_title: data.note_title,
            });
            setSecureSessionData('meetData', JSON.stringify(dataVal));
          }
        } else {
          let userData = JSON.parse(getSecureSessionData('UserData'));
          if (
            userData &&
            userData.userData &&
            userData.userData.role_name === 'HOST'
          ) {
            appReceiveError(message);
          }
        }
      },
      error: error => {
        const {
          data: { meeting_id },
          message,
        } = error;
        if (meeting_id == currentMeetingId) appReceiveError(message);
      },
    });
    updateNotes({
      note_desc:
        meetData &&
        meetData.meetingData &&
        meetData.meetingData.note_description,
      note_title:
        meetData && meetData.meetingData && meetData.meetingData.note_title,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appReceiveError, updateNotes]);

  async function getQuestionHandler(item) {
    try {
      const payload = {
        screen_id: item,
      };
      const { success, data, message } = await questionGQL.getQuestionHandler(
        payload,
      );
      if (success) {
        onGetQuestionSuccess(data);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    prevSomeProp.current = meetingGroupChatId;
  }, [meetingGroupChatId]);

  const updateNewSession = (meetingData, question_id) => {
    if (!meetingData.includes(question_id)) {
      meetingData.push(question_id);
      setSecureSessionData('newMessage', JSON.stringify(meetingData));
    }
  };

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onQuickAnswer, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data } = responseWrapper(value, 'onQuickAnswer');
        // Action to add screen data

        let mgId = getSecureSessionData('meetingGroupIds');
        if (success && data.meeting_id == currentMeetingId) {
          let userData = JSON.parse(getSecureSessionData('UserData'));
          let meetingData =
            JSON.parse(getSecureSessionData('newMessage')) || [];

          if (data.message && userData.user_id !== data.user_id) {
            if (getSecureSessionData('role') === 'PARTICIPANT') {
              if (data.meetingGroupIds && data.meetingGroupIds.length > 0) {
                if (
                  data.meetingGroupIds.some(
                    e => e.toString() === mgId.toString(),
                  )
                ) {
                  updateNewSession(meetingData, data.question_id);
                  onGetQuickAnswerSuccess(data);
                }
              } else {
                updateNewSession(meetingData, data.question_id);
                onGetQuickAnswerSuccess(data);
              }
            } else {
              if (getSecureSessionData('role') !== 'PARTICIPANT') {
                const groupIds = prevSomeProp.current || [];
                if (
                  data.meetingGroupIds &&
                  data.meetingGroupIds.length > 0 &&
                  groupIds &&
                  groupIds.length > 0
                ) {
                  if (data.meetingGroupIds.some(e => groupIds.includes(e))) {
                    updateNewSession(meetingData, data.question_id);
                  }
                } else {
                  updateNewSession(meetingData, data.question_id);
                }
                onGetQuickAnswerSuccess(data);
              }
            }
          }
        }
      },
      error: error => appReceiveError(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentMeetingId]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateScreens, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onCreateScreens',
        );
        // Action to add screen data
        if (success) {
          if (data.meeting_id == currentMeetingId) {
            onCreateScreenSuccess(data);
            setSelectedScreen(data);
            // appReceiveSuccess(message);
          }
        } else {
          appReceiveError(message);
        }
      },
      error: error => {
        const {
          data: { meeting_id },
          message,
        } = error;
        if (meeting_id == currentMeetingId) appReceiveError(message);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appReceiveError, appReceiveSuccess, onCreateScreenSuccess]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onDeleteScreens, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onDeleteScreens',
        );
        // Action to add screen data
        if (success) {
          if (data.meeting_id == currentMeetingId) {
            // appReceiveSuccess(message);
            onDeleteScreenSuccess(data);
            getQuestionNumberHandler();
          }
        } else {
          appReceiveError(message);
        }
      },
      error: error => {},
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    appReceiveError,
    appReceiveSuccess,
    getQuestionNumberHandler,
    onDeleteScreenSuccess,
  ]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onLoggedInUsers, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, allJoinUsers } = responseWrapper(
          value,
          'onLoggedInUsers',
        );

        // Action to add screen data
        if (
          success &&
          data &&
          data.meeting_id.toString() === currentMeetingId.toString()
        ) {
          const { isAdd } = data;
          let existingJoinedUser = JSON.parse(
            getSecureSessionData('Attendees'),
          );
          existingJoinedUser =
            existingJoinedUser &&
            Array.isArray(existingJoinedUser) &&
            existingJoinedUser.length
              ? existingJoinedUser
              : [];
          if (isAdd) {
            existingJoinedUser = [
              ...existingJoinedUser.filter(
                e => e.userData.id !== data.userData.id,
              ),
              data,
            ];
          } else {
            existingJoinedUser = [
              ...existingJoinedUser.filter(
                e => e.userData.id !== data.userData.id,
              ),
            ];
          }
          const usrId = getSecureSessionData('userId');

          if (getSecureSessionData('role') === 'PARTICIPANT') {
            const findData = allJoinUsers.find(e => e.user_id === usrId);
            if (
              findData &&
              findData.userData &&
              findData.userData.meetingGroupId
            ) {
              meetingGroupChat([findData.userData.meetingGroupId]); //set store in data
              setSecureSessionData(
                'meetingGroupIds',
                findData.userData.meetingGroupId.toString(),
              );
              setSecureSessionData(
                'meetingGroupIndex',
                findData.userData.meetingGroupIndex.toString(),
              );
            }
          }
          if (getSecureSessionData('role') === 'HOST') {
            const usrList = allJoinUsers.filter(e => e.user_id !== usrId);
            onGetAttendeesSuccess(usrList); //set in store
            setSecureSessionData('Attendees', JSON.stringify(usrList));
          }
          // onGetAttendeesSuccess(existingJoinedUser); //set in store
          // existingJoinedUser = JSON.stringify(existingJoinedUser);
          // setSecureSessionData('Attendees', existingJoinedUser);
        }
      },
      error: error => console.warn(error),
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [onGetAttendeesSuccess]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onLogoutUser, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data } = responseWrapper(value, 'onLogoutUser');
        // Action to add screen data
        if (success && data && data.meeting_id === currentMeetingId) {
          let existingJoinedUser = JSON.parse(
            getSecureSessionData('Attendees'),
          );
          existingJoinedUser =
            existingJoinedUser &&
            Array.isArray(existingJoinedUser) &&
            existingJoinedUser.length
              ? existingJoinedUser
              : [];

          existingJoinedUser = [
            ...existingJoinedUser.filter(e => e.userData.id !== data.user_id),
          ];
          onGetAttendeesSuccess(existingJoinedUser); //set in store
          existingJoinedUser = JSON.stringify(existingJoinedUser);
          setSecureSessionData('Attendees', existingJoinedUser);
        }
      },

      error: error => console.warn(error),
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [onGetAttendeesSuccess]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateQuestionOrders, {
        meeting_id: currentMeetingId,
      }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data } = responseWrapper(
          value,
          'onUpdateQuestionOrders',
        );
        // Action to add screen data
        if (success) {
          onUpdateQuestionOrdersuccess(data);
          getQuestionNumberHandler();
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getQuestionNumberHandler, onUpdateQuestionOrdersuccess]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onDeleteQuestionByScreen, {
        meeting_id: currentMeetingId,
      }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onDeleteQuestionByScreen',
        );
        // // Action to add screen data
        if (success) {
          if (data.meeting_id == currentMeetingId) {
            onDeleteQuestionSuccess(data);
            getQuestionNumberHandler();
            // appReceiveSuccess(message);
          }
        } else {
          appReceiveError(message);
        }
      },
      error: error => {
        const {
          data: { meeting_id },
          message,
        } = error;
        if (meeting_id == currentMeetingId) appReceiveError(message);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onScreenLayout, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onScreenLayout',
        );
        // // Action to screen layout data
        if (success) {
          const screenJson = JSON.parse(getSecureSessionData('selectedScreen'));

          const screenJsonId =
            screenJson !== null ? screenJson.id : selectedScreen.id;
          if (screenJsonId.toString() === data.screen_id.toString()) {
            // add condition to compare screen id
            onGetLayoutSuccess(data.layout);
          }
        } else {
          appReceiveError(message);
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedScreen]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onChangeCardSize, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onChangeCardSize',
        );
        // // Action to add screen data
        if (success) {
          onGetCardResizeSuccess(data);
        } else {
          appReceiveError(message);
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appReceiveError, onGetCardResizeSuccess]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onStartStopMeeting, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data } = responseWrapper(value, 'onStartStopMeeting');
        // Action to add screen data
        if (success) {
          let meetingData = JSON.parse(getSecureSessionData('meetData'));
          let userData = JSON.parse(getSecureSessionData('UserData'));
          if (
            meetingData.meetingData.id == data.id &&
            userData.meetingData.id == data.id
          ) {
            setSecureSessionData('isStartMeeting', !isStart.toString());
            delete meetingData.meetingData;
            delete userData.meetingData;
            meetingData = { ...meetingData, meetingData: data };
            userData = {
              ...userData,
              isWait:
                getSecureSessionData('role') === 'OBSERVER' && data.is_started
                  ? true
                  : false,
              meetingData: data,
            };
            setSecureSessionData(
              'isStartMeeting',
              userData.meetingData.is_started.toString(),
            );
            setSecureSessionData('meetData', JSON.stringify(meetingData));
            setSecureSessionData('UserData', JSON.stringify(userData));
          }
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isStart]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onSetSelectedScreen, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data } = responseWrapper(value, 'onSetSelectedScreen');
        // Action to add screen data
        if (
          success &&
          data.meeting_id.toString() == currentMeetingId.toString()
        ) {
          setSecureSessionData('selectedScreen', JSON.stringify(data));
          onUpdateSelectedScreenSuccess(data);
        }
        // if (screens && screens.length) {
        //   selectCard(response);
        // }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onUpdateSelectedScreenSuccess]);
  // Subscription End

  useEffect(() => {
    if (getSecureSessionData('selectedScreen')) {
      const data = JSON.parse(getSecureSessionData('selectedScreen'));
      onUpdateSelectedScreenSuccess(data);
    }
  }, [onUpdateSelectedScreenSuccess]);

  return (
    <>
      {userRole === 'HOST' || userRole === 'ADMIN' ? (
        <>
          <HostDashboard userRole={userRole} />
        </>
      ) : userRole == 'PARTICIPANT' ? (
        <>
          <div>
            <ParticipantDashboard />
            {!open && (
              <div
                className="userDashboard dashboard participant expand-to-left wizardModal"
                style={{
                  backgroundImage: `url(${isSeramount ? seraLogo : EabLogo})`,
                }}
              >
                <WizardSpeaker
                  setOpen={setOpen}
                  isTopFifty={true}
                  getMuteStatusHandler={console.log('clicked')}
                />
              </div>
            )}
          </div>
        </>
      ) : userRole == 'MODERATOR' ? (
        <>
          <ModeratorUserDashboard key={compKey} />
          {!open && (
            <div
              className="userDashboard dashboard participant expand-to-left wizardModal"
              style={{
                backgroundImage: `url(${isSeramount ? seraLogo : EabLogo})`,
              }}
            >
              <WizardSpeaker
                setOpen={setOpen}
                isTopFifty={true}
                getMuteStatusHandler={console.log('clicked')}
              />
            </div>
          )}
        </>
      ) : userRole == 'OBSERVER' ? (
        <>
          <ObserverDashboard key={compKey} />
          {!open && (
            <div
              className="userDashboard dashboard participant expand-to-left wizardModal"
              style={{
                backgroundImage: `url(${isSeramount ? seraLogo : EabLogo})`,
              }}
            >
              <WizardSpeaker
                setOpen={setOpen}
                isTopFifty={true}
                getMuteStatusHandler={console.log('clicked')}
              />
            </div>
          )}
        </>
      ) : (
        <span>Unauthorized</span>
      )}
    </>
  );
};

Dashboard.propTypes = {
  host_ui: PropTypes.object.isRequired,
  chatArray: PropTypes.array,
  onCreateScreenSuccess: PropTypes.func,
  onCreateQuestionSuccess: PropTypes.func,
  onUpdateQuestionSuccess: PropTypes.func,
  onUpdateUserSuccess: PropTypes.func,
  onDeleteScreenSuccess: PropTypes.func,
  onGetQuickAnswerSuccess: PropTypes.func,
  onSubmitResponsesSuccess: PropTypes.func,
  onUpdateQuestionOrdersuccess: PropTypes.func,
  onGetAttendeesSuccess: PropTypes.func,
  getPermissionSuccess: PropTypes.func,
  setLockScreenSuccess: PropTypes.func,
  sendPublicChatSuccess: PropTypes.func,
  submitResponse: PropTypes.func,
  selected_screen: PropTypes.object,
  appReceiveError: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  onDeleteQuestionSuccess: PropTypes.func,
  onUpdateSelectedScreenSuccess: PropTypes.func,
  onGetCardResizeSuccess: PropTypes.func,
  onGetLayoutSuccess: PropTypes.func,
  onGetQuestionNumbersSuccess: PropTypes.func,
  updateNotes: PropTypes.func,
  onGetQuestionSuccess: PropTypes.func,
  meetingGroupChat: PropTypes.func,
  meetingGroupChatId: PropTypes.array,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI, app } = state;
  const { meetingGroupChatId } = hostUI;
  const {
    host_ui: { selected_screen },
  } = hostUI;
  return {
    host_ui: getHostUI(hostUI),
    selected_screen,
    chatArray: app.chatArray,
    meetingGroupChatId:
      meetingGroupChatId && meetingGroupChatId.map(e => Number(e)),
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    onCreateScreenSuccess: payload => dispatch(onCreateScreenSuccess(payload)),
    onDeleteScreenSuccess: payload => dispatch(onDeleteScreenSuccess(payload)),
    onGetAttendeesSuccess: payload => dispatch(onGetAttendeesSuccess(payload)),
    setLockScreenSuccess: payload => dispatch(setLockScreenSuccess(payload)),
    onUpdateQuestionOrdersuccess: payload =>
      dispatch(onUpdateQuestionOrdersuccess(payload)),
    onUpdateSelectedScreenSuccess: payload =>
      dispatch(onUpdateSelectedScreenSuccess(payload)),
    onUpdateQuestionSuccess: payload =>
      dispatch(onUpdateQuestionSuccess(payload)),
    onUpdateUserSuccess: payload => dispatch(onUpdateUserSuccess(payload)),
    onCreateQuestionSuccess: payload =>
      dispatch(onCreateQuestionSuccess(payload)),
    onGetQuickAnswerSuccess: payload =>
      dispatch(onGetQuickAnswerSuccess(payload)),
    onSubmitResponsesSuccess: payload =>
      dispatch(onSubmitResponsesSuccess(payload)),
    getPermissionSuccess: payload => dispatch(getPermissionSuccess(payload)),
    sendPublicChatSuccess: payload => dispatch(sendPublicChatSuccess(payload)),
    submitResponse: payload => dispatch(submitResponse(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    onDeleteQuestionSuccess: payload =>
      dispatch(onDeleteQuestionSuccess(payload)),
    onGetCardResizeSuccess: payload =>
      dispatch(onGetCardResizeSuccess(payload)),
    updateNotes: payload => dispatch(updateNotes(payload)),
    onGetQuestionNumbersSuccess: payload =>
      dispatch(onGetQuestionNumbersSuccess(payload)),
    onGetQuestionSuccess: payload => dispatch(onGetQuestionSuccess(payload)),
    onGetLayoutSuccess: payload => dispatch(onGetLayoutSuccess(payload)),
    meetingGroupChat: payload => dispatch(meetingGroupChat(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Dashboard);
