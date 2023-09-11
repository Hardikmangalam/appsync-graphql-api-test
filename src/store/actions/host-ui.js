export const HOST_UI = 'HOST_UI';
export const UPDATE_SCLAE_VIEW = 'UPDATE_SCLAE_VIEW';
export const UPDATE_NOTES = 'UPDATE_NOTES';

export const SCREEN_ADD_REQUEST = 'SCREEN_ADD_REQUEST';
export const SCREEN_ADD_SUCCESS = 'SCREEN_ADD_SUCCESS';
export const SCREEN_ADD_FAILED = 'SCREEN_ADD_FAILED';

export const GET_SCREEN_SUCCESS = 'GET_SCREEN_SUCCESS';
export const GET_SCREEN_FAILED = 'GET_SCREEN_FAILED';

export const DELETE_SCREEN_SUCCESS = 'DELETE_SCREEN_SUCCESS';
export const DELETE_SCREEN_FAILED = 'DELETE_SCREEN_FAILED';

export const DELETE_QUESTION_SUCCESS = 'DELETE_QUESTION_SUCCESS';
export const DELETE_QUESTION_FAILED = 'DELETE_QUESTION_FAILED';

export const GET_QUESTION_SUCCESS = 'GET_QUESTION_SUCCESS';
export const GET_QUESTION_FAILED = 'GET_QUESTION_FAILED';

export const QUESTION_ADD_SUCCESS = 'QUESTION_ADD_SUCCESS';
export const QUESTION_UPDATE_SUCCESS = 'QUESTION_UPDATE_SUCCESS';

export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS';

export const QUESTION_ORDER_SUCCESS = 'QUESTION_ORDER_SUCCESS';

export const GET_TEMPLATE_SUCCESS = 'GET_TEMPLATE_SUCCESS';

export const GET_QUESTION_BANK_SUCCESS = 'GET_QUESTION_BANK_SUCCESS';

export const UPDATE_SELECTED_SCREEN_SUCCESS = 'UPDATE_SELECTED_SCREEN_SUCCESS';
export const SUBMIT_RESPONSE_SUCCESS = 'SUBMIT_RESPONSE_SUCCESS';

export const GET_ATTENDEES_SUCCESS = 'GET_ATTENDEES_SUCCESS';

export const GET_QUICK_ANSWER_SUCCESS = 'GET_QUICK_ANSWER_SUCCESS';

export const GET_CARD_RESIZE_SUCCESS = 'GET_CARD_RESIZE_SUCCESS';

export const GET_SUBMIT_RESPONSE_SUCCESS = 'GET_SUBMIT_RESPONSE_SUCCESS';

export const GET_QUESTION_NUMBERS_SUCCESS = 'GET_QUESTION_NUMBERS_SUCCESS';
export const GET_QUESTION_NUMBERS_FAILED = 'GET_QUESTION_NUMBERS_FAILED';

export const UPDATE_RELOAD_CALL_TIMER_STATE = 'UPDATE_RELOAD_CALL_TIMER_STATE';
// export const START_MEETING_PART = 'START_MEETING_PART';

export const QUESTION_LAYOUT = 'QUESTION_LAYOUT';

export const GET_LAYOUT_SUCCESS = 'GET_LAYOUT_SUCCESS';

export const GET_TWILIO_NUMBER = 'GET_TWILIO_NUMBER';

export const MANAGE_COOKIE = 'MANAGE_COOKIE';

export const GROUP_CHAT = 'GROUP_CHAT';

export const GROUP_CHAT_INDEX = 'GROUP_CHAT_INDEX';

export const setHostUI = payload => ({
  type: HOST_UI,
  payload,
});

export const changeScaleView = payload => ({
  type: UPDATE_SCLAE_VIEW,
  payload,
});

export const updateNotes = payload => ({
  type: UPDATE_NOTES,
  payload,
});

// export const onStartParticipantMeeting = payload => ({
//   type: START_MEETING_PART,
//   payload,
// });

export const onCreateScreenSuccess = payload => ({
  type: SCREEN_ADD_SUCCESS,
  payload,
});

export const onCreateScreenRequest = payload => ({
  type: SCREEN_ADD_REQUEST,
  payload,
});

export const onGetScreenSuccess = payload => {
  return {
    type: GET_SCREEN_SUCCESS,
    payload,
  };
};

export const onGetScreenFailed = payload => ({
  type: GET_SCREEN_FAILED,
  payload: [],
});

export const onDeleteScreenSuccess = payload => {
  return {
    type: DELETE_SCREEN_SUCCESS,
    payload,
  };
};

export const onDeleteQuestionSuccess = payload => {
  return {
    type: DELETE_QUESTION_SUCCESS,
    payload,
  };
};

export const onCreateQuestionSuccess = payload => {
  return {
    type: QUESTION_ADD_SUCCESS,
    payload,
  };
};

export const onUpdateQuestionSuccess = payload => {
  return {
    type: QUESTION_UPDATE_SUCCESS,
    payload,
  };
};

export const onUpdateUserSuccess = payload => {
  return {
    type: UPDATE_USER_SUCCESS,
    payload,
  };
};

export const onUpdateQuestionOrdersuccess = payload => {
  return {
    type: QUESTION_ORDER_SUCCESS,
    payload,
  };
};

export const onGetQuestionSuccess = payload => {
  return {
    type: GET_QUESTION_SUCCESS,
    payload,
  };
};

export const onGetQuestionFailed = payload => ({
  type: GET_QUESTION_FAILED,
  payload: [],
});

export const onGetQuestionNumbersSuccess = payload => {
  return {
    type: GET_QUESTION_NUMBERS_SUCCESS,
    payload,
  };
};

export const onGetQuestionNumbersFailed = payload => ({
  type: GET_QUESTION_NUMBERS_FAILED,
  payload: [],
});

export const getTemplateSuccess = payload => {
  return {
    type: GET_TEMPLATE_SUCCESS,
    payload,
  };
};

export const onGetQuestionBankSuccess = payload => {
  return {
    type: GET_QUESTION_BANK_SUCCESS,
    payload,
  };
};
export const onSubmitResponsesSuccess = payload => {
  return {
    type: SUBMIT_RESPONSE_SUCCESS,
    payload,
  };
};

export const onUpdateSelectedScreenSuccess = payload => {
  return {
    type: UPDATE_SELECTED_SCREEN_SUCCESS,
    payload,
  };
};

export const onGetAttendeesSuccess = payload => {
  return {
    type: GET_ATTENDEES_SUCCESS,
    payload,
  };
};

export const onGetQuickAnswerSuccess = payload => {
  return {
    type: GET_QUICK_ANSWER_SUCCESS,
    payload,
  };
};

export const onGetCardResizeSuccess = payload => {
  return {
    type: GET_CARD_RESIZE_SUCCESS,
    payload,
  };
};
export const onGetLayoutSuccess = payload => {
  return {
    type: GET_LAYOUT_SUCCESS,
    payload,
  };
};
export const onGetTwilioNumberSuccess = payload => {
  return {
    type: GET_TWILIO_NUMBER,
    payload,
  };
};

export const submitResponse = payload => {
  return {
    type: GET_SUBMIT_RESPONSE_SUCCESS,
    payload,
  };
};

export const updateReloadCallTimerState = payload => {
  return {
    type: UPDATE_RELOAD_CALL_TIMER_STATE,
    payload,
  };
};

export const onGetQuestionLayout = payload => {
  return {
    type: QUESTION_LAYOUT,
    payload,
  };
};

export const manageCookie = payload => {
  return {
    type: MANAGE_COOKIE,
    payload,
  };
};

export const meetingGroupChat = payload => {
  return {
    type: GROUP_CHAT,
    payload,
  };
};
export const meetingGroupChatIndex = payload => {
  return {
    type: GROUP_CHAT_INDEX,
    payload,
  };
};
