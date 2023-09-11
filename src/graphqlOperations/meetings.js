import { API, graphqlOperation } from 'aws-amplify';
import {
  loginOrSignUp,
  loggedInUsers,
  useTemplateInSession,
  deleteTemplate,
  editTemplate,
  changeCardSize,
  startStopMeeting,
  createToken_twilio,
  screenLayout,
  setMuteStatus,
  getMuteStatus,
  getTwilioNumber,
  updateObserverUser,
} from '../graphql/mutations';
import {
  checkValidMeeting,
  listAvailableNumber,
  loadTemplate,
} from '../graphql/queries';
import responseWrapper from './responseWrapper';
import { createBrowserHistory } from 'history';
import { setSecureSessionData } from './encryprWrapper';

const getMeetingHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(checkValidMeeting, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'checkValidMeeting',
    );
    // Action to set screen list data

    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const loginHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(loginOrSignUp, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'loginOrSignUp',
    );

    return {
      success,
      data,
      message,
    };
  } catch (err) {
    const history = createBrowserHistory({ forceRefresh: true });
    alert(err.message);
    history.replace('/login');
    return { success: false, message: err.message || err };
  }
};

const informHostHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(loggedInUsers, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'loggedInUsers',
    );
    if (data && data.userData) {
      const { meetingGroupId, meetingGroupIndex } =
        data && data.userData && data.userData;
      setSecureSessionData(
        'meetingGroupIds',
        meetingGroupId && meetingGroupId.toString(),
      );
      setSecureSessionData(
        'meetingGroupIndex',
        meetingGroupIndex && meetingGroupIndex.toString(),
      );
    }
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const updateObserverUserHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(updateObserverUser, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'updateObserverUser',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const loadTemplateHandler = async payload => {
  try {
    const response = await API.graphql(graphqlOperation(loadTemplate, payload));
    const { data, message, success } = responseWrapper(
      response,
      'loadTemplate',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const useTemplateInSessionHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(useTemplateInSession, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'useTemplateInSession',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const deleteTemplateHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(deleteTemplate, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'deleteTemplate',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const editTemplateHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(editTemplate, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'editTemplate',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const changeCardSizeHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(changeCardSize, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'changeCardSize',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};
const changeScreenLayout = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(screenLayout, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'screenLayout',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const startstopMeetingHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(startStopMeeting, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'startStopMeeting',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const createTwilioToken = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(createToken_twilio, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'createToken_twilio',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const setMuteStatusHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(setMuteStatus, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'setMuteStatus',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const getMuteStatusHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(getMuteStatus, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'getMuteStatus',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};
const getTwilioNumberHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(getTwilioNumber, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'getTwilioNumber',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const getListAvailableNumberHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(listAvailableNumber, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'listAvailableNumber',
    );
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

export default {
  getMeetingHandler,
  loginHandler,
  informHostHandler,
  loadTemplateHandler,
  useTemplateInSessionHandler,
  deleteTemplateHandler,
  editTemplateHandler,
  changeCardSizeHandler,
  changeScreenLayout,
  startstopMeetingHandler,
  createTwilioToken,
  setMuteStatusHandler,
  getMuteStatusHandler,
  getTwilioNumberHandler,
  updateObserverUserHandler,
  getListAvailableNumberHandler,
};
