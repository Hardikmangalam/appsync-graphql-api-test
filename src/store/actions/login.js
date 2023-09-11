export const GET_MEETING_REQUEST = 'GET_MEETING_REQUEST';
export const GET_MEETING_SUCCESS = 'GET_MEETING_SUCCESS';
export const GET_MEETING_FAILED = 'GET_MEETING_FAILED';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILED = 'LOGIN_FAILED';

export const GET_PERMISSION_REQUEST = 'GET_PERMISSION_REQUEST';
export const GET_PERMISSION_SUCCESS = 'GET_PERMISSION_SUCCESS';
export const GET_PERMISSION_FAILED = 'GET_PERMISSION_FAILED';

export const getMeetingRequest = payload => ({
  type: GET_MEETING_REQUEST,
  payload,
});
export const getMeetingSuccess = payload => ({
  type: GET_MEETING_SUCCESS,
  payload,
});

export const getMeeetingFailed = error => ({
  type: GET_MEETING_FAILED,
  payload: error,
});

export const loginRequest = payload => ({
  type: LOGIN_REQUEST,
  payload,
});

export const loginSuccess = payload => ({
  type: LOGIN_SUCCESS,
  payload,
});
export const loginFailed = error => ({
  type: LOGIN_FAILED,
  payload: error,
});

export const getPermissionRequest = payload => ({
  type: GET_PERMISSION_REQUEST,
  payload,
});
export const getPermissionSuccess = payload => ({
  type: GET_PERMISSION_SUCCESS,
  payload,
});

export const getPermissionFailed = error => ({
  type: GET_PERMISSION_FAILED,
  payload: error,
});
