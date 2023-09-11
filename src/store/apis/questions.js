import restApiClient from './index';

export const saveQuestion = (data) =>
  restApiClient.post(`/screen/question`, data);
