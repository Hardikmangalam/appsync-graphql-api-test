const responseWrapper = (response, key) => {
  const errorCodes = [400, 401, 403, 404, 500, 501];
  try {
    const statusCode = JSON.parse(response.data[key].statusCode);
    const res = JSON.parse(response.data[key].body);
    if (errorCodes.includes(statusCode)) throw res;
    return res;
  } catch (error) {
    return { ...error, success: false };
    // console.log('Error from API >>', error);
    // // const pathName = window.location.origin;
    // // const hrefURL = pathName + '/';
    // // if (
    // //   error.message === 'jwt malformed' &&
    // //   getSecureSessionData('referrerUrl') &&
    // //   getSecureSessionData('referrerUrl') !== hrefURL
    // // ) {
    // //   window.location.replace(
    // //     `${getSecureSessionData('referrerUrl')}admin/templates`,
    // //   );
    // //   return;
    // // }
    // throw error;
  }
};

export default responseWrapper;
