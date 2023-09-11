import * as actions from '../actions/login';

const initialState = {
  meetings: {
    meetingData: {
      isExpired: false,
      isValid: false,
      isWaiting: false,
    },
    fetching: false,
  },
  loginData: {
    userData: {
      id: 5,
      full_name: '',
      email: '',
      role_id: 4,
    },
    token: '',
    user_id: '',
    meetingData: {},
    isAuth: false,
  },
  permissions: [],
};
const logIn = (state = initialState, action) => {
  switch (action.type) {
    case actions.GET_MEETING_REQUEST:
      return {
        ...state,
        meetings: {
          fetching: true,
          meetingData: { isExpired: false, isValid: false, isWaiting: false },
        },
      };
    case actions.GET_MEETING_SUCCESS:
      return {
        ...state,
        meetings: { meetingData: action.payload, fetching: false },
      };
    case actions.GET_MEETING_FAILED:
      return {
        ...state,
        meetings: {
          fetching: false,
          error: action.payload,
          meetingData: { isExpired: false, isValid: false, isWaiting: false },
        },
      };
    case actions.LOGIN_REQUEST:
      return { ...state, fetching: true, isAuth: false };
    case actions.LOGIN_SUCCESS:
      return {
        ...state,
        loginData: action.payload,
        fetching: false,
        isAuth: true,
      };
    case actions.LOGIN_FAILED:
      return { ...state, isAuth: false, fetching: false };

    case actions.GET_PERMISSION_REQUEST:
      return {
        ...state,
        permissions: [],
      };
    case actions.GET_PERMISSION_SUCCESS:
      return {
        ...state,
        permissions: action.payload,
      };
    case actions.GET_PERMISSION_FAILED:
      return {
        ...state,
        permissions: [],
      };

    default:
      return state;
  }
};

export default logIn;

export const getMeetings = state => state.meetings;
export const loginData = state => state.loginData;
