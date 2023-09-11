/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */

import { call, put, takeLatest } from 'redux-saga/effects';

import * as api from '../apis/registrationForm';
import * as actions from '../actions/registrationForm';
import * as appActions from '../actions/app';

function* createRegistrationFormSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.createRegistrationForm, action.payload);
    success
      ? yield put(actions.createRegistrationPageSuccess(data))
      : yield put(actions.createRegistrationPageFailed(message));
  } catch (error) {
    yield put(actions.createRegistrationPageFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* addNewRegistrationPageSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.addNewRegistrationPage, action.payload);

    success
      ? yield put(actions.createAddNewPageSuccess(data))
      : yield put(actions.createAddNewPageFailed(message));
  } catch (error) {
    yield put(actions.createAddNewPageFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* mergeRegistrationPagesSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.mergeRegistrationPages, action.payload);

    success
      ? yield put(actions.mergeRegistrationPageSuccess(data))
      : yield put(actions.mergeRegistrationPageFailed(message));
  } catch (error) {
    yield put(actions.mergeRegistrationPageFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* deleteRegistrationPageSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.deleteRegistrationPage, action.payload);

    success
      ? yield put(actions.deleteRegistrationPageSuccess(data))
      : yield put(actions.deleteRegistrationPageFailed(message));
  } catch (error) {
    yield put(actions.deleteRegistrationPageFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* getSurveyByIdSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.getSurveyById, action.payload);
    if (success) {
      yield put(actions.getSurveyByIdSuccess(data));
    } else {
      window.location.href = `/invalid`;
      yield put(actions.getSurveyByIdFailed(message));
    }
  } catch (error) {
    // yield put(
    //   appActions.appReceiveAlert({
    //     message: 'Failed to fetch the status of broadcasting!',
    //   }),
    // );
    yield put(actions.getSurveyByIdFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* createSurvey(action) {
  const createSurveyData = action.payload;
  try {
    yield put(appActions.appStartFetching());
    const {
      data: { data, success, message },
    } = yield call(api.createSurvey, createSurveyData);
    success
      ? yield put(actions.createSurveySuccess(data))
      : yield put(actions.createSurveyFailed(message));
  } catch (error) {
    yield put(actions.createSurveyFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* createSurveyFolderSaga(action) {
  try {
    yield put(appActions.appStartFetching());
    const {
      data: { data, success, message },
    } = yield call(api.createSurveyFolder, action.payload);
    success
      ? yield put(actions.createSurveyFolderSuccess(data))
      : yield put(actions.createSurveyFolderFailed(message));
  } catch (error) {
    yield put(actions.createSurveyFolderFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* fetchSurveysSaga(action) {
  try {
    yield put(appActions.appStartFetching());
    const {
      data: { data, success, message },
    } = yield call(api.fetchSurveys, action.payload);
    success
      ? yield put(actions.surveysRequestSuccess(data.data))
      : yield put(actions.surveysRequestFailed(message));
  } catch (error) {
    // yield put(
    //   appActions.appReceiveAlert({
    //     message: 'Failed to fetch the status of broadcasting!',
    //   }),
    // );
    yield put(actions.surveysRequestFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* removeSurveySaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success },
    } = yield call(api.removeSurveys, action.payload);

    success
      ? yield put(actions.surveysRemoveSuccess(data))
      : yield put(actions.surveysRemoveFailed(data || ''));
  } catch (error) {
    yield put(actions.surveysRemoveFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* swapPagesSaga(action) {
  const swapData = action.payload;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.swapPage, swapData);

    success
      ? yield put(actions.RegistrationSwapPageSuccess(data))
      : yield put(actions.RegistrationSwapPageFailed(message));
  } catch (error) {
    yield put(actions.RegistrationSwapPageFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* getLogicOptionSurveySaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.getSurveyLogicOption, action.payload);

    success
      ? yield put(actions.surveyLogicOptionSuccess(data.data))
      : yield put(actions.surveyLogicOptionFailed(message));
  } catch (error) {
    yield put(actions.surveyLogicOptionFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* breakPagesSaga(action) {
  const breakPageData = action.payload;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.breakPage, breakPageData);

    success
      ? yield put(actions.RegistrationBreakPageSuccess(data))
      : yield put(actions.RegistrationBreakPageFailed(message));
  } catch (error) {
    yield put(actions.RegistrationBreakPageFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* setLogicSurvey(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.setLogic, action.payload);

    success
      ? yield put(actions.surveyLogicSuccess(data))
      : yield put(actions.surveyLogicFailed(message));
  } catch (error) {
    yield put(actions.surveyLogicFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* updateEmailSaga(action) {
  const breakPageData = action.payload;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.updateEmail, breakPageData);

    success
      ? yield put(actions.updateEmailSuccess(data))
      : yield put(actions.updateEmailFailed(message));
  } catch (error) {
    yield put(actions.updateEmailFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* getShareSurvey(action) {
  const dataNew = action.payload.data;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.shareSurvey, dataNew);

    success
      ? yield put(actions.shareSurveySuccess(data))
      : yield put(actions.shareSurveyFailed(message));
  } catch (error) {
    // yield put(
    //   appActions.appReceiveAlert({
    //     message: 'Failed to fetch the status of broadcasting!',
    //   }),
    // );
    yield put(actions.shareSurveyFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* removeContentRegistrationPage(action) {
  const addPayload = action.payload.data;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.removeRegistrationPageContent, addPayload);

    success
      ? yield put(actions.deleteRegistrationContentPageSuccess(data))
      : yield put(actions.deleteRegistrationContentPageFailed(message));
  } catch (error) {
    yield put(
      actions.deleteRegistrationContentPageFailed('Something went wrong'),
    );
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* getFolderListSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.getFolderList, action.payload);
    success
      ? yield put(actions.folderListSuccess(data))
      : yield put(actions.folderListFailed(message));
  } catch (error) {
    yield put(actions.folderListFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* fetchCopySurveySaga(action) {
  const info = action.payload;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.copySurveyRequest, info);
    success
      ? yield put(actions.copySurveySuccess(data))
      : yield put(actions.copySurveyFailed(message));
  } catch (error) {
    yield put(actions.copySurveyFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* fetchCopySurveyPageSaga(action) {
  const info = action.payload;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.copySurveyPageRequest, info);

    success
      ? yield put(actions.copySurveyPageSuccess(data))
      : yield put(actions.copySurveyPageFailed(message));
  } catch (error) {
    yield put(actions.copySurveyPageFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* copySurveyPageContentSaga(action) {
  const copy = action.payload;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.addUpdatePageContent, copy);

    success
      ? yield put(actions.AddUpdateContentPageRequestSuccess(data))
      : yield put(actions.AddUpdateContentPageRequestFailed(message));
  } catch (error) {
    yield put(
      actions.AddUpdateContentPageRequestFailed('Something went wrong'),
    );
  } finally {
    yield put(appActions.appStopFetching());
  }
}
function* setSurveyAnswerSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.setSurveyAnswerData, action.payload);

    success
      ? yield put(actions.surveyAnswerRequestSuccess(data))
      : yield put(actions.surveyAnswerRequestFailed(message));
  } catch (error) {
    yield put(actions.surveyAnswerRequestFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* reOrderRegistrationPage(action) {
  const addPayload = action.payload.data;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.reorderPageContent, addPayload);

    success
      ? yield put(actions.reorderPageSuccess(data))
      : yield put(actions.reorderPageFailed(message));
  } catch (error) {
    yield put(actions.reorderPageFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* archiveSurveySaga(action) {
  const addPayload = action.payload;
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.surveyArchived, addPayload);

    success
      ? yield put(actions.surveyArchivedSuccess(data))
      : yield put(actions.surveyArchivedFailed(message));
  } catch (error) {
    yield put(actions.surveyArchivedFailed('Something went wrong'));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* getMeetingsForSurveySaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.getMeetingsForSurvey, action.payload);

    success
      ? yield put(actions.getMeetingsForSurveySuccess(data))
      : yield put(actions.getMeetingsForSurveyFailed(message));
  } catch (error) {
    // yield put(
    //   appActions.appReceiveAlert({
    //     message: 'Failed to fetch the status of broadcasting!',
    //   }),
    // );
    yield put(actions.getSurveyByIdFailed(error.response.message));
  } finally {
    yield put(appActions.appStopFetching());
  }
}
function* removeAllLogicSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.removeAllLogic, action.payload);

    success
      ? yield put(actions.removeAllLogicSuccess(data))
      : yield put(actions.removeAllLogicFailed(message));
  } catch (error) {
    // yield put(
    //   appActions.appReceiveAlert({
    //     message: 'Failed to fetch the status of broadcasting!',
    //   }),
    // );
    yield put(actions.removeAllLogicFailed(error.response.message));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* surveyParticipantSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success, message },
    } = yield call(api.getSurveyParticipant, action.payload);
    success
      ? yield put(actions.surveyParticipantSuccess(data.data))
      : yield put(actions.surveyParticipantFailed(message));
  } catch (error) {
    yield put(actions.surveyParticipantFailed(error));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* editIcsSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const { data } = yield call(api.editIcsData, action.payload);

    data.success
      ? yield put(actions.editIcsSuccess(data.data))
      : yield put(actions.editIcsFailed(data.data.message));
  } catch (error) {
    yield put(actions.editIcsFailed(error));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* deleteSurveyParticipant(action) {
  try {
    yield put(appActions.appStartFetching());

    const { data } = yield call(api.deleteSurveyParticipant, action.payload);

    data.success
      ? yield put(actions.deleteSurveyParticipantSuccess(data.data))
      : yield put(actions.deleteSurveyParticipantFailed(data.data.message));
  } catch (error) {
    yield put(actions.deleteSurveyParticipantFailed(error));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* icsDataSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const { data } = yield call(api.icsFileData, action.payload);
    data.success
      ? yield put(actions.icsFileSuccess(data.data))
      : yield put(actions.icsFileFailed(data.data.message));
  } catch (error) {
    yield put(actions.icsFileFailed(error));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* deleteSurveyDateSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const {
      data: { data, success },
    } = yield call(api.deleteSurveyDate, JSON.stringify(action.payload));
    success
      ? yield put(actions.deleteSurveyDateSuccess(data.data))
      : yield put(actions.deleteSurveyDateFailed(data.message));
  } catch (error) {
    yield put(actions.deleteSurveyDateFailed(error));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* surveyEmailContentSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const { data } = yield call(api.surveyEmailContentData, action.payload);
    data.success
      ? yield put(actions.surveyEmailContentSuccess(data.data))
      : yield put(actions.surveyEmailContentFailed(data.data.message));
  } catch (error) {
    yield put(actions.surveyEmailContentFailed(error));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* setSurveyEmailContentSaga(action) {
  try {
    yield put(appActions.appStartFetching());
    const { data } = yield call(api.setSurveyEmailContentData, action.payload);
    if (data.success) {
      yield put(actions.setSurveyEmailContentSuccess(data.data));
      yield put(
        actions.requestSurveyEmailContent({
          surveyId: action.payload.surveyId,
        }),
      );
    } else {
      yield put(actions.setSurveyEmailContentFailed(data.message));
    }
  } catch (error) {
    yield put(actions.setSurveyEmailContentFailed(error));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* surveyEmailDomainSaga(action) {
  try {
    yield put(appActions.appStartFetching());

    const { data } = yield call(api.surveyEmailDomainData, action.payload);
    data.success
      ? yield put(actions.setEmailDomainSuccess(data.data))
      : yield put(actions.setEmailDomainFailed(data.data.message));
  } catch (error) {
    yield put(actions.setEmailDomainFailed(error));
  } finally {
    yield put(appActions.appStopFetching());
  }
}

function* watchConfigSaga() {
  yield takeLatest(
    actions.REGISTRATION_PAGE_REQUEST,
    createRegistrationFormSaga,
  );
  yield takeLatest(actions.CREATE_SURVEY_REQUEST, createSurvey);
  yield takeLatest(actions.GET_SURVEYS_REQUEST, fetchSurveysSaga);
  yield takeLatest(actions.SURVEYS_REMOVE_REQUEST, removeSurveySaga);
  yield takeLatest(
    actions.REGISTRATION_ADD_PAGE_REQUEST,
    addNewRegistrationPageSaga,
  );
  yield takeLatest(
    actions.DELETE_REGISTRATION_PAGE_REQUEST,
    deleteRegistrationPageSaga,
  );
  yield takeLatest(
    actions.MERGE_REGISTRATION_PAGE_REQUEST,
    mergeRegistrationPagesSaga,
  );
  yield takeLatest(actions.SURVEY_BY_ID_REQUEST, getSurveyByIdSaga);
  yield takeLatest(actions.REGISTRATION_SWAP_PAGE_REQUEST, swapPagesSaga);
  yield takeLatest(
    actions.CREATE_SURVEY_FOLDER_REQUEST,
    createSurveyFolderSaga,
  );
  yield takeLatest(actions.REGISTRATION_BREAK_PAGE_REQUEST, breakPagesSaga);
  yield takeLatest(
    actions.SURVEYS_LOGIC_OPTION_REQUEST,
    getLogicOptionSurveySaga,
  );
  yield takeLatest(actions.SURVEY_LOGIC_REQUEST, setLogicSurvey);
  yield takeLatest(actions.UPDATE_EMAIL_REQUEST, updateEmailSaga);
  yield takeLatest(actions.SHARE_SURVEY_REQUEST, getShareSurvey);
  yield takeLatest(
    actions.REGISTRATION_REMOVE_CONTENT_REQUEST,
    removeContentRegistrationPage,
  );
  yield takeLatest(actions.GET_FOLDER_LIST_REQUEST, getFolderListSaga);
  yield takeLatest(actions.COPY_SURVEY_REQUEST, fetchCopySurveySaga);
  yield takeLatest(actions.COPY_SURVEY_PAGE_REQUEST, fetchCopySurveyPageSaga);
  yield takeLatest(
    actions.REGISTRATION_ADD_UPDATE_CONTENT_PAGE_REQUEST,
    copySurveyPageContentSaga,
  );
  yield takeLatest(actions.REORDER_PAGE_REQUEST, reOrderRegistrationPage);
  yield takeLatest(actions.SURVEY_ARCHIVED_REQUEST, archiveSurveySaga);
  yield takeLatest(actions.SURVEY_ANSWERS_REQUEST, setSurveyAnswerSaga);
  yield takeLatest(
    actions.GET_MEETINGS_FOR_SURVEY_REQUEST,
    getMeetingsForSurveySaga,
  );
  yield takeLatest(actions.REMOVE_ALL_LOGIC_REQUEST, removeAllLogicSaga);
  yield takeLatest(actions.SURVEY_PARTICIPANT_REQUEST, surveyParticipantSaga);
  yield takeLatest(actions.EDIT_ICS_REQUEST, editIcsSaga);
  yield takeLatest(
    actions.DELETE_SURVEY_PARTICIPANT_REQUEST,
    deleteSurveyParticipant,
  );
  yield takeLatest(actions.ICS_FILE_REQUEST, icsDataSaga);
  yield takeLatest(actions.DELETE_SURVEY_DATE_REQUEST, deleteSurveyDateSaga);
  yield takeLatest(
    actions.SURVEY_EMAIL_CONTENT_REQUEST,
    surveyEmailContentSaga,
  );
  yield takeLatest(
    actions.SET_SURVEY_EMAIL_CONTENT_REQUEST,
    setSurveyEmailContentSaga,
  );
  yield takeLatest(actions.SURVEY_EMAIL_DOMAIN_REQUEST, surveyEmailDomainSaga);
}

export default watchConfigSaga;
