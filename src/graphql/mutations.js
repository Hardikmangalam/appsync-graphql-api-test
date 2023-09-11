/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const deleteScreens = /* GraphQL */ `
  mutation DeleteScreens($meeting_id: Int, $id: Int) {
    deleteScreens(meeting_id: $meeting_id, id: $id) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const createScreens = /* GraphQL */ `
  mutation CreateScreens($input: CreateScreenInput!) {
    createScreens(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const createNote = /* GraphQL */ `
  mutation CreateNote($input: CreateScreenInput!) {
    createNote(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const setSelectedScreen = /* GraphQL */ `
  mutation SetSelectedScreen($id: Int!) {
    setSelectedScreen(id: $id) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const setLockScreen = /* GraphQL */ `
  mutation SetLockScreen($meeting_id: Int!, $isLockedScreen: Boolean!) {
    setLockScreen(meeting_id: $meeting_id, isLockedScreen: $isLockedScreen) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const screenLayout = /* GraphQL */ `
  mutation ScreenLayout($input: screenLayout!) {
    screenLayout(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const getSelectedScreen = /* GraphQL */ `
  mutation GetSelectedScreen($meetingId: Int!) {
    getSelectedScreen(meetingId: $meetingId) {
      statusCode
      body
      headers
    }
  }
`;
export const createQuestionByScreen = /* GraphQL */ `
  mutation CreateQuestionByScreen($input: CreateQuestionInput!) {
    createQuestionByScreen(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const updateQuestionByScreen = /* GraphQL */ `
  mutation UpdateQuestionByScreen($input: UpdateQuestionInput!) {
    updateQuestionByScreen(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const deleteQuestionByScreen = /* GraphQL */ `
  mutation DeleteQuestionByScreen($screen_id: Int, $id: Int) {
    deleteQuestionByScreen(screen_id: $screen_id, id: $id) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const updateQuestionOrders = /* GraphQL */ `
  mutation UpdateQuestionOrders($input: UpdateQuestionOrderInput!) {
    updateQuestionOrders(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const moveQuestionToScreen = /* GraphQL */ `
  mutation MoveQuestionToScreen($input: MoveQuestionToScreenInput!) {
    moveQuestionToScreen(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const saveToQuestionBank = /* GraphQL */ `
  mutation SaveToQuestionBank($input: CreateQuestionInput!) {
    saveToQuestionBank(input: $input) {
      statusCode
      body
      headers
    }
  }
`;
export const broadcastQuestionResult = /* GraphQL */ `
  mutation BroadcastQuestionResult(
    $screen_id: Int!
    $question_id: Int!
    $is_broadcast: Boolean!
  ) {
    broadcastQuestionResult(
      screen_id: $screen_id
      question_id: $question_id
      is_broadcast: $is_broadcast
    ) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const changeCardSize = /* GraphQL */ `
  mutation ChangeCardSize($input: CardResizeInput!) {
    changeCardSize(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const updateQuestionNumber = /* GraphQL */ `
  mutation UpdateQuestionNumber($input: UpdateQuestionNumberInput!) {
    updateQuestionNumber(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const createTemplate = /* GraphQL */ `
  mutation CreateTemplate($input: CreateTemplateInput!) {
    createTemplate(input: $input) {
      statusCode
      body
      headers
    }
  }
`;
export const useTemplateInSession = /* GraphQL */ `
  mutation UseTemplateInSession($input: UseTemplateInput!) {
    useTemplateInSession(input: $input) {
      statusCode
      body
      headers
    }
  }
`;
export const deleteTemplate = /* GraphQL */ `
  mutation DeleteTemplate($template_id: Int!) {
    deleteTemplate(template_id: $template_id) {
      statusCode
      body
      headers
    }
  }
`;
export const editTemplate = /* GraphQL */ `
  mutation EditTemplate($input: EditTemplateInput!) {
    editTemplate(input: $input) {
      statusCode
      body
      headers
    }
  }
`;
export const submitResponses = /* GraphQL */ `
  mutation SubmitResponses($input: SubmitResponsesInput!) {
    submitResponses(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const loginOrSignUp = /* GraphQL */ `
  mutation LoginOrSignUp($input: LoginInput!) {
    loginOrSignUp(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const loggedInUsers = /* GraphQL */ `
  mutation LoggedInUsers($user_id: String!, $isAdd: Boolean!) {
    loggedInUsers(user_id: $user_id, isAdd: $isAdd) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const validateAdminForTemplate = /* GraphQL */ `
  mutation ValidateAdminForTemplate($templateId: String, $authURI: String!) {
    validateAdminForTemplate(templateId: $templateId, authURI: $authURI) {
      statusCode
      body
      headers
    }
  }
`;
export const changeUserPermission = /* GraphQL */ `
  mutation ChangeUserPermission(
    $user_id: Int!
    $permission_id: Int!
    $isPromoting: Boolean
  ) {
    changeUserPermission(
      user_id: $user_id
      permission_id: $permission_id
      isPromoting: $isPromoting
    ) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const updateUserWaitlist = /* GraphQL */ `
  mutation UpdateUserWaitlist($is_waiting: Boolean!, $user_id: [Int]) {
    updateUserWaitlist(is_waiting: $is_waiting, user_id: $user_id) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const logoutUser = /* GraphQL */ `
  mutation LogoutUser($user_id: String, $autoLogout: Boolean) {
    logoutUser(user_id: $user_id, autoLogout: $autoLogout) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const createToken_twilio = /* GraphQL */ `
  mutation CreateToken_twilio($user_id: String) {
    createToken_twilio(user_id: $user_id) {
      statusCode
      body
      headers
    }
  }
`;
export const setMuteStatus = /* GraphQL */ `
  mutation SetMuteStatus($input: muteStatusInput!) {
    setMuteStatus(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const getMuteStatus = /* GraphQL */ `
  mutation GetMuteStatus($meetingId: Int!) {
    getMuteStatus(meetingId: $meetingId) {
      statusCode
      body
      headers
    }
  }
`;
export const getTwilioNumber = /* GraphQL */ `
  mutation GetTwilioNumber($meetingId: Int!) {
    getTwilioNumber(meetingId: $meetingId) {
      statusCode
      body
      headers
    }
  }
`;
export const updateObserverUser = /* GraphQL */ `
  mutation UpdateObserverUser($full_name: String!, $user_id: Int!) {
    updateObserverUser(full_name: $full_name, user_id: $user_id) {
      statusCode
      body
      headers
    }
  }
`;
export const quickAnswer = /* GraphQL */ `
  mutation QuickAnswer($input: quickAnswerInput!) {
    quickAnswer(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const sendPublicChat = /* GraphQL */ `
  mutation SendPublicChat($input: publicChatMainInput!) {
    sendPublicChat(input: $input) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const startStopMeeting = /* GraphQL */ `
  mutation StartStopMeeting($twilio_number: Int, $isStart: Boolean!) {
    startStopMeeting(twilio_number: $twilio_number, isStart: $isStart) {
      statusCode
      body
      headers
      meeting_id
    }
  }
`;
export const quickChat = /* GraphQL */ `
  mutation QuickChat($input: quickChatInput!) {
    quickChat(input: $input) {
      statusCode
      body
      headers
    }
  }
`;
