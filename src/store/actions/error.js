export const RECEIVE_ALERT = 'RECEIVE_ALERT';
export const RECEIVE_SUCCESS = 'RECEIVE_SUCCESS';
export const RECEIVE_ERROR = 'RECEIVE_ERROR';

export const appReceiveAlert = payload => ({
  type: RECEIVE_ALERT,
  payload,
});

export const appReceiveError = payload => ({
  type: RECEIVE_ERROR,
  payload,
});

export const appReceiveSuccess = payload => ({
  type: RECEIVE_SUCCESS,
  payload,
});
