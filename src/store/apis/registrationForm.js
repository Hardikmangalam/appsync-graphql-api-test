/* eslint-disable no-else-return */
import restApiClient from './index';
import resHandler from '../../utils/resHandler';
import { decryptData } from '../../graphqlOperations/encryprWrapper';

export const createRegistrationForm = async pageData => {
  try {
    const data = await restApiClient.post(
      `/registration/CreateRegistrationPage?surveyId=${pageData.id}`,
      pageData.data,
    );
    return resHandler(data, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const createSurvey = async data => {
  try {
    const datas = await restApiClient.post(`/registration/CreateSurvey`, data);
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const fetchSurveys = async ({ surveyType, id }) => {
  try {
    let data;
    if (surveyType === 'Recent') {
      data = await restApiClient.get(`/registration/GetAllSurvey?recent=true`);
    } else if (surveyType === 'Trash') {
      data = await restApiClient.get(`/registration/GetAllSurvey?trash=true`);
    } else if (surveyType === 'Archived') {
      data = await restApiClient.get(
        `/registration/GetAllSurvey?archived=true`,
      );
    } else if (id) {
      data = await restApiClient.get(
        `/registration/GetAllSurvey?folderId=${id}`,
      );
    } else {
      data = await restApiClient.get(`/registration/GetAllSurvey`);
    }
    return resHandler(data, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const removeSurveys = async removeId => {
  try {
    const datas = await restApiClient.delete(`/registration/DeleteSurvey`, {
      data: removeId,
    });
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const addNewRegistrationPage = async data => {
  try {
    const datas = await restApiClient.post(
      `registration/AddPageBetweenPages?surveyId=${data.id}&page_no=${data.pageNo}`,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const deleteRegistrationPage = async data => {
  try {
    const datas = await restApiClient.delete(
      `registration/DeletePage?surveyId=${data.id}&page_no=${data.pageNumber}`,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const mergeRegistrationPages = async ({ id, mainPage, mergePage }) => {
  try {
    const data = await restApiClient.post(
      `registration/MergePages?surveyId=${id}&mainPage=${mainPage}&mergePage=${mergePage}`,
    );
    return resHandler(data, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const getSurveyById = async data => {
  try {
    const datas = await restApiClient.get(
      `registration/GetSurveyById?surveyId=${data.id}${
        data.finalMeetid ? `&meetingId=${data.finalMeetid}` : ''
      } ${data && data.isPreview ? `&isPreview=${data.isPreview}` : ''} ${
        data && data.customUrl ? `&customUrl=${data.customUrl}` : ''
      }`,
    );
    const newData = {
      data: JSON.parse(decryptData(datas.data)),
    };

    // return resHandler(datas, null);
    return resHandler(newData, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const swapPage = async swapData => {
  try {
    const data = await restApiClient.post(
      `/registration/SwapPages?surveyId=${swapData.id}`,
      swapData.swapDataVal,
    );
    return resHandler(data, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const createSurveyFolder = async data => {
  try {
    const datas = await restApiClient.post(
      `/surveyFolder/createUpdateFolder`,
      data,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const breakPage = async breakPageData => {
  try {
    const data = await restApiClient.post(
      `/registration/BreakPage?surveyId=${breakPageData.id}&page_no=${breakPageData.pageIndex}&content_index=${breakPageData.contentIndex}`,
    );
    const res = resHandler(data, null);
    return res;
  } catch (error) {
    const errorRes = resHandler(error, true);
    return errorRes;
  }
};

export const getSurveyLogicOption = async data => {
  try {
    const datas = await restApiClient.get(
      `registration/getLogicQuestions?surveyId=${data.id}&content_index=${data.contentIndex}&page_no=${data.contentPage}`,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const setLogic = async data => {
  try {
    const datas = await restApiClient.put(`registration/setLogic`, data);
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const updateEmail = async payload => {
  try {
    const datas = await restApiClient.post(
      `/registrationEmail/createUpdateEmailActions`,
      payload,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const shareSurvey = async name => {
  try {
    const datas = await restApiClient.get(
      `/registration/shareLink?surveyId=${name.surveyId}&host=${name.url}&customUrl=${name.customUrl}`,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const removeRegistrationPageContent = async removeData => {
  try {
    const datas = await restApiClient.delete(
      `registration/RemoveContent?surveyId=${removeData.surveyId}&contentid=${removeData.contentid}&pageId=${removeData.pageId}`,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const getFolderList = async data => {
  try {
    let datas;
    if (data) {
      datas = await restApiClient.get(
        `surveyFolder/getFolderList?isSurveyList=${data}`,
      );
    } else {
      datas = await restApiClient.get(`surveyFolder/getFolderList`);
    }
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const copySurveyRequest = async data => {
  try {
    const datas = await restApiClient.post(`registration/copySurvey`, data);
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const copySurveyPageRequest = async data => {
  try {
    const datas = await restApiClient.post(
      `registration/CopyPage?surveyId=${data.surveyId}&pageId=${data.pageId}`,
      data,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const addUpdatePageContent = async addUpdate => {
  try {
    const datas = await restApiClient.post(
      `/registration/AddUpdateContent`,
      addUpdate,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const reorderPageContent = async reorderData => {
  try {
    const datas = await restApiClient.post(
      `registration/MovePageContent?surveyId=${reorderData.id}`,
      reorderData,
    );

    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const surveyArchived = async data => {
  try {
    const datas = await restApiClient.post(`/registration/setArchived`, data);
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const setSurveyAnswerData = async data => {
  try {
    const datas = await restApiClient.post(`/surveyAnswers/saveAnswer`, data);
    const newData = {
      data: JSON.parse(decryptData(datas.data)),
    };

    return resHandler(newData, null);
    // return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const getMeetingsForSurvey = async data => {
  try {
    const datas = await restApiClient.get(
      `/registration/GetMeetingForSurvey?surveyId=${data.id}${
        data.isPreview ? `&isPreview=${data.isPreview}` : ''
      }`,
    );

    const newData = {
      data: JSON.parse(decryptData(datas.data)),
    };

    // return resHandler(datas, null);
    return resHandler(newData, null);
  } catch (error) {
    return resHandler(error, true);
  }
};
export const removeAllLogic = async data => {
  try {
    const datas = await restApiClient.get(
      `/registration/resetLogicInContent?id=${data.id}&surveyId=${data.surveyId}`,
    );

    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const getSurveyParticipant = async data => {
  try {
    const datas = await restApiClient.get(
      `/surveyAnswers/GetParticipantForSurvey?surveyId=${data.surveyId}`,
    );

    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const editIcsData = async data => {
  try {
    const datas = await restApiClient.post(
      `/registration/updateIcsContent`,
      data,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const deleteSurveyParticipant = async data => {
  try {
    const datas = await restApiClient.delete(
      `/registration/deleteSurveyParticipants`,
      {
        data: {
          surveyId: data.surveyId,
          id: data.id,
        },
      },
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const icsFileData = async data => {
  try {
    const datas = await restApiClient.get(
      `/surveyAnswers/invite?meetingId=${data}&isObjectRes=true`,
    );

    // const newData = {
    //   data: JSON.parse(decryptData(datas.data)),
    // };

    // return resHandler(newData, null);
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};
export const deleteSurveyDate = async data => {
  try {
    const datas = await restApiClient.post(
      `/surveyFolder/deleteSurveyDate`,
      data,
    );
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const surveyEmailContentData = async data => {
  try {
    const datas = await restApiClient.post(`/survey/emailContent`, data);
    const newData = {
      data: JSON.parse(decryptData(datas.data)),
    };

    return resHandler(newData, null);
    // return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};
export const setSurveyEmailContentData = async data => {
  try {
    const datas = await restApiClient.post(`/survey/setEmailContent`, data);
    return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};

export const surveyEmailDomainData = async data => {
  try {
    const datas = await restApiClient.get(
      `/surveyFolder/getEmailDomain?surveyId=${data.surveyId}`,
    );
    const newData = {
      data: JSON.parse(decryptData(datas.data)),
    };

    return resHandler(newData, null);
    // return resHandler(datas, null);
  } catch (error) {
    return resHandler(error, true);
  }
};
