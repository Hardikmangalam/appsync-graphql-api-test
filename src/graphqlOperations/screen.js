import { API, graphqlOperation } from 'aws-amplify';
import { getScreens } from '../graphql/custom-queries';
import {
  createScreens,
  deleteScreens,
  createNote,
  createTemplate,
  setSelectedScreen,
  setLockScreen,
  validateAdminForTemplate,
  getSelectedScreen,
} from '../graphql/mutations';
import { getTemplateList } from '../graphql/queries';
import responseWrapper from './responseWrapper';

const getScreensHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(getScreens(payload.meeting_id), {
        input: payload,
      }),
    );
    const { data, message, success } = responseWrapper(response, 'getScreens');
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

const getSelectedScreenHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(getSelectedScreen, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'getSelectedScreen',
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

const createScreensHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(createScreens, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'createScreens',
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

const createTemplateHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(createTemplate, { input: payload }),
    );
    const { data, message, success } = responseWrapper(
      response,
      'createTemplate',
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

const validateAdminForTemplateHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(validateAdminForTemplate, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'validateAdminForTemplate',
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

const deleteScreensHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(deleteScreens, payload),
    );
    const { success, message } = responseWrapper(response, 'deleteScreens');
    return {
      success,
      data: payload,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const createNoteHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(createNote, { input: payload }),
    );
    const { data, message, success } = responseWrapper(response, 'createNote');
    return {
      success,
      data,
      message,
    };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const getTemplateHandler = async () => {
  try {
    const response = await API.graphql(graphqlOperation(getTemplateList));
    const { data, message, success } = responseWrapper(
      response,
      'getTemplateList',
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

const setSelectedScreenHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(setSelectedScreen, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'setSelectedScreen',
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

const setLoctScreenHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(setLockScreen, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'setLockScreen',
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
  getScreensHandler,
  createScreensHandler,
  deleteScreensHandler,
  createNoteHandler,
  getTemplateHandler,
  createTemplateHandler,
  setSelectedScreenHandler,
  setLoctScreenHandler,
  validateAdminForTemplateHandler,
  getSelectedScreenHandler,
};
