import * as actions from '../actions/templates';

const initialState = {
  templates: [],
  fetching: false,
  error: '',
};
const templates = (state = initialState, action) => {
  switch (action.type) {
    case actions.TEMPLATES_REQUEST:
      return { ...state, fetching: true };
    case actions.TEMPLATES_SUCCESS:
      return { ...state, templates: action.payload, fetching: false };
    case actions.TEMPLATES_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        templates: [],
      };
    default:
      return state;
  }
};

export default templates;

export const getIsMeetingFetching = state => state.fetching;
export const getTemplate = state => state.templates;
