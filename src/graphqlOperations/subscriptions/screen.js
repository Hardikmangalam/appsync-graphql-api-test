import { API, graphqlOperation } from 'aws-amplify';
import { onCreateScreens, onDeleteScreens } from '../../graphql/subscriptions';
import responseWrapper from '../responseWrapper';

const SUB_OnCreateScreens = async () => {
  try {
    let response = null;
    const subscription = await API.graphql(
      graphqlOperation(onCreateScreens),
    ).subscribe({
      next: ({ provider, value }) => {
        response = responseWrapper(value, 'onCreateScreens');

        // Action to add screen data
      },
      error: error => console.warn(error),
    });

    return { success: true, subscription, data: response.data };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

const SUB_OnDeleteScreens = async () => {
  try {
    let response = null;
    const subscription = await API.graphql(
      graphqlOperation(onDeleteScreens),
    ).subscribe({
      next: ({ provider, value }) => {
        response = responseWrapper(value, 'onDeleteScreens');
        // Action to delete screen data by id
      },
      error: error => console.warn(error),
    });

    return { success: true, subscription, data: response.data };
  } catch (err) {
    return { success: false, message: err.message || err };
  }
};

export default {
  SUB_OnCreateScreens,
  SUB_OnDeleteScreens,
};
