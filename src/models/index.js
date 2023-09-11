// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { responseType, responseTypeMeetingId, screenType } = initSchema(schema);

export {
  responseType,
  responseTypeMeetingId,
  screenType
};