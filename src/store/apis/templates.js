import restApiClient from './index';

export const fetchTemplates = () => restApiClient.get(`/template/list`);
