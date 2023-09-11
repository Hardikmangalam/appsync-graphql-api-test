import moment from 'moment';

export const getTimeZoneFormat = (startTime, endTime) => {
  const timeZone = moment.tz.guess();
  const time = new Date();

  const timeZoneOffset = time.getTimezoneOffset();

  const dateFormat = `${moment(startTime).format('L')}${', '}${moment(
    startTime,
  ).format('LT')}${'-'}${moment(endTime).format('LT')} ${moment.tz
    .zone(timeZone)
    .abbr(timeZoneOffset)}`;
  return dateFormat;
};

export const getTimeZoneFormatPreview = (startTime, endTime) => {
  const timeZone = moment.tz.guess();
  const time = new Date();

  const timeZoneOffset = time.getTimezoneOffset();

  const dateFormat = `${moment(startTime).format('LL')}${', '}${moment(
    startTime,
  ).format('h:mm a')}${' to '}${moment(endTime).format(
    'h:mm a',
  )} ${moment.tz.zone(timeZone).abbr(timeZoneOffset)}`;
  return dateFormat;
};

export const getTimeZoneFormatDashboard = (startTime, endTime) => {
  const timeZone = moment.tz.guess();
  const time = new Date();

  const timeZoneOffset = time.getTimezoneOffset();

  const dateFormat = `${moment(startTime).format(
    'dddd MMMM Do:',
  )}${' '}${moment(startTime).format('h:mm a')}${'-'}${moment(endTime).format(
    'h:mm a',
  )} ${moment.tz.zone(timeZone).abbr(timeZoneOffset)}`;
  return dateFormat;
};
