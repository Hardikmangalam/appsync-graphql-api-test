export const ADD_QUESTION_REQUEST = 'ADD_QUESTION_REQUEST';
export const ADD_QUESTION_SUCCESS = 'ADD_QUESTION_SUCCESS';
export const ADD_QUESTION_FAILED = 'ADD_QUESTION_FAILED';

export const addQuestionRequest = payload => ({
  type: ADD_QUESTION_REQUEST,
  payload,
});
export const addQuestionSuccess = payload => ({
  type: ADD_QUESTION_SUCCESS,
  payload,
});

export const addQuestionFailed = error => ({
  type: ADD_QUESTION_FAILED,
  payload: error,
});
