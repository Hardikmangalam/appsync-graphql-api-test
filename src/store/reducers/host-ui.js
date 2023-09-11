/* eslint-disable no-case-declarations */
import { getSecureSessionData } from '../../graphqlOperations/encryprWrapper';
import * as actions from '../actions/host-ui';

const initialState = {
  host_ui: {
    chat_expand: false,
    scale_view: true,
    layout_view: 'POD',
    selected_screen: {},
    update_Description: '',
    update_Title: '',
    screen_layout: [],
  },
  screens: [],
  questions: [],
  questionNumbers: [],
  templates: [],
  questionBank: [],
  attendeesData: JSON.parse(getSecureSessionData('Attendees')) || [],
  updateUserData: JSON.parse(getSecureSessionData('Waitlist')) || [],
  cardResizeData: [],
  reloadCallTimer: [],
  twilio_Number: null,
  cookieConstent: [true, 'true'].includes(getSecureSessionData('CookieConsent'))
    ? true
    : false,
  meetingGroupChatId: [],
  meetingGroupChatIndex: [],
  // isStartParticipantMeeting: false,
};
const hostUI = (state = initialState, action) => {
  switch (action.type) {
    case actions.HOST_UI:
      return { ...state, host_ui: action.payload };
    case actions.UPDATE_SCLAE_VIEW:
      return { ...state, host_ui: { ...state.host_ui, ...action.payload } };
    case actions.GET_SCREEN_SUCCESS:
      return { ...state, screens: action.payload };
    case actions.SCREEN_ADD_SUCCESS:
      return {
        ...state,
        host_ui: { ...state.host_ui, selected_screen: action.payload },
        screens: [
          ...state.screens.filter(
            e => e.id !== undefined && e.id !== action.payload.id,
          ),
          action.payload,
        ].sort((a, b) => a.display_seq - b.display_seq),
      };
    case actions.GET_QUESTION_SUCCESS:
      return {
        ...state,
        questions: action.payload,
      };
    case actions.GET_QUESTION_NUMBERS_SUCCESS:
      return {
        ...state,
        questionNumbers: action.payload,
      };
    case actions.SCREEN_ADD_REQUEST:
      return { ...state, screens: [...state.screens, action.payload] };
    case actions.DELETE_SCREEN_SUCCESS:
      return {
        ...state,
        screens: state.screens.filter(
          e => e.id.toString() !== action.payload.screen_id.toString(),
        ),
      };
    case actions.DELETE_QUESTION_SUCCESS:
      return {
        ...state,
        questions: state.questions.filter(
          e => e.id.toString() !== action.payload.id.toString(),
        ),
      };
    case actions.QUESTION_ADD_SUCCESS:
      return {
        ...state,
        questions: [...state.questions, action.payload].sort(
          (a, b) => a.que_display_seq - b.que_display_seq,
        ),
      };
    case actions.QUESTION_UPDATE_SUCCESS:
      const arr = [];
      state.questions.filter(el => {
        if (el.id == action.payload.id) {
          el = {
            ...el,
            label: action.payload.label,
            response: action.payload.response,
          };
        }
        arr.push(el);
      });

      return {
        ...state,
        questions: arr.sort((a, b) => a.que_display_seq - b.que_display_seq),
      };
    case actions.QUESTION_ORDER_SUCCESS:
      const { question_ids } = action.payload;
      let question_arr = [];
      for (let i = 0; i < question_ids.length; i++) {
        const ele = question_ids[i];
        question_arr.push({
          ...state.questions.find(e => e.id.toString() === ele.toString()),
          que_display_seq: i,
        });
      }
      return {
        ...state,
        questions: question_arr.sort(
          (a, b) => a.que_display_seq - b.que_display_seq,
        ),
      };
    case actions.GET_TEMPLATE_SUCCESS:
      return { ...state, templates: action.payload };
    case actions.GET_QUESTION_BANK_SUCCESS:
      return { ...state, questionBank: action.payload };
    case actions.UPDATE_SELECTED_SCREEN_SUCCESS:
      return {
        ...state,
        host_ui: { ...state.host_ui, selected_screen: action.payload },
      };
    case actions.GET_ATTENDEES_SUCCESS:
      return { ...state, attendeesData: action.payload };
    case actions.UPDATE_USER_SUCCESS:
      return { ...state, updateUserData: action.payload };
    case actions.GET_QUICK_ANSWER_SUCCESS:
      const { userCount, meetingGroupIds, meetingGroupIndex } = action.payload;
      const questionData = state.questions.find(
        el => el.id.toString() == action.payload.question_id.toString(),
      );
      const existingAnswer = [
        ...questionData.response.filter(({ id, message }) => id !== 'chat-id'),
      ];
      questionData.userCount = userCount;
      questionData.response = questionData.response = [
        ...existingAnswer,
        {
          id: action.payload.id,
          message: action.payload.message,
          user_id: action.payload.user_id,
          input_data_type: 3,
          question_id: action.payload.question_id,
          res_display_seq: existingAnswer.length + 1,
          ratio: '0.00',
          meetingGroupIds: meetingGroupIds,
          meetingGroupIndex: meetingGroupIndex,
        },
      ];

      return {
        ...state,
        questions: [
          ...state.questions.filter(
            ele => ele.id.toString() !== action.payload.question_id.toString(),
          ),
          questionData,
        ].sort((a, b) => a.que_display_seq - b.que_display_seq),
      };

    case actions.GET_CARD_RESIZE_SUCCESS:
      let cardQues = null;
      cardQues = state.questions.find(
        obj => obj.id === action.payload.question_id.toString(),
      );
      cardQues = {
        ...cardQues,
        metadata: {
          height: action.payload.height,
          width: action.payload.width,
        },
      };
      return {
        ...state,
        cardResizeData: action.payload,

        questions: [
          ...state.questions.map((obj, idx) =>
            obj.id !== action.payload.question_id.toString() ? obj : cardQues,
          ),
        ],
      };

    case actions.GET_SUBMIT_RESPONSE_SUCCESS:
      let fromSubscription = action.payload.fromSubscription;

      let questionObj = state.questions.find(
        que => que.id.toString() === action.payload.question_id.toString(),
      );
      if (questionObj) {
        if (!fromSubscription) {
          questionObj = {
            ...questionObj,
            que_display_seq: action.payload.question_obj.que_display_seq,
            isSubmitted: action.payload.question_obj.isSubmitted,
            totalUsers: action.payload.question_obj.totalUsers,
            userCount: action.payload.question_obj.userCount,
          };
        }
        let resObj = null;
        questionObj.response = questionObj.response.map(ans => {
          resObj = action.payload.question_obj.response.find(
            newAns => newAns.id.toString() === ans.id.toString(),
          );
          return {
            ...ans,
            isChecked: fromSubscription ? ans.isChecked : resObj.isChecked,
            ratio: resObj.ratio,
            userCount: resObj.userCount,
          };
        });
      }

      return {
        ...state,
        questions: [
          ...state.questions.filter(
            ele => ele.id.toString() !== action.payload.question_id.toString(),
          ),
          questionObj ? questionObj : action.payload.question_obj,
        ].sort((a, b) => a.que_display_seq - b.que_display_seq),
      };

    case actions.UPDATE_NOTES:
      return {
        ...state,
        host_ui: {
          ...state.host_ui,
          update_Description: action.payload.note_desc,
          update_Title: action.payload.note_title,
        },
      };
    case actions.GET_LAYOUT_SUCCESS:
      return {
        ...state,
        host_ui: {
          ...state.host_ui,
          screen_layout: action.payload,
        },
      };
    case actions.GET_TWILIO_NUMBER:
      return {
        ...state,
        twilio_Number: action.payload,
      };

    case actions.UPDATE_RELOAD_CALL_TIMER_STATE:
      return {
        ...state,
        reloadCallTimer: action.payload,
      };
    case actions.MANAGE_COOKIE:
      return {
        ...state,
        cookieConstent: action.payload.isEnable,
      };

    case actions.GROUP_CHAT:
      return {
        ...state,
        meetingGroupChatId: action.payload,
      };
    case actions.GROUP_CHAT_INDEX:
      return {
        ...state,
        meetingGroupChatIndex: action.payload,
      };
    // case actions.START_MEETING_PART:
    //   return {
    //     ...state,
    //     isStartParticipantMeeting: action.payload,
    //   };

    default:
      return state;
  }
};

export default hostUI;
export const getHostUI = state => state.host_ui;
export const getDialInNo = state => state.twilio_Number;
export const getPartMeetState = state => state.isStartParticipantMeeting;
export const getCookieConstent = state => state.cookieConstent;
export const getManageGroupChat = state => state.meetingGroupChatId;
export const getManageGroupChatIndex = state => state.meetingGroupChatIndex;

// // Action Creators
// export function changeScaleView(payload) {()
//   return async dispatch =>
//     dispatch({ type: actions.UPDATE_SCLAE_VIEW, payload });
// }
