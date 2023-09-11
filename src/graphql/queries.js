/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getScreens = /* GraphQL */ `
  query GetScreens($meeting_id: Int) {
    getScreens(meeting_id: $meeting_id) {
      statusCode
      body
      headers
    }
  }
`;
export const getScreenLayout = /* GraphQL */ `
  query GetScreenLayout($screen_id: Int!) {
    getScreenLayout(screen_id: $screen_id) {
      statusCode
      body
      headers
    }
  }
`;
export const getQuestionsByScreen = /* GraphQL */ `
  query GetQuestionsByScreen($screen_id: Int, $template_id: Int) {
    getQuestionsByScreen(screen_id: $screen_id, template_id: $template_id) {
      statusCode
      body
      headers
    }
  }
`;
export const getQuestionsFromBank = /* GraphQL */ `
  query GetQuestionsFromBank {
    getQuestionsFromBank {
      statusCode
      body
      headers
    }
  }
`;
export const getUserCountForQuestions = /* GraphQL */ `
  query GetUserCountForQuestions($screen_id: Int!) {
    getUserCountForQuestions(screen_id: $screen_id) {
      statusCode
      body
      headers
    }
  }
`;
export const getQuestionNumber = /* GraphQL */ `
  query GetQuestionNumber($meetingId: Int, $templateView: Boolean) {
    getQuestionNumber(meetingId: $meetingId, templateView: $templateView) {
      statusCode
      body
      headers
    }
  }
`;
export const getTemplateList = /* GraphQL */ `
  query GetTemplateList {
    getTemplateList {
      statusCode
      body
      headers
    }
  }
`;
export const loadTemplate = /* GraphQL */ `
  query LoadTemplate($template_id: Int!) {
    loadTemplate(template_id: $template_id) {
      statusCode
      body
      headers
    }
  }
`;
export const checkValidMeeting = /* GraphQL */ `
  query CheckValidMeeting($meeting_id: Int!) {
    checkValidMeeting(meeting_id: $meeting_id) {
      statusCode
      body
      headers
    }
  }
`;
export const checkValidMeetingPostgres = /* GraphQL */ `
  query CheckValidMeetingPostgres($meeting_id: Int!) {
    checkValidMeetingPostgres(meeting_id: $meeting_id) {
      statusCode
      body
      headers
    }
  }
`;
export const listAvailableNumber = /* GraphQL */ `
  query ListAvailableNumber($meeting_id: Int!) {
    listAvailableNumber(meeting_id: $meeting_id) {
      statusCode
      body
      headers
    }
  }
`;
export const checkDBConnection = /* GraphQL */ `
  query CheckDBConnection {
    checkDBConnection {
      statusCode
      body
      headers
    }
  }
`;
export const getPermissions = /* GraphQL */ `
  query GetPermissions {
    getPermissions {
      statusCode
      body
      headers
    }
  }
`;
export const getAllLoggedInUsers = /* GraphQL */ `
  query GetAllLoggedInUsers {
    getAllLoggedInUsers {
      statusCode
      body
      headers
    }
  }
`;
export const userWaitlist = /* GraphQL */ `
  query UserWaitlist {
    userWaitlist {
      statusCode
      body
      headers
    }
  }
`;
export const getPublicChat = /* GraphQL */ `
  query GetPublicChat($meeting_id: Int!) {
    getPublicChat(meeting_id: $meeting_id) {
      statusCode
      body
      headers
    }
  }
`;
export const getChat = /* GraphQL */ `
  query GetChat($id: String!) {
    getChat(id: $id) {
      statusCode
      body
      headers
    }
  }
`;
