export const PROTOCOL = process.env.REACT_APP_API_PROTOCOL;
export const DOMAIN = process.env.REACT_APP_API_DOMAIN;

export default {
  API: {
    URL: `${PROTOCOL}://${DOMAIN}`,
  },
};
