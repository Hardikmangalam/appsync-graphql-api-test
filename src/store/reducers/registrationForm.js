/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable prefer-destructuring */
import * as actions from '../actions/registrationForm';

const initialState = {
  registrationForm: [],
  fetching: false,
  error: '',
  survey: {
    surveyFetching: false,
  },
  surveyAnswers: {
    fetching: null,
  },
  getSurveys: [],
  removeSurveys: {},
  getSurveyLogicOption: {
    getLogicOptions: {},
    fetching: false,
  },
  surveyLogic: {
    logic: {},
    fetching: false,
  },
  updateEmail: {
    updateEmailData: {},
    fetching: false,
  },
  shareSurvey: {
    shareSurveyFetch: false,
  },

  folderList: {
    folderListdata: {},
    fetching: false,
  },
  copySurvey: {
    fetching: false,
  },
  copySurveyPage: {
    fetching: false,
  },
  reorderPage: {
    reorderFetch: false,
  },
  removeContent: {
    fetching: false,
    success: false,
  },
  removePage: {
    fetching: false,
    success: false,
  },
  surveyArchived: {
    fetching: false,
    success: false,
  },
  breakPage: {
    fetching: false,
    success: false,
  },
  mergePage: {
    fetching: false,
    success: false,
  },
  surveyParticipant: {
    fetching: false,
    success: false,
    getParticipant: [],
  },

  editIcsData: {
    fetching: false,
    success: false,
    icsData: {},
  },

  deleteSurveyParticipant: {
    fetching: false,
    success: false,
  },
  deleteSurveyDate: {
    fetching: false,
    success: false,
  },
  surveyEmailContent: {
    fetching: false,
    success: false,
  },
  setSurveyEmailContent: {
    fetching: false,
    success: false,
  },
  domainData: {
    fetching: false,
    success: false,
    data: {},
  },
  icsFile: {
    data: {},
    fetching: false,
    success: false,
  },
  getAllSurveyFetching: false,
  addPageFetching: false,
  getSurveyByID: false,
  swapPageLoading: false,
  copyPageContentFetching: false,
  removeAllLogicFetching: false,
  surveyName: '',
  survey_meetings: {},
  apiSuccess: false,
  apiMessage: '',
};
const registrationForm = (state = initialState, action) => {
  switch (action.type) {
    case actions.REGISTRATION_PAGE_REQUEST:
      return {
        ...state,
        registrationForm: { ...state.registrationForm, fetching: null },
        fetching: true,
      };
    case actions.REGISTRATION_PAGE_SUCCESS:
      return {
        ...state,
        registrationForm: { ...action.payload, fetching: true },

        fetching: false,
        apiSuccess: true,
        apiMessage: action.payload.message,
      };

    case actions.REGISTRATION_PAGE_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        registrationForm: [],
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.SURVEY_ANSWERS_REQUEST:
      return {
        ...state,
        surveyAnswers: { ...state.surveyAnswers, fetching: true },
        fetching: true,
        apiSuccess: false,
        apiMessage: '',
      };
    case actions.SURVEY_ANSWER_REQUEST_SUCCESS:
      return {
        ...state,
        surveyAnswers: {
          ...state.surveyAnswers,
          surveyResponse: action.payload,
          fetching: false,
        },
        fetching: false,
        apiSuccess: true,
        apiMessage: action.payload.message,
      };

    case actions.SURVEY_ANSWER_REQUEST_FAILED:
      return {
        ...state,
        surveyAnswers: { ...state.surveyAnswers, fetching: null },
        fetching: false,
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.REGISTRATION_ADD_PAGE_REQUEST:
      return {
        ...state,
        fetching: true,
        addPageFetching: true,
        apiSuccess: false,
        apiMessage: '',
      };
    case actions.REGISTRATION_ADD_PAGE_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        fetching: false,
        addPageFetching: false,
        // apiSuccess: true,
        // apiMessage: action.payload.message,
      };
    case actions.REGISTRATION_ADD_PAGE_FAILED:
      return {
        ...state,
        fetching: false,
        addPageFetching: false,
        error: action.payload,
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.MERGE_REGISTRATION_PAGE_REQUEST:
      return {
        ...state,
        mergePage: { fetching: true, success: false, message: '' },
        apiSuccess: false,
        apiMessage: '',
      };
    case actions.MERGE_REGISTRATION_PAGE_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        mergePage: {
          fetching: false,
          success: true,
        },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.MERGE_REGISTRATION_PAGE_FAILED:
      return {
        ...state,
        mergePage: {
          fetching: false,
          error: action.payload,
          success: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.SURVEY_BY_ID_REQUEST:
      return { ...state, fetching: true, getSurveyByID: true };
    case actions.SURVEY_BY_ID_SUCCESS:
      const isUpdateInternal = action.payload.isUpdateInternal;
      if (isUpdateInternal && state.registrationForm) {
        if (state.registrationForm.surveyId == action.payload.surveyId) {
          action.payload = {
            ...state.registrationForm,
            is_seramount: action.payload.is_seramount,
          };
        }
      }
      return {
        ...state,
        registrationForm: action.payload,
        editIcsData: {
          icsData: action.payload,
        },
        surveyName: action.payload.surveyName,
        getSurveyByID: false,
        fetching: false,
      };
    case actions.SURVEY_BY_ID_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        getSurveyByID: false,
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.CREATE_SURVEY_REQUEST:
      return { ...state, survey: { survey: {}, surveyFetching: true } };
    case actions.CREATE_SURVEY_SUCCESS:
      return {
        ...state,
        survey: { survey: action.payload, surveyFetching: false },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.CREATE_SURVEY_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        survey: { survey: {}, surveyFetching: false },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.CREATE_SURVEY_FOLDER_REQUEST:
      return { ...state, fetching: true };
    case actions.CREATE_SURVEY_FOLDER_SUCCESS:
      return {
        ...state,
        fetching: false,
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.CREATE_SURVEY_FOLDER_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.GET_SURVEYS_REQUEST:
      return { ...state, fetching: true, getAllSurveyFetching: true };
    case actions.GET_SURVEYS_SUCCESS:
      return {
        ...state,
        getSurveys: action.payload,
        fetching: false,
        getAllSurveyFetching: false,
      };
    case actions.GET_SURVEYS_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        getSurveys: [],
        getAllSurveyFetching: false,
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.SURVEYS_REMOVE_REQUEST:
      return {
        ...state,
        removeSurveys: { ...action.payload, fetching: true },
        fetching: true,
      };
    case actions.SURVEYS_REMOVE_SUCCESS:
      return {
        ...state,
        removeSurveys: { ...action.payload, fetching: false },
        fetching: false,
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.SURVEYS_REMOVE_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        removeSurveys: {},
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.SURVEYS_LOGIC_OPTION_REQUEST:
      return { ...state, getSurveyLogicOption: { fetching: true } };
    case actions.SURVEYS_LOGIC_OPTION_SUCCESS:
      return {
        ...state,
        getSurveyLogicOption: {
          getLogicOptions: action.payload,
          fetching: false,
        },
      };
    case actions.SURVEYS_LOGIC_OPTION_FAILED:
      return {
        ...state,
        getSurveyLogicOption: {
          fetching: false,
          error: action.payload,
          getLogicOptions: {},
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.SURVEY_LOGIC_REQUEST:
      return {
        ...state,
        surveyLogic: { fetching: true, success: false, message: '' },
        apiSuccess: false,
        apiMessage: '',
      };
    case actions.SURVEY_LOGIC_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        surveyLogic: {
          fetching: false,
          success: true,
          // message: action.payload.message,
        },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.SURVEY_LOGIC_FAILED:
      return {
        ...state,
        surveyLogic: {
          fetching: false,
          error: action.payload,
          success: false,
          logic: {},
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.RESET_REGISTRATION:
      return { ...state, registrationForm: [] };
    default:
      return state;

    case actions.RESET_CREATESURVEY:
      return { ...state, survey: {}, registrationForm: [] };

    // registration
    case actions.REGISTRATION_SWAP_PAGE_REQUEST:
      return { ...state, fetching: true, swapPageLoading: true };
    case actions.REGISTRATION_SWAP_PAGE_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        swapPageLoading: false,
        fetching: false,
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.REGISTRATION_SWAP_PAGE_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        swapPageLoading: false,
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.REGISTRATION_BREAK_PAGE_REQUEST:
      return {
        ...state,
        breakPage: { fetching: true, success: false, message: '' },
      };
    case actions.REGISTRATION_BREAK_PAGE_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        breakPage: {
          fetching: false,
          success: true,
        },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.REGISTRATION_BREAK_PAGE_FAILED:
      return {
        ...state,
        breakPage: {
          fetching: false,
          success: false,
          error: action.payload,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.UPDATE_EMAIL_REQUEST:
      return { ...state, updateEmail: { fetching: true, success: false } };
    case actions.UPDATE_EMAIL_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        updateEmail: {
          updateEmailData: action.payload,
          fetching: false,
          success: true,
        },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.UPDATE_EMAIL_FAILED:
      return {
        ...state,
        updateEmail: {
          fetching: false,
          error: action.payload,
          success: false,
          updateEmailData: {},
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.SHARE_SURVEY_REQUEST:
      return {
        ...state,
        shareSurvey: { shareSurvey: {}, shareSurveyFetch: true },
      };
    case actions.SHARE_SURVEY_SUCCESS:
      return {
        ...state,
        shareSurvey: { shareSurvey: action.payload, shareSurveyFetch: false },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.SHARE_SURVEY_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        shareSurvey: { shareSurvey: {}, shareSurveyFetch: false },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.DELETE_REGISTRATION_PAGE_REQUEST:
      return {
        ...state,
        removePage: { fetching: true, success: false },
        fetching: true,
        apiSuccess: false,
        apiMessage: '',
      };
    case actions.DELETE_REGISTRATION_PAGE_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        removePage: { fetching: false, success: true },
        fetching: false,
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.DELETE_REGISTRATION_PAGE_FAILED:
      return {
        ...state,
        removePage: {
          fetching: false,
          error: action.payload,
          success: false,
        },
        fetching: false,
        error: action.payload,
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.REGISTRATION_REMOVE_CONTENT_REQUEST:
      return { ...state, removeContent: { fetching: true, success: false } };
    case actions.REGISTRATION_REMOVE_CONTENT_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        removeContent: { fetching: false, success: true },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.REGISTRATION_REMOVE_CONTENT_FAILED:
      return {
        ...state,
        removeContent: {
          fetching: false,
          error: action.payload,
          success: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.GET_FOLDER_LIST_REQUEST:
      return { ...state, folderList: { fetching: true } };
    case actions.GET_FOLDER_LIST_SUCCESS:
      return {
        ...state,
        folderList: { folderListdata: action.payload, fetching: false },
      };
    case actions.GET_FOLDER_LIST_FAILED:
      return {
        ...state,
        folderList: {
          fetching: false,
          error: action.payload,
          folderListdata: {},
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.COPY_SURVEY_REQUEST:
      return { ...state, copySurvey: { fetching: true } };
    case actions.COPY_SURVEY_SUCCESS:
      return {
        ...state,
        getSurveys: action.payload,
        copySurvey: {
          fetching: false,
          success: true,
        },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.COPY_SURVEY_FAILED:
      return {
        ...state,
        copySurvey: {
          fetching: false,
          error: action.payload,
          success: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.COPY_SURVEY_PAGE_REQUEST:
      return { ...state, copySurveyPage: { fetching: true } };
    case actions.COPY_SURVEY_PAGE_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        copySurveyPage: {
          fetching: false,
          success: true,
        },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.COPY_SURVEY_PAGE_FAILED:
      return {
        ...state,
        copySurveyPage: {
          fetching: false,
          error: action.payload,
          succes: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.RESET_LOGIC:
      return {
        ...state,
        surveyLogic: { success: false, message: '' },
        updateEmail: { success: false },
        // editIcsData: { succes: false },

        apiMessage: '',
        apiSuccess: false,
      };

    case actions.REGISTRATION_ADD_UPDATE_CONTENT_PAGE_REQUEST:
      return { ...state, fetching: true, copyPageContentFetching: true };
    case actions.REGISTRATION_ADD_UPDATE__CONTENT_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        fetching: false,
        copyPageContentFetching: false,
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.REGISTRATION_ADD_UPDATE__CONTENT_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.payload,
        copyPageContentFetching: false,
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.REORDER_PAGE_REQUEST:
      return {
        ...state,
        reorderFetch: true,
      };
    case actions.REORDER_PAGE_SUCCESS:
      return {
        ...state,
        reorderPage: action.payload,
        registrationForm: action.payload,
        reorderFetch: false,
        apiMessage: action.payload.message,
        apiSuccess: true,
      };
    case actions.REORDER_PAGE_FAILED:
      return {
        ...state,
        error: action.payload,
        reorderFetch: false,
        apiMessage: action.payload,
        apiSuccess: false,
      };

    case actions.SURVEY_ARCHIVED_REQUEST:
      return { ...state, surveyArchived: { fetching: true, success: false } };
    case actions.SURVEY_ARCHIVED_SUCCESS:
      return {
        ...state,
        surveyArchived: { fetching: false, success: true },
        apiSuccess: true,
        apiMessage: action.payload.message,
      };
    case actions.SURVEY_ARCHIVED_FAILED:
      return {
        ...state,
        surveyArchived: {
          error: action.payload,
          fetching: false,
          success: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.GET_MEETINGS_FOR_SURVEY_REQUEST:
      return { ...state, survey_meetings: { fetching: true } };
    case actions.GET_MEETINGS_FOR_SURVEY_SUCCESS:
      return {
        ...state,
        survey_meetings: { ...action.payload, fetching: false },
      };
    case actions.GET_MEETINGS_FOR_SURVEY_FAILED:
      return {
        ...state,
        survey_meetings: {
          fetching: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.REMOVE_ALL_LOGIC_REQUEST:
      return { ...state, removeAllLogicFetching: true };
    case actions.REMOVE_ALL_LOGIC_SUCCESS:
      return {
        ...state,
        registrationForm: action.payload,
        removeAllLogicFetching: false,
      };
    case actions.REMOVE_ALL_LOGIC_FAILED:
      return {
        ...state,
        removeAllLogicFetching: false,
      };

    case actions.SURVEY_PARTICIPANT_REQUEST:
      return {
        ...state,
        surveyParticipant: { fetching: true, success: false },
      };
    case actions.SURVEY_PARTICIPANT_SUCCESS:
      return {
        ...state,
        surveyParticipant: {
          fetching: false,
          success: true,
          getParticipant: action.payload,
        },
      };
    case actions.SURVEY_PARTICIPANT_FAILED:
      return {
        ...state,
        surveyParticipant: {
          fetching: false,
          success: false,
          getParticipant: [],
        },
      };

    case actions.EDIT_ICS_REQUEST:
      return {
        ...state,
        editIcsData: { fetching: true, success: false },
      };
    case actions.EDIT_ICS_SUCCESS:
      return {
        ...state,
        editIcsData: {
          fetching: false,
          success: true,
          icsData: action.payload.data,
        },
        apiMessage: action.payload.message,
        apiSuccess: true,
      };
    case actions.EDIT_ICS_FAILED:
      return {
        ...state,
        editIcsData: {
          fetching: false,
          success: false,
          icsData: {},
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.DELETE_SURVEY_PARTICIPANT_REQUEST:
      return {
        ...state,
        deleteSurveyParticipant: { fetching: true, success: false },
      };
    case actions.DELETE_SURVEY_PARTICIPANT_SUCCESS:
      return {
        ...state,
        deleteSurveyParticipant: {
          fetching: false,
          success: true,
        },
        apiMessage: action.payload.message,
        apiSuccess: true,
      };

    case actions.DELETE_SURVEY_PARTICIPANT_FAILED:
      return {
        ...state,
        deleteSurveyParticipant: {
          fetching: false,
          success: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.ICS_FILE_REQUEST:
      return {
        ...state,
        icsFile: { fetching: true, success: false },
      };
    case actions.ICS_FILE_SUCCESS:
      return {
        ...state,
        icsFile: {
          fetching: false,
          success: true,
          icsData: action.payload,
        },
        apiMessage: action.payload.message,
        apiSuccess: true,
      };
    case actions.ICS_FILE_FAILED:
      return {
        ...state,
        icsFile: {
          fetching: false,
          success: false,
          icsData: {},
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.DELETE_SURVEY_DATE_REQUEST:
      return {
        ...state,
        deleteSurveyDate: { fetching: true, success: false },
      };
    case actions.DELETE_SURVEY_DATE_SUCCESS:
      return {
        ...state,
        deleteSurveyDate: {
          fetching: false,
          success: true,
        },
        apiMessage: action.payload.message,
        apiSuccess: true,
      };
    case actions.DELETE_SURVEY_DATE_FAILED:
      return {
        ...state,
        deleteSurveyDate: {
          fetching: false,
          success: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.SURVEY_EMAIL_CONTENT_REQUEST:
      return {
        ...state,
        surveyEmailContent: { fetching: true, success: false },
      };
    case actions.SURVEY_EMAIL_CONTENT_SUCCESS:
      return {
        ...state,
        surveyEmailContent: {
          fetching: false,
          success: true,
          data: action.payload,
        },
        apiMessage: '',
        apiSuccess: true,
      };
    case actions.SURVEY_EMAIL_CONTENT_FAILED:
      return {
        ...state,
        surveyEmailContent: {
          fetching: false,
          success: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };

    case actions.SET_SURVEY_EMAIL_CONTENT_REQUEST:
      return {
        ...state,
        setSurveyEmailContent: { fetching: true, success: false },
      };
    case actions.SET_SURVEY_EMAIL_CONTENT_SUCCESS:
      return {
        ...state,
        setSurveyEmailContent: {
          fetching: false,
          success: true,
          data: action.payload,
        },
        apiMessage: action.payload.message,
        apiSuccess: true,
      };
    case actions.SET_SURVEY_EMAIL_CONTENT_FAILED:
      return {
        ...state,
        setSurveyEmailContent: {
          fetching: false,
          success: false,
        },
        apiSuccess: false,
        apiMessage: action.payload,
      };
    case actions.SURVEY_EMAIL_DOMAIN_REQUEST:
      return {
        ...state,
        setSurveyEmailContent: { fetching: true, success: false },
      };
    case actions.SURVEY_EMAIL_DOMAIN_SUCCESS:
      return {
        ...state,
        domainData: {
          fetching: false,
          success: true,
          data: action.payload.data,
        },
        apiMessage: '',
        apiSuccess: true,
      };
    case actions.SURVEY_EMAIL_DOMAIN_FAILED:
      return {
        ...state,
        apiSuccess: false,
        apiMessage: action.payload,
      };
  }
};

export default registrationForm;

export const getIsRegistrationFormFetching = state => state.fetching;
export const getRegistrationForm = state => state.registrationForm;
export const getaddPageFetching = state => state.addPageFetching;
// survey create
export const getDomainData = state => state.domainData;
export const createSurveyForm = state => state.survey;
export const getSurveys = state => state.getSurveys;
export const removeSurveys = state => state.removeSurveys;
export const getLogicOptionSurvey = state => state.getSurveyLogicOption;
export const setLogicSurvey = state => state.surveyLogic;
export const updateEmail = state => state.updateEmail;
export const getAllSurveyFetching = state => state.getAllSurveyFetching;
export const shareSurvey = state => state.shareSurvey;
export const getSurveyByID = state => state.getSurveyByID;
export const swapPageLoading = state => state.swapPageLoading;
export const getFolderList = state => state.folderList;
export const fetchCopySurvey = state => state.copySurvey;
export const fetchCopySurveyPage = state => state.copySurveyPage;
export const copyPageContentFetching = state => state.copyPageContentFetching;
export const reorderPageContent = state => state.reorderPage;
export const removeContent = state => state.removeContent;
export const removePage = state => state.removePage;
export const surveyArchived = state => state.surveyArchived;
export const surveyAnswer = state => state.surveyAnswers;
export const breakPage = state => state.breakPage;
export const mergePage = state => state.mergePage;
export const surveyName = state => state.surveyName;
export const getSurveyMeetings = state => state.survey_meetings;
export const apiSuccess = state => state.apiSuccess;
export const apiMessage = state => state.apiMessage;
export const fetchSurveyParticipant = state => state.surveyParticipant;
export const editIcsData = state => state.editIcsData;
export const deleteSurveyParticipant = state => state.deleteSurveyParticipant;
export const IcsFile = state => state.icsFile;
export const deleteSurveyDate = state => state.deleteSurveyDate;
export const surveyEmailContentData = state => state.surveyEmailContent.data;
export const setSurveyEmailContent = state => state.setSurveyEmailContent;
