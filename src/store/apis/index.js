import axios from 'axios';
import { CONSTANT } from '../../enum';

const { API_URL } = CONSTANT;

// const request = async options => {
//   const updateOption = { ...options, withCredentials: true };
//   try {
//     const apiCall = await axios(updateOption);
//     return apiCall;
//   } catch (error) {
//     if (error.response.status == 403) {
//       const URL = `${API_URL}/users/logOut`;
//       axios
//         .delete(URL, {
//           withCredentials: true,
//         })
//         .then(() => {
//           // eslint-disable-next-line no-alert
//           alert('User is not authenticate');
//           setTimeout(() => {
//             localStorage.clear();
//             window.location.href = '/login';
//           }, 1000);
//         })
//         .catch(err => err);
//     }
//     return error.response;
//   }
// };
// export default request;

const createApiClient = baseURL =>
  axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'text/plain',
    },
  });

export default createApiClient(API_URL);
