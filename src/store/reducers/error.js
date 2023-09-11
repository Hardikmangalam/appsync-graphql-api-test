import * as actions from '../actions/error';

const initialState = {
  type: undefined,
  message: undefined,
};
const message = (state = initialState, action) => {
  switch (action.type) {
    case actions.RECEIVE_ALERT:
      return { ...state, type: 'alert', message: action.payload };
    case actions.RECEIVE_SUCCESS:
      return { ...state, type: 'success', message: action.payload };
    case actions.RECEIVE_ERROR:
      return { ...state, type: 'error', message: action.payload };
    default:
      return state;
  }
};

export default message;

export const getMessage = state => state.message;
