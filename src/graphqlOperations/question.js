import { API, graphqlOperation } from 'aws-amplify';
import {
  deleteQuestionByScreen,
  createQuestionByScreen,
  updateQuestionByScreen,
  updateQuestionOrders,
  saveToQuestionBank,
  submitResponses,
  broadcastQuestionResult,
  updateQuestionNumber,
} from '../graphql/mutations';
import {
  getQuestionsByScreen,
  getQuestionsFromBank,
  getQuestionNumber,
  getScreenLayout,
} from '../graphql/queries';
import responseWrapper from './responseWrapper';

const getQuestionHandler = async payload => {
  if (payload.screen_id === null) return;
  try {
    const response = await API.graphql(
      graphqlOperation(getQuestionsByScreen, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'getQuestionsByScreen',
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

const getTemplateDataHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(getQuestionsFromBank, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'getQuestionsFromBank',
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

const deleteQuestionHandler = async payload => {
  try {
    await API.graphql(graphqlOperation(deleteQuestionByScreen, payload));
    return {
      success: true,
      data: payload,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const createQuestionHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(createQuestionByScreen, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'createQuestionByScreen',
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

const saveQuestionBankHandler = async payload => {
  try {
    await API.graphql(graphqlOperation(saveToQuestionBank, { input: payload }));
    return {
      success: true,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const saveQuestionResponseHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(submitResponses, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'submitResponses',
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

const updateQuestionHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(updateQuestionByScreen, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'updateQuestionByScreen',
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

const updateQuestionOrderHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(updateQuestionOrders, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'updateQuestionOrders',
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

const broadcastQuestionHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(broadcastQuestionResult, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'broadcastQuestionResult',
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

const getQuestionNumbersHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(getQuestionNumber, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'getQuestionNumber',
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

const getScreenLayoutHandler = async payload => {
  if (payload.screen_id === null) return;
  try {
    const response = await API.graphql(
      graphqlOperation(getScreenLayout, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'getScreenLayout',
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

const updateQuestionNumberHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(updateQuestionNumber, { input: payload }),
    );
    const { data, message } = responseWrapper(response, 'UpdateQuestionNumber');
    return {
      success: true,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

export default {
  getQuestionHandler,
  deleteQuestionHandler,
  createQuestionHandler,
  updateQuestionHandler,
  updateQuestionOrderHandler,
  saveQuestionBankHandler,
  getTemplateDataHandler,
  saveQuestionResponseHandler,
  broadcastQuestionHandler,
  getQuestionNumbersHandler,
  getScreenLayoutHandler,
  updateQuestionNumberHandler,
};
