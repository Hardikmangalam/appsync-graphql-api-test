import { API, graphqlOperation } from 'aws-amplify';
import {
  getPermissions,
  getAllLoggedInUsers,
  userWaitlist,
} from '../graphql/queries';
import { updateUserWaitlist, logoutUser } from '../graphql/mutations';
import { changeUserPermission } from '../graphql/mutations';
import responseWrapper from './responseWrapper';

const getPermissionsHandler = async () => {
  try {
    const response = await API.graphql(graphqlOperation(getPermissions));
    const { data, message, success } = await responseWrapper(
      response,
      'getPermissions',
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

const changeUserPermissionHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(changeUserPermission, payload),
    );
    const { data, message, success } = await responseWrapper(
      response,
      'changeUserPermission',
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

const getAllLoggedInUserHandler = async () => {
  try {
    const response = await API.graphql(graphqlOperation(getAllLoggedInUsers));
    const { data, message, success } = await responseWrapper(
      response,
      'getAllLoggedInUsers',
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

const getWaitListUserHandler = async () => {
  try {
    const response = await API.graphql(graphqlOperation(userWaitlist));
    const { data, message, success } = await responseWrapper(
      response,
      'userWaitlist',
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

const userWaitlistHandler = async payload => {
  try {
    const response = await API.graphql(
      graphqlOperation(updateUserWaitlist, payload),
    );
    const { data, message, success } = responseWrapper(
      response,
      'updateUserWaitlist',
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
const getlogoutUser = async payload => {
  try {
    const response = await API.graphql(graphqlOperation(logoutUser, payload));
    const { data, message, success } = responseWrapper(response, 'logoutUser');
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
  getPermissionsHandler,
  changeUserPermissionHandler,
  getAllLoggedInUserHandler,
  getWaitListUserHandler,
  userWaitlistHandler,
  getlogoutUser,
};
