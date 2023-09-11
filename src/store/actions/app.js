export const APP_START_FETCHING = 'APP_START_FETCHING';
export const APP_STOP_FETCHING = 'APP_STOP_FETCHING';

export const MEETINGS_LIST_REQUEST = 'MEETINGS_LIST_REQUEST';
export const MEETINGS_LIST_SUCCESS = 'MEETINGS_LIST_SUCCESS';
export const MEETINGS_LIST_FAILED = 'MEETINGS_LIST_FAILED';
export const LOCK_SCREEN_SUCCESS = 'LOCK_SCREEN_SUCCESS';

export const PUBLIC_CHAT_SUCCESS = 'PUBLIC_CHAT_SUCCESS';

export const GET_PUBLIC_CHAT_SUCCESS = 'GET_PUBLIC_CHAT_SUCCESS';

export const appStartFetching = () => ({
  type: APP_START_FETCHING,
});

export const appStopFetching = () => ({
  type: APP_STOP_FETCHING,
});

export const meetingsRequest = payload => ({
  type: MEETINGS_LIST_REQUEST,
  payload,
});

export const meetingsSuccess = payload => ({
  type: MEETINGS_LIST_SUCCESS,
  payload,
});

export const meetingsFailed = error => ({
  type: MEETINGS_LIST_FAILED,
  payload: error,
});

export const setLockScreenSuccess = payload => ({
  type: LOCK_SCREEN_SUCCESS,
  payload,
});

export const sendPublicChatSuccess = payload => ({
  type: PUBLIC_CHAT_SUCCESS,
  payload,
});

export const getPublicChatSuccess = payload => ({
  type: GET_PUBLIC_CHAT_SUCCESS,
  payload,
});
