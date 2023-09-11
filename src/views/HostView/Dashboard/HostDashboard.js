import React, { useEffect, useState } from 'react';
import Broadcast from './Broadcast';
import DashboardHeader from './DashboardHeader';
import RightSidebar from './RightSidebar';
// import QuestionCard from './QuestionCard';
// import zoomInIcon from '../../../assets/images/zoom-in.svg';
// import zoomOutIcon from '../../../assets/images/zoom-out.svg';
// import maximizeIcon from '../../../assets/images/maximize.svg';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import injectReducer from '../../../utils/injectReducer';
import { questionGQL, userGQL } from '../../../graphqlOperations';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import EABImage from '../../../assets/images/EABbrand.svg';
import seramountImage from '../../../assets/images/EABseramount.svg';
import {
  onCreateScreenSuccess,
  onGetQuestionSuccess,
  onGetAttendeesSuccess,
  onSubmitResponsesSuccess,
  onGetQuestionNumbersSuccess,
  onUpdateUserSuccess,
} from '../../../store/actions/host-ui';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../store/actions/error';
import { API, graphqlOperation } from 'aws-amplify';
import {
  onSubmitResponses,
  onLoginOrSignUp,
} from '../../../graphql/subscriptions';
import responseWrapper from '../../../graphqlOperations/responseWrapper';
import StackQuestionCard from './StackQuestionCard';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

const meetingName = JSON.parse(getSecureSessionData('UserData'));
const brandLogs = JSON.parse(getSecureSessionData('branding'));

let currentMeetingId = null;
if (meetingName !== null && Object.keys(meetingName).length) {
  const {
    meetingData: { id },
  } = meetingName;
  currentMeetingId = Number(id);
}

const HostDashboard = ({
  host_ui,
  onGetQuestionSuccess,
  onSubmitResponsesSuccess,
  onGetAttendeesSuccess,
  onUpdateUserSuccess,
  userRole,
  onGetQuestionNumbersSuccess,
  appReceiveSuccess,
  appReceiveError,
}) => {
  const [update, setUpdate] = useState(false);
  async function getQuestionHandler(item) {
    setUpdate(true);
    try {
      let screenId = (item && item.id) || null;

      if (!screenId) {
        let meetData = getSecureSessionData('meetData');
        meetData = meetData ? JSON.parse(meetData) : null;

        if (
          meetData &&
          meetData.meetingData &&
          meetData.meetingData.selectedscreen
        ) {
          screenId = meetData.meetingData.selectedscreen || -1;
        }
      }

      const payload = {
        screen_id: (item && item.id) || screenId,
      };
      const { success, data, message } = await questionGQL.getQuestionHandler(
        payload,
      );
      if (success) {
        onGetQuestionSuccess(data);
        if (data && data.length) {
          let broadCastQuestionIds = data.filter(e => e.is_broadcast);
          broadCastQuestionIds = broadCastQuestionIds.length
            ? broadCastQuestionIds.map(e => e.id)
            : [];

          setSecureSessionData(
            'broadcast_questions',
            JSON.stringify(broadCastQuestionIds),
          );
        }
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function getQuestionNumberHandler() {
    try {
      let templateMeetId = null;

      if (['true', true].includes(getSecureSessionData('templateView'))) {
        let screenData = getSecureSessionData('selectedScreen');
        screenData = screenData ? JSON.parse(screenData) : null;

        if (screenData && screenData.meeting_id) {
          templateMeetId = screenData.meeting_id;
        }
      }
      const payload = {
        meetingId: ['true', true].includes(getSecureSessionData('templateView'))
          ? templateMeetId
          : currentMeetingId,
        templateView: ['true', true].includes(
          getSecureSessionData('templateView'),
        ),
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

  async function getAllLoggedInUserHandler() {
    try {
      const {
        success,
        message,
        data,
      } = await userGQL.getAllLoggedInUserHandler();
      if (success) {
        if (currentMeetingId == data.meeting_id) {
          onGetAttendeesSuccess(data.loggedInUsers); //set in store
          setSecureSessionData('Attendees', JSON.stringify(data.loggedInUsers));
        }
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function getWaitListUserHandler() {
    try {
      const { success, message, data } = await userGQL.getWaitListUserHandler();
      if (success) {
        setSecureSessionData('Waitlist', JSON.stringify(data));
        onUpdateUserSuccess(data);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    // setScreenName(host_ui.selected_screen.name);
    if (host_ui && host_ui.selected_screen && host_ui.selected_screen.id) {
      const getQuestionAPIs = async () => {
        await getQuestionHandler(host_ui && host_ui.selected_screen);
        await getQuestionNumberHandler();
      };
      getQuestionAPIs();
    }
  }, [host_ui.selected_screen.id]);

  // const handleScroll = e => {
  //   window.scrollTo({ left: 0, behavior: 'smooth' });
  // };
  // useEffect(() => {
  //   console.log('scrollTop');

  //   if (host_ui.selected_screen) {
  //     console.log('handleScroll');
  //     handleScroll();
  //   }
  // }, [host_ui.selected_screen]);

  useEffect(() => {
    if (
      !getSecureSessionData('templateView') &&
      getSecureSessionData('role') !== 'Admin'
    ) {
      setTimeout(() => {
        getAllLoggedInUserHandler();
      }, 2000);
    }
  }, []);

  useEffect(() => {
    if (
      !getSecureSessionData('templateView') &&
      getSecureSessionData('role') !== 'Admin'
    ) {
      getWaitListUserHandler();
    }
  }, []);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onSubmitResponses, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ value }) => {
        const { success, data } = responseWrapper(value, 'onSubmitResponses');

        if (success) {
          onSubmitResponsesSuccess(data[0]);

          if (
            ['HOST', 'ADMIN', 'MODERATOR', 'OBSERVER'].includes(userRole) &&
            host_ui &&
            host_ui.selected_screen &&
            host_ui.selected_screen.id
          ) {
            getQuestionHandler(host_ui && host_ui.selected_screen);
          }
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [host_ui.selected_screen.id]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onLoginOrSignUp, {
        meeting_id: currentMeetingId,
      }),
    ).subscribe({
      next: async ({ value }) => {
        const { success, data } = responseWrapper(value, 'onLoginOrSignUp');

        if (success) {
          if (data && data.userData && data.userData.role_name === 'OBSERVER') {
            await getWaitListUserHandler();
          }
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {!getSecureSessionData('isNewTemplate') &&
        getSecureSessionData('role') !== 'Admin' && (
          <>
            <Broadcast />
            <RightSidebar userRole={userRole} />
          </>
        )}
      <div
        className={
          getSecureSessionData('templateView') === 'false' ||
          getSecureSessionData('templateView') === null
            ? 'dashboard'
            : 'dashboard host-sidebar_temp'
        }
        style={{
          overflow: 'hidden',
          backgroundImage: `url(${
            brandLogs === null
              ? seramountImage
              : brandLogs && brandLogs !== null && brandLogs === true
              ? seramountImage
              : EABImage
          })`,
        }}
      >
        <DashboardHeader />
        <div className="dashboard-wrapper">
          <StackQuestionCard update={update} setUpdate={setUpdate} />

          {/*   <div className="dashboard-footer__right">
            <Button variant="white" className="btn-icon ms-auto">
              <Image src={maximizeIcon} alt="Add" width={24} />
            </Button>
            <Button variant="white" className="btn-icon ms-3">
              <Image src={zoomOutIcon} alt="Add" width={24} />
            </Button>
            <Button variant="white" className="btn-icon ms-3">
              <Image src={zoomInIcon} alt="Add" width={24} />
            </Button>
          </div> */}
        </div>
      </div>
    </>
  );
};

HostDashboard.propTypes = {
  host_ui: PropTypes.object.isRequired,
  onCreateScreenSuccess: PropTypes.func,
  onGetQuestionSuccess: PropTypes.func,
  onGetAttendeesSuccess: PropTypes.func,
  onUpdateUserSuccess: PropTypes.func,
  onSubmitResponsesSuccess: PropTypes.func,
  onGetQuestionNumbersSuccess: PropTypes.func,
  userRole: PropTypes.string,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  return {
    host_ui: getHostUI(hostUI),
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    onCreateScreenSuccess: payload => dispatch(onCreateScreenSuccess(payload)),
    onGetQuestionSuccess: payload => dispatch(onGetQuestionSuccess(payload)),
    onGetAttendeesSuccess: payload => dispatch(onGetAttendeesSuccess(payload)),
    onUpdateUserSuccess: payload => dispatch(onUpdateUserSuccess(payload)),
    onGetQuestionNumbersSuccess: payload =>
      dispatch(onGetQuestionNumbersSuccess(payload)),
    onSubmitResponsesSuccess: payload =>
      dispatch(onSubmitResponsesSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(HostDashboard);
