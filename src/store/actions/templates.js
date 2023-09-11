export const TEMPLATES_REQUEST = 'TEMPLATES_REQUEST';
export const TEMPLATES_SUCCESS = 'TEMPLATES_SUCCESS';
export const TEMPLATES_FAILED = 'TEMPLATES_FAILED';

export const templatesRequest = payload => ({
  type: TEMPLATES_REQUEST,
  payload,
});

export const templatesSuccess = payload => ({
  type: TEMPLATES_SUCCESS,
  payload,
});

export const templatesFailed = error => ({
  type: TEMPLATES_FAILED,
  payload: error,
});
