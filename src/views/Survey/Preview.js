/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-duplicates */
/* eslint-disable camelcase */
/* eslint-disable array-callback-return */
/* eslint-disable no-cond-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable indent */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Image, ProgressBar, Spinner } from 'react-bootstrap';
import { Link, useParams, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import leftArrow from '../../assets/images/left-arrow.svg';
import monitorIcon from '../../assets/images/monitor.svg';
import monitorBlueIcon from '../../assets/images/blue/monitor.svg';
import tabletIcon from '../../assets/images/tablet.svg';
import tabletBlueIcon from '../../assets/images/blue/tablet.svg';
import phoneIcon from '../../assets/images/phone.svg';
import phoneBlueIcon from '../../assets/images/blue/phone.svg';
import phoneLandscapeIcon from '../../assets/images/phone-landscape.svg';
import phoneLandscapeBlueIcon from '../../assets/images/blue/phone-landscape.svg';
import seramountBranding from '../../assets/images/EABseramount.svg';
import eabBranding from '../../assets/images/EABbrand.svg';
import ButtonWithHoverEffect from './ButtonWithHoverEffect';
import LockedHeader from './LockedHeader';
import injectSaga from '../../utils/injectSaga';
import injectReducer from '../../utils/injectReducer';
import {
  requestEmaildomain,
  requestGetMeetingsForSurvey,
  requestGetSurveyById,
  requestIcsFile,
  requestSurveyAnswer,
  requestSurveyEmailContent,
  resetLogic,
} from '../../store/actions/registrationForm';
import reducer, {
  getRegistrationForm,
  getSurveyMeetings,
  surveyAnswer,
  surveyName,
  apiMessage,
  apiSuccess,
  IcsFile,
  surveyEmailContentData,
  getDomainData,
} from '../../store/reducers/registrationForm';
import saga from '../../store/sagas/registrationForm';
import TextContent from './TextContent';
import QuickAnswer from './QuestionType/QuickAnswer';
import SingleChoiseOption from './QuestionType/SingleChoiseOption';
import EmailBody from './EmailBody';
import MultipleChoiseOption from './QuestionType/MultipleChoiseOption';
import CustomToaster from './CustomeToaster/index';
import MeetingDatesOption from './QuestionType/meetingDatesOption';
import { getTimeZoneFormatPreview } from './common/timezone';
import { RankOrder } from './QuestionOptionSection/RankOrder';
import FreeInputOption from './QuestionType/FreeInputOption';
import { setSecureSessionData } from '../../graphqlOperations/encryprWrapper';
// const { API_URL } = constant;
// const THANKS_CONTENT_FOR_DATE = `<p>Thank you for registering for the Employee Voice Session taking place on<strong> Date - Time - TimeZone.</strong> Your registration has been confirmed! Please use the link below to add the event to your calendar.<br /><span>Click here to download the Calendar Event Invite</span><br /><span>Please refer to the instructions below in order to access the session.</span><br /><br /><span><strong>**INSTRUCTIONS PLEASE READ**</strong></span><br /><br /><span>Click the link below to access the chat-room.<br /></span>|meetingLink|<br /> (Please note: <b><u><i>This link will only work in Chrome,Firefox, or Safari browsers.&nbsp;If the link does not load please try disconnecting from your company VPN and the navigation to the link again.</i></u></b>)<br /><br />If you are having any issues, please email support at: <strong><u>EVSsupport@seramount.com</u></strong><br /><br /> We look forward to your participation!<br /><br />Seramount Team</span></p>`;
let THANKS_CONTENT_FOR_DATE = `<p> <span class='heading-title'>Thank you for registering for the Employee Voice Session taking place on</span><strong><span> Date - Time - TimeZone.</span></strong><span class='heading-title><br />Add the session to your calendar.</span><br /><span><u>You can use the link below at the time of the session to join the room:</u></span><br /><br />MEETING_LINK<br /><strong><span>Helpful hints for accessing the session:</span></strong><br /><br /> &nbsp;&nbsp; <span class='heading-title'>1. This link will only work in Chrome, Firefox, Edge or Safari browsers.</span><br /> &nbsp;&nbsp; <span class='heading-title'>2. If the link does not load, try disconnecting from your company VPN and navigating to the link again.</span><br /><br />If you are having technical issues or have questions about the Employee Voice Session, please email support at <strong>EVSsupport@seramount.com</strong><br /><br /> We look forward to your participation,<br /><br /><strong><p>The BRANDING </p></strong></span></p>`;
let THANKS_CONTENT_FOR_WAITLIST = `<p>Thank you for letting us know about your availability.</p> <p>You have been added to the waitlist for this session.</p><p>We will reach out if there are any updates!</p><p>Regards,<br /><p><strong> The BRANDING Team</strong></p>`;

const Preview = props => {
  const [deviceType, setDeviceType] = useState('desktop');
  const [pages, setPages] = useState([]);
  const [pagesSurvayName, setPagesSurvayName] = useState(null);
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState();
  const [textInstructionArray, setTextInstructionArray] = useState([]);
  const [domainArray, setDomainArray] = useState([]);
  const [link, setLink] = useState('');

  const { id } = useParams();
  const query = useParams();
  const {
    registrationFormPages,
    surveyMeetings,
    surveyEmailContent,
    domainData,
  } = props;

  const [activeNext, setActiveNext] = useState(0);
  const [progress, setProgress] = useState(2);
  const [textInstructions, setTextInstructions] = useState('');
  const [meetingAnswerData, setMeetingAnswerData] = useState([]);
  const [meetingDateId, setMeetingDateId] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [tempData, setTempData] = useState({});
  const history = useHistory();
  const blockRef = useRef(null);
  const answers = [];
  const meetId = history.location.pathname;
  const meetid = meetId.split('_');
  const finalMeetidInit = meetid[meetid.length - 1];
  const [finalMeetid, setFinalMeetid] = useState(finalMeetidInit);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [confirmMail, setConfirmMail] = useState();
  const [isvalid, setIsvalid] = useState(true);
  const [isvalidBranding, setIsvalidBranding] = useState(true);

  let IsSeramount =
    registrationFormPages &&
    registrationFormPages.hasOwnProperty('is_seramount')
      ? registrationFormPages.is_seramount
      : true;

  const pathName = window.location.origin;

  const { apiSuccess, apiMessage } = props;

  if (!apiSuccess && apiMessage) {
    toast.error(apiMessage);
  }
  if (apiSuccess && apiMessage) {
    toast.success(apiMessage);
  }

  useEffect(() => {
    if (apiMessage) {
      props.resetLogic();
    }
  }, [apiMessage]);

  useEffect(() => {
    if (history.location.pathname.includes('/survey-share/')) {
      const routeData = history.location.pathname.split('/');
      if (routeData.length > 4) {
        history.push('/invalid');
      }
    }
  }, [history]);

  useEffect(() => {
    if (IsSeramount !== undefined) {
      setSecureSessionData('branding', JSON.stringify(IsSeramount));
    }
  }, [IsSeramount]);

  useEffect(() => {
    if (
      surveyEmailContent &&
      surveyEmailContent.data &&
      surveyEmailContent.data.emailContent
    ) {
      THANKS_CONTENT_FOR_DATE = surveyEmailContent.data.emailContent;
    }
  }, [surveyEmailContent]);
  useEffect(() => {
    if (
      domainData &&
      domainData.data &&
      domainData.data.email_domain &&
      domainData.data.email_domain.length > 0
    ) {
      setDomainArray(domainData.data.email_domain);
    }
  }, [domainData]);

  useEffect(() => {
    if (meetingId === 0) {
      setStartDate('');
      setEndDate('');
    }
  }, [meetingId]);

  useEffect(() => {
    if (
      surveyMeetings &&
      surveyMeetings.data &&
      surveyMeetings.data.length > 0
    ) {
      const updatedPages =
        pages &&
        pages.length > 0 &&
        pages.map(page => {
          page.REGISTRATOION_PAGE_CONTENT.map(content => {
            if (
              content.questionType === 'meeting_dates' &&
              surveyMeetings.data &&
              surveyMeetings.data.length > 0
            ) {
              if (content.optionsValue) {
                content.updatedOptionValue =
                  [...surveyMeetings.data, ...content.optionsValue] || [];
              } else {
                content.updatedOptionValue = [...surveyMeetings.data] || [];
              }
            }
            return content;
          });
          return page;
        });
      setPages(updatedPages);
    }
  }, [surveyMeetings]);

  useEffect(() => {
    if (finalMeetid && !isNaN(Number(finalMeetid))) {
      const isPreview =
        history.location.pathname.includes('/user-survey/') ||
        history.location.pathname.includes('/survey-share/');
      const data = { id, finalMeetid };
      if (isPreview) {
        data.isPreview = true;
        setDeviceType(null);
      }
      data.isUpdateInternal = true;
      if (history.location.pathname.includes('/survey-share/')) {
        data.customUrl = query.text;
      }
      props.requestGetSurveyById(data);
      if (tempData && Object.keys(tempData).length) {
        handleOptionChange(
          tempData.data,
          tempData.pagedata,
          tempData.index,
          tempData.mid,
          tempData.meetingAnswer,
        );
      }
    }
  }, [finalMeetid]);

  useEffect(() => {
    if (finalMeetid && !isNaN(Number(finalMeetid))) {
      if (tempData && Object.keys(tempData).length) {
        handleOptionChange(
          tempData.data,
          tempData.pagedata,
          tempData.index,
          tempData.mid,
          tempData.meetingAnswer,
        );
      }
    }
  }, [registrationFormPages]);

  useEffect(() => {
    if (registrationFormPages && registrationFormPages.length === 0) {
      const isPreview =
        history.location.pathname.includes('/user-survey/') ||
        history.location.pathname.includes('/survey-share/');

      if (
        history.location.pathname.includes('/user-survey/') &&
        finalMeetid &&
        isNaN(Number(finalMeetid))
      ) {
        history.push('/invalid');
      }
      const data =
        finalMeetid && !isNaN(Number(finalMeetid))
          ? { id, finalMeetid }
          : { id };
      if (isPreview) {
        data.isPreview = true;
        setDeviceType(null);
      }
      if (history.location.pathname.includes('/survey-share/')) {
        data.customUrl = query.text;
      }
      props.requestGetSurveyById(data);
      props.requestGetMeetingsForSurvey(data);
      props.requestSurveyEmailContent({ surveyId: id });
      props.requestEmaildomain({ surveyId: id });
    }
    const { data, REGISTRATION_PAGE_CONTENT_EMAIL } = registrationFormPages;

    if (data && data.length > 0) {
      let getExceptZeroPage = [];
      if (pages && pages.length > 0) {
        getExceptZeroPage = pages.filter(page => page.page_no !== 0);
      } else {
        getExceptZeroPage = data.filter(page => page.page_no !== 0);
      }
      const getZeroPage = data.filter(page => page.page_no === 0);
      const newData = [...getExceptZeroPage, ...getZeroPage];

      const updatedPages =
        newData &&
        newData.length > 0 &&
        newData.map(page => {
          page.REGISTRATOION_PAGE_CONTENT.map(content => {
            if (content.type === 'thank_you' && content.contentValue !== null) {
              THANKS_CONTENT_FOR_WAITLIST = content.contentValue;
            }
            if (
              content.questionType !== 'free_input' &&
              content.questionType === 'meeting_dates' &&
              surveyMeetings.data &&
              surveyMeetings.data.length > 0
            ) {
              if (content.optionsValue) {
                content.updatedOptionValue =
                  [...surveyMeetings.data, ...content.optionsValue] || [];
              } else {
                content.updatedOptionValue = [...surveyMeetings.data] || [];
              }
            }
            return content;
          });
          return page;
        });
      setPages(updatedPages);
    }
    if (!pagesSurvayName) {
      setPagesSurvayName(props.surveyName);
    }
    if (
      REGISTRATION_PAGE_CONTENT_EMAIL &&
      REGISTRATION_PAGE_CONTENT_EMAIL.textInstructions
    ) {
      // const textInstructionArrayData = REGISTRATION_PAGE_CONTENT_EMAIL.textInstructions.split(
      //   'Click here to download the Calendar Eve
      // setTextInstructionArray(textInstructionArnt Invite',
      // );rayData);
      // setTextInstructions(REGISTRATION_PAGE_CONTENT_EMAIL.textInstructions);
    }
  }, [registrationFormPages, id, history.location]);

  useEffect(() => {
    if (!pages || pages.length === 0) {
      return;
    }
    blockRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    setProgress(((activeNext + 1) * 100) / pages.length - 1);
  }, [pages, activeNext]);

  useEffect(() => {
    if (!history.location.state || pages.length === 0) {
      return;
    }
    if (history.location.state.pageData === undefined) {
      return;
    }
    if (history.location.state && history.location.state.pageData !== null) {
      if (history.location.state.pageData === 0) {
        setActiveNext(pages.length - 1);
      } else {
        setActiveNext(history.location.state.pageData - 1);
      }
    }
  }, [history.location.state, pages]);

  const validateForm = () => {
    const error = {};
    const typechk =
      pages &&
      pages.length > 0 &&
      pages[activeNext].REGISTRATOION_PAGE_CONTENT &&
      pages[activeNext].REGISTRATOION_PAGE_CONTENT.length > 0 &&
      pages[activeNext].REGISTRATOION_PAGE_CONTENT.map(
        data => data.questionType,
      );
    const isEmail = RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
    if (typechk.includes('quick_answer')) {
      if (!email) {
        error.email = 'Please Enter Email Id';
      } else if (!isEmail.test(email)) {
        error.email = 'Please enter a valid Email';
      }
    }

    if (
      typechk.includes('one_choice') ||
      typechk.includes('multiple_choice') ||
      typechk.includes('free_input')
    ) {
      const data =
        pages &&
        pages.length > 0 &&
        pages.map(page => {
          pages[activeNext].REGISTRATOION_PAGE_CONTENT.map(content => {
            if (content.questionType === 'free_input') {
              if (content.isRequire) {
                if (
                  content.answer === undefined ||
                  content.answer === null ||
                  content.answer.length === 0
                ) {
                  if (content.hasLogic === false) {
                    content.has_error = true;
                    error.input = 'Please enter any text';
                    return content;
                  }
                }
              }
            }
            if (
              content.questionType === 'one_choice' ||
              content.questionType === 'multiple_choice'
            ) {
              if (content.isRequire) {
                if (
                  !content.is_checked ||
                  content.is_checked === undefined ||
                  content.is_checked.length === 0
                ) {
                  if (content.hasLogic === false) {
                    content.has_error = true;
                    error.options = 'Please select any option';
                    return content;
                  }
                }
              }
            }
            return content;
          });
          return page;
        });
      setPages(data);
    }
    return error;
  };

  const handleValidationChange = data => {
    setEmail(data);
  };
  useEffect(() => {
    const meetingLink =
      props.IcsFile &&
      props.IcsFile.icsData &&
      props.IcsFile.icsData.sessionUrl;
    setLink(meetingLink);
  }, [props.IcsFile]);

  useEffect(() => {
    console.log('pages in use ->>>>>>>>>>>>>', pages);
  }, [pages]);

  const handleFinalSubmit = () => {
    const typechk =
      pages &&
      pages.length > 0 &&
      pages[activeNext].REGISTRATOION_PAGE_CONTENT &&
      pages[activeNext].REGISTRATOION_PAGE_CONTENT.length > 0 &&
      pages[activeNext].REGISTRATOION_PAGE_CONTENT.map(
        data => data.questionType,
      );
    if (
      typechk.includes('quick_answer') ||
      typechk.includes('one_choice') ||
      typechk.includes('multiple_choice') ||
      typechk.includes('rank_order') ||
      typechk.includes('free_input')
    ) {
      const errorsArray = validateForm();
      if (Object.keys(errorsArray).length > 0) {
        setErrors(errorsArray);
        return;
      }
    }
    setErrors({});

    if (pages && activeNext === pages.length - 2) {
      saveData();
    } else {
      setActiveNext(activeNext + 1);
    }
  };

  // eslint-disable-next-line no-shadow
  const handleOptionChange = (data, pagedata, index, mid, meetingAnswer) => {
    let updatedPagedata;
    let checkIndex;
    if (meetingAnswer) {
      setMeetingAnswerData([meetingAnswer]);
    }
    if (data.questionType === 'meeting_dates' && mid !== undefined) {
      checkIndex = mid.toString();
    } else if (data.questionType !== 'meeting_dates') {
      checkIndex = index.toString();
    }
    if (data.contentOptions && data.contentOptions.includes(checkIndex)) {
      updatedPagedata =
        pages &&
        pages.length > 0 &&
        pages.map(page => {
          page.REGISTRATOION_PAGE_CONTENT.map(content => {
            if (
              content.questionType !== 'free_input' &&
              data.contentId &&
              content.id === data.contentId.toString()
            ) {
              content.hasLogic = false;
            }

            return content;
          });
          return page;
        });
      setPages(updatedPagedata);
    } else {
      updatedPagedata =
        pages &&
        pages.length > 0 &&
        pages.map(page => {
          page.REGISTRATOION_PAGE_CONTENT.map(content => {
            if (
              content.questionType !== 'free_input' &&
              data.contentId &&
              content.id === data.contentId.toString()
            ) {
              content.hasLogic = true;
              content.optionAnswer = [];
              content.is_checked = [];
              delete content.has_error;
            }
            return content;
          });
          return page;
        });
    }
    setPages(updatedPagedata);

    const newData =
      updatedPagedata &&
      updatedPagedata.length > 0 &&
      updatedPagedata.map(page => {
        page.REGISTRATOION_PAGE_CONTENT.map(content => {
          if (content.id === data.id) {
            if (
              content.questionType !== 'free_input' &&
              content.questionType === 'meeting_dates'
            ) {
              if (mid !== 0) {
                const str = registrationFormPages.is_seramount
                  ? 'Seramount '
                  : 'EAB ';
                setFinalMeetid(content.updatedOptionValue[index].id);
                setMeetingDateId(content.updatedOptionValue[index].id);
                setTempData({ data, pagedata, index, mid, meetingAnswer });
                const replaceDateTime = THANKS_CONTENT_FOR_DATE.replaceAll(
                  'Date - Time - TimeZone',
                  getTimeZoneFormatPreview(
                    content.updatedOptionValue[index].start_date_time,
                    content.updatedOptionValue[index].end_date_time,
                    setStartDate(
                      content.updatedOptionValue[index].start_date_time,
                    ),
                    setEndDate(content.updatedOptionValue[index].end_date_time),
                  ),
                )
                  .replaceAll(
                    'ICS_CALENDER',
                    () =>
                      `<a
                key={match}
                href=${pathName}/invite/ics/${mid}
                target='_blank'
              >
              Add the session to your calendar.
              </a>`,
                  )
                  .replaceAll('BRANDING', str);
                setTextInstructions(null);
                setTextInstructionArray(replaceDateTime);
              } else {
                let str = '';
                const routeData = history.location.pathname.split('/');
                if (routeData.includes('preview')) {
                  str = 'Seramount';
                  IsSeramount = true;
                } else {
                  // eslint-disable-next-line no-lonely-if
                  if (registrationFormPages.hasOwnProperty('is_seramount')) {
                    str = IsSeramount ? 'Seramount ' : 'EAB ';
                  } else {
                    IsSeramount = true;
                    str = 'Seramount';
                  }
                }
                setTextInstructionArray([]);
                const text = THANKS_CONTENT_FOR_WAITLIST.replaceAll(
                  `BRANDING`,
                  str,
                );
                setTextInstructions(text);

                setFinalMeetid('');
                const isPreview =
                  history.location.pathname.includes('/user-survey/') ||
                  history.location.pathname.includes('/survey-share/');
                const data =
                  finalMeetid && !isNaN(Number(finalMeetid))
                    ? { id, finalMeetid }
                    : { id };
                if (isPreview) {
                  data.isPreview = true;
                }
                if (history.location.pathname.includes('/survey-share/')) {
                  data.customUrl = query.text;
                }
                props.requestGetSurveyById(data);
              }
            }
            content.is_checked = [index.toString()];
            if (content.questionType === 'meeting_dates') {
              content.optionAnswer = [content.updatedOptionValue[index]];
            } else {
              content.optionAnswer = [content.optionsValue[index]];
            }
            if (content.has_error) {
              delete content.has_error;
            }
          }

          return content;
        });
        return page;
      });
    setPages(newData);
  };

  const handleMultiChoiseOnChange = (data, pagedata, index, option) => {
    let checkboxArr;
    let checkboxVal;
    const newData =
      pages &&
      pages.length > 0 &&
      pages.map(page => {
        page.REGISTRATOION_PAGE_CONTENT.map(content => {
          if (content.questionType !== 'free_input' && content.id === data.id) {
            checkboxArr = content.is_checked;
            checkboxVal = content.optionAnswer;
            if (checkboxArr) {
              const checkboxIdx = checkboxArr.indexOf(index.toString());
              const checkboxValIdx = checkboxVal.indexOf(option);
              if (checkboxIdx !== -1) {
                checkboxArr.splice(checkboxIdx, 1);
                checkboxVal.splice(checkboxValIdx, 1);
              } else {
                checkboxArr.push(index.toString());
                checkboxVal.push(option);
              }
            } else {
              content.is_checked = [index.toString()];
              content.optionAnswer = [option];
            }

            if (
              content.isRequire &&
              content.is_checked &&
              content.is_checked.length === 0
            ) {
              content.has_error = true;
            } else {
              delete content.has_error;
            }
          }

          return content;
        });
        return page;
      });

    const checker = (arr, target) => target.every(v => arr.includes(v));

    const dataChecker =
      checkboxArr && checkboxArr.length > 0 && data.contentOptions
        ? checker(checkboxArr.map(String), data.contentOptions)
        : false;
    let updatedPagedata;
    if (dataChecker && data.contentOptions) {
      updatedPagedata =
        newData &&
        newData.length > 0 &&
        newData.map(page => {
          page.REGISTRATOION_PAGE_CONTENT.map(content => {
            if (content.id === data.contentId) {
              content.hasLogic = false;
            }

            return content;
          });
          return page;
        });
      setPages(updatedPagedata);
    } else {
      updatedPagedata =
        newData &&
        newData.length > 0 &&
        newData.map(page => {
          page.REGISTRATOION_PAGE_CONTENT.map(content => {
            if (
              content.questionType !== 'free_input' &&
              content.id === data.contentId
            ) {
              content.hasLogic = true;
            }
            return content;
          });
          return page;
        });
    }
    setPages(updatedPagedata);
  };

  const hanldeRankOrderChange = (data, event, type) => {
    const newData =
      pages &&
      pages.length > 0 &&
      pages.map(page => {
        page.REGISTRATOION_PAGE_CONTENT.map(content => {
          if (content.questionType !== 'free_input' && content.id === data.id) {
            content.optionAnswer = type;
          }
          return content;
        });
        return page;
      });

    setPages(newData);
  };

  const handleEmailChange = data => {
    if (data.contentId) {
      const updatedPagedata =
        pages &&
        pages.length > 0 &&
        pages.map(page => {
          page.REGISTRATOION_PAGE_CONTENT.map(content => {
            if (
              content.questionType !== 'free_input' &&
              content.id === data.contentId
            ) {
              content.hasLogic = false;
            }

            return content;
          });
          return page;
        });
      setPages(updatedPagedata);
    } else {
      const updatedPagedata =
        pages &&
        pages.length > 0 &&
        pages.map(page => {
          page.REGISTRATOION_PAGE_CONTENT.map(content => {
            if (
              content.questionType !== 'free_input' &&
              content.id === data.contentId
            ) {
              content.hasLogic = true;
              delete content.has_error;
            }
            return content;
          });
          return page;
        });
      setPages(updatedPagedata);
    }
  };

  const handleFreeOptionChange = (data, value) => {
    const error = {};
    const newData =
      pages &&
      pages.length > 0 &&
      pages.map(page => {
        page.REGISTRATOION_PAGE_CONTENT.map(content => {
          if (content.questionType === 'free_input' && content.id === data.id) {
            content.answer = value !== '' ? [value] : null;
            if (
              content.isRequire &&
              !value &&
              (value === undefined || value === '')
            ) {
              content.has_error = true;
              error.input = 'Please enter any text';
            } else {
              delete content.has_error;
              delete error.input;
            }
          }
          return content;
        });
        return page;
      });
    setErrors(error);
    setPages(newData);
  };

  const saveData = useCallback(() => {
    if (meetId.includes('/user-survey/') || meetId.includes('/survey-share/')) {
      if (!pages || pages.length === 0) {
        return;
      }
      pages.map(page => {
        page.REGISTRATOION_PAGE_CONTENT.map(content => {
          if (content.type === 'question') {
            if (content.questionType === 'free_input') {
              answers.push({
                label: content.label,
                questionType: content.questionType,
                answers:
                  content.answer && content.answer !== undefined
                    ? content.answer
                    : [],
                content_id: content.id,
                option: content.optionsValue,
              });
            } else if (content.questionType === 'meeting_dates') {
              const answerField =
                content.questionType === 'meeting_dates' &&
                meetingId !== undefined
                  ? [
                      {
                        id: meetingId,
                        start_date_time: startDate,
                        end_date_time: endDate,
                      },
                    ]
                  : content.optionAnswer;
              const answertwo = meetingAnswerData;
              answers.push({
                label: content.label,
                questionType: content.questionType,
                answers: meetingId === 0 ? answertwo : answerField || [],
                content_id: content.id,
                option: content.optionsValue,
              });
            } else {
              answers.push({
                label: content.label,
                questionType: content.questionType,
                answers: content.optionAnswer || [],
                content_id: content.id,
                option: content.optionsValue,
              });
            }
          }
        });
      });
      const data = {
        surveyId: id,
        answers:
          answers && answers !== undefined && answers.length ? [answers] : [],
        user_email: email.toLowerCase(),
        meetingId: meetId.includes('/survey-share/')
          ? meetingDateId
          : finalMeetidInit,
        selected_meeting: meetingDateId || null,
      };
      props.requestSurveyAnswer(data);
    } else {
      setActiveNext(activeNext + 1);
    }
    if (meetingDateId) {
      props.requestIcsFile(meetingDateId);
    }
  }, [pages]);

  useEffect(() => {
    if (props.surveyFetch && props.surveyFetch.fetching === false) {
      setActiveNext(activeNext + 1);
    }

    if (
      props.surveyFetch &&
      props.surveyFetch.surveyResponse &&
      props.surveyFetch.surveyResponse.success &&
      meetingDateId
    ) {
      setMeetingDateId('');
    }
  }, [props.surveyFetch]);

  useEffect(() => {
    if (link && textInstructionArray.length > 0) {
      const emailText = textInstructionArray.replaceAll(
        'MEETING_LINK',
        () => `<a
      key={match}
      href=${link}
    >
      ${link}
    </a>`,
      );
      setTextInstructionArray(emailText);
    }
  }, [link]);
  useEffect(() => {
    if (meetingId && textInstructionArray.length > 0) {
      const emailText = textInstructionArray.replaceAll(
        'Add the session to your calendar.',
        () =>
          `<a
      key={match}
      href=${pathName}/invite/ics/${meetingId}
      target='_blank'
    >
    Add the session to your calendar.
    </a>`,
      );
      setTextInstructionArray(emailText);
    }
  }, [meetingId]);

  return (
    <>
      <CustomToaster />
      <div
        className={`create-meeting registration-form-preview ${(history.location.pathname.includes(
          '/survey-share/',
        ) ||
          history.location.pathname.includes('/user-survey/')) &&
          'survey-page'}`}
      >
        {pages.length === 0 && (
          <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="grow" />
          </div>
        )}
        {pages && pages.length > 0 && (
          <>
            {!history.location.pathname.includes('/survey-share/') &&
              !history.location.pathname.includes('/user-survey/') && (
                <div className="create-meeting__header">
                  <div className="create-meeting__back">
                    <Link
                      className="hover-decoration"
                      to={`/surveys/registration-form/${id}`}
                      aria-label="Registration-Builder"
                    >
                      <Button
                        variant="link"
                        aria-label="Registration Builder"
                        className="create-meeting__back-btn text-decoration-none fw-bold"
                      >
                        <Image src={leftArrow} alt="Arrow" className="me-2" />{' '}
                        <span className="d-sm-block d-none">
                          Registration Builder
                        </span>
                      </Button>
                    </Link>
                  </div>
                  <div className="create-meeting__heading preview__heading">
                    <div>
                      <h6 className="mb-2 text-bismark">
                        Page {activeNext + 1}
                      </h6>
                      <h6 className="fw-bold mb-0">
                        This is how your survey will look like on different
                        devices:
                      </h6>
                    </div>
                    <ul className="preview-devices">
                      <li>
                        <ButtonWithHoverEffect
                          defaultImage={monitorIcon}
                          hoverImage={monitorBlueIcon}
                          hoverColor="blue"
                          altText="Desktop"
                          imageWidth={40}
                          onClick={() => setDeviceType('desktop')}
                          btnClassNames={deviceType === 'desktop' && 'active'}
                        />
                      </li>
                      <li>
                        <ButtonWithHoverEffect
                          defaultImage={tabletIcon}
                          hoverImage={tabletBlueIcon}
                          hoverColor="blue"
                          altText="Tablet"
                          imageWidth={40}
                          onClick={() => setDeviceType('tablet')}
                          btnClassNames={deviceType === 'tablet' && 'active'}
                        />
                      </li>
                      <li>
                        <ButtonWithHoverEffect
                          defaultImage={phoneIcon}
                          hoverImage={phoneBlueIcon}
                          hoverColor="blue"
                          altText="Phone"
                          imageWidth={40}
                          onClick={() => setDeviceType('phone')}
                          btnClassNames={deviceType === 'phone' && 'active'}
                        />
                      </li>
                      <li>
                        <ButtonWithHoverEffect
                          defaultImage={phoneLandscapeIcon}
                          hoverImage={phoneLandscapeBlueIcon}
                          hoverColor="blue"
                          altText="Landscapee Phone"
                          btnClassNames={
                            deviceType === 'landscape-phone' && 'active'
                          }
                          imageWidth={40}
                          onClick={() => setDeviceType('landscape-phone')}
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            <div
              className={classNames(
                {
                  'd-flex':
                    deviceType === 'phone' || deviceType === 'landscape-phone',
                },
                'create-meeting-dialog p-0',
              )}
              style={{
                backgroundImage: `url(${
                  // eslint-disable-next-line no-nested-ternary
                  IsSeramount === undefined || IsSeramount
                    ? seramountBranding
                    : eabBranding
                })`,
                backgroundSize: 'cover',
              }}
            >
              {pages.length > 0 && (
                <div className={`preview-content ${deviceType}`}>
                  <div className="registration-style__wrapper">
                    <LockedHeader
                      registrationFormPages={registrationFormPages}
                    />
                    <div className="style__header">
                      <div className="wrapper__heading text-capitalize">
                        {pagesSurvayName}
                      </div>
                      {(deviceType === 'desktop' ||
                        deviceType === 'tablet' ||
                        !deviceType) && (
                        <div className="custom-progressbar">
                          <div className="custom-progressbar__header">
                            <div>Progress</div>
                            <div>
                              {' '}
                              {activeNext + 1}/ {pages.length}{' '}
                            </div>
                          </div>
                          <ProgressBar now={progress} />
                        </div>
                      )}
                    </div>
                    <div className="style__content">
                      <div className="scroll" ref={blockRef}>
                        {pages &&
                          pages.length > 0 &&
                          pages[activeNext].REGISTRATOION_PAGE_CONTENT &&
                          pages[activeNext].REGISTRATOION_PAGE_CONTENT.length >
                            0 &&
                          pages[activeNext].REGISTRATOION_PAGE_CONTENT.map(
                            data => (
                              <>
                                {pages[activeNext].page_no !== 0 && (
                                  <>
                                    {data.type === 'text_media' && (
                                      <TextContent data={data.contentValue} />
                                    )}
                                    {data.questionType === 'quick_answer' && (
                                      <QuickAnswer
                                        data={data}
                                        erorrs={errors.email}
                                        emailValue={email}
                                        confirmMail={confirmMail}
                                        domainArray={domainArray}
                                        setIsvalid={setIsvalid}
                                        setConfirmMail={setConfirmMail}
                                        handleValidationChange={
                                          handleValidationChange
                                        }
                                        setErrors={setErrors}
                                        handleEmailChange={handleEmailChange}
                                        from="preview"
                                        setIsvalidBranding={setIsvalidBranding}
                                      />
                                    )}
                                    {data.questionType === 'one_choice' &&
                                      !data.hasLogic && (
                                        <>
                                          <SingleChoiseOption
                                            data={data}
                                            pagedata={pages}
                                            from="preview"
                                            erorrs={errors}
                                            handleOptionChange={
                                              handleOptionChange
                                            }
                                          />
                                        </>
                                      )}
                                    {data.questionType === 'meeting_dates' &&
                                      !data.hasLogic && (
                                        <>
                                          {' '}
                                          <MeetingDatesOption
                                            data={data}
                                            pagedata={pages}
                                            from="preview"
                                            erorrs={errors}
                                            handleOptionChange={
                                              handleOptionChange
                                            }
                                            surveyMeetings={surveyMeetings.data}
                                            setMeetingDateId={setMeetingDateId}
                                            setMeetingId={setMeetingId}
                                          />
                                        </>
                                      )}
                                    {data.questionType === 'multiple_choice' &&
                                      !data.hasLogic && (
                                        <MultipleChoiseOption
                                          data={data}
                                          pagedata={pages}
                                          from="preview"
                                          handleOptionChange={
                                            handleMultiChoiseOnChange
                                          }
                                          erorrs={errors}
                                        />
                                      )}
                                    {data.questionType === 'rank_order' &&
                                      !data.hasLogic && (
                                        <RankOrder
                                          data={data}
                                          pagedata={pages}
                                          from="preview"
                                          handleOptionChange={
                                            hanldeRankOrderChange
                                          }
                                          erorrs={errors}
                                        />
                                      )}
                                    {data.questionType === 'free_input' &&
                                      !data.hasLogic && (
                                        <FreeInputOption
                                          data={data}
                                          pagedata={pages}
                                          from="preview"
                                          handleOptionChange={
                                            handleFreeOptionChange
                                          }
                                          erorrs={errors}
                                        />
                                      )}
                                    {data.email && (
                                      <EmailBody data={data.email} />
                                    )}
                                  </>
                                )}
                              </>
                            ),
                          )}
                        {pages &&
                          pages.length &&
                          pages[activeNext].REGISTRATOION_PAGE_CONTENT &&
                          pages[activeNext].REGISTRATOION_PAGE_CONTENT.length >
                            0 &&
                          pages[activeNext].REGISTRATOION_PAGE_CONTENT.map(
                            data => (
                              <>
                                {pages[activeNext].page_no === 0 && (
                                  <>
                                    {data.type === 'thank_you' &&
                                      data.contentValue && (
                                        <>
                                          {meetingAnswerData.length > 0 ? (
                                            <>
                                              {textInstructions ? (
                                                <TextContent
                                                  data={textInstructions}
                                                />
                                              ) : (
                                                <>
                                                  <TextContent
                                                    data={textInstructionArray}
                                                  />

                                                  {/* <TextContent
                                                    data={getIcsText()}
                                                  /> */}

                                                  {/* <TextContent
                                                    data={getRenderText()}
                                                  /> */}
                                                </>
                                              )}
                                            </>
                                          ) : (
                                            <TextContent
                                              data={data.contentValue}
                                            />
                                          )}
                                        </>
                                      )}
                                  </>
                                )}
                              </>
                            ),
                          )}
                      </div>{' '}
                    </div>
                    <div className="style__footer">
                      <div
                        className="d-flex"
                        style={{ justifyContent: 'space-between' }}
                      >
                        {activeNext === pages.length - 2 && (
                          <div className="d-flex">
                            <div style={{ marginLeft: '40px' }}>
                              <a
                                style={{ color: '#0072ce' }}
                                rel="noreferrer"
                                target="_blank"
                                href="https://eab.com/terms-of-use/"
                              >
                                Terms of Use
                              </a>
                            </div>
                            <div style={{ marginLeft: '40px' }}>
                              <a
                                style={{ color: '#0072ce' }}
                                rel="noreferrer"
                                target="_blank"
                                href="https://seramount.com/privacy-policy/"
                              >
                                Privacy Policy
                              </a>
                            </div>
                          </div>
                        )}
                        <div className="d-flex">
                          {activeNext > 0 && activeNext !== pages.length - 1 && (
                            <Button
                              variant="blue-10"
                              className="me-3"
                              aria-label="Back"
                              onClick={() => setActiveNext(activeNext - 1)}
                            >
                              Back
                            </Button>
                          )}
                          {activeNext < pages.length - 2 && (
                            <Button
                              variant="blue"
                              className="me-3"
                              aria-label="Next"
                              // onClick={() => setActiveNext(activeNext + 1)}
                              onClick={e => {
                                e.preventDefault();
                                handleFinalSubmit();
                              }}
                              disabled={isvalid || isvalidBranding}
                            >
                              Next
                            </Button>
                          )}
                          {activeNext === pages.length - 2 && (
                            <Button
                              variant="blue"
                              aria-label='Finish'
                              disabled={
                                (props.surveyFetch &&
                                  props.surveyFetch.fetching) ||
                                isvalid ||
                                isvalidBranding
                              }
                              onClick={e => {
                                e.preventDefault();
                                handleFinalSubmit();
                              }}
                            >
                              Finish
                              {props.surveyFetch &&
                                props.surveyFetch.fetching && (
                                  <Spinner
                                    className="ms-2"
                                    animation="border"
                                    role="status"
                                    size="sm"
                                  />
                                )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

Preview.propTypes = {
  registrationFormPages: PropTypes.array,
  requestGetSurveyById: PropTypes.func,
  requestSurveyAnswer: PropTypes.func,
  surveyFetch: PropTypes.object,
  surveyName: PropTypes.string,
  requestGetMeetingsForSurvey: PropTypes.func,
  surveyMeetings: PropTypes.object,
  apiSuccess: PropTypes.bool,
  apiMessage: PropTypes.string,
  resetLogic: PropTypes.func,
  IcsFile: PropTypes.object,
  domainData: PropTypes.object,
  requestIcsFile: PropTypes.func,
  requestSurveyEmailContent: PropTypes.func,
  surveyEmailContent: PropTypes.func,
  requestEmaildomain: PropTypes.func,
};

const mapStateToProps = state => {
  const { registrationForm, app } = state;
  return {
    registrationFormPages: getRegistrationForm(registrationForm),
    surveyFetch: surveyAnswer(registrationForm),
    surveyName: surveyName(registrationForm),
    surveyMeetings: getSurveyMeetings(registrationForm),
    apiSuccess: apiSuccess(registrationForm),
    apiMessage: apiMessage(registrationForm),
    domainData: getDomainData(registrationForm),
    IcsFile: IcsFile(registrationForm),
    surveyEmailContent: surveyEmailContentData(registrationForm),
    isGlobalAppFetching: app.fetching,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    requestGetSurveyById: payload => dispatch(requestGetSurveyById(payload)),
    requestSurveyAnswer: payload => dispatch(requestSurveyAnswer(payload)),
    requestIcsFile: payload => dispatch(requestIcsFile(payload)),
    requestGetMeetingsForSurvey: payload =>
      dispatch(requestGetMeetingsForSurvey(payload)),
    requestSurveyEmailContent: payload =>
      dispatch(requestSurveyEmailContent(payload)),
    requestEmaildomain: payload => dispatch(requestEmaildomain(payload)),
    resetLogic: () => dispatch(resetLogic()),
    dispatch,
  };
}

const withReducer = injectReducer({ key: 'registrationForm', reducer });
const withSaga = injectSaga({ key: 'registrationForm', saga });

export default compose(
  withReducer,
  withSaga,
  connect(mapStateToProps, mapDispatchToProps),
)(Preview);
