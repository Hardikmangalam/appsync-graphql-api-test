import * as actions from '../actions/questions';

const initialState = {
  questions: [],
  fetching: false,
  error: '',
};
const questions = (state = initialState, action) => {
  switch (action.type) {
    case actions.ADD_QUESTION_REQUEST:
      return { ...state, fetching: true };
    case actions.ADD_QUESTION_SUCCESS:
      return { ...state, questions: action.payload, fetching: false };
    case actions.ADD_QUESTION_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        questions: [],
      };
    default:
      return state;
  }
};

export default questions;

// export const getIsMeetingFetching = state => state.fetching;
export const postQuestion = state => state.questions;
