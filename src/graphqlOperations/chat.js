import { API, graphqlOperation } from 'aws-amplify';
import { quickAnswer, sendPublicChat } from '../graphql/mutations';
import { getPublicChat } from '../graphql/queries';
import responseWrapper from './responseWrapper';

const getQuickAnswerHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(quickAnswer, { input: payload }),
    );
    const { data, message, success } = responseWrapper(response, 'quickAnswer');
    return {
      success,
      message,
      data,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const sendPublicChatHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(sendPublicChat, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'sendPublicChat',
    );
    return {
      success,
      message,
      data,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const getPublicChatHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(getPublicChat, { meeting_id: payload }),
    );
    const { data, message, success } = await responseWrapper(
      response,
      'getPublicChat',
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
  getQuickAnswerHandler,
  sendPublicChatHandler,
  getPublicChatHandler,
};
