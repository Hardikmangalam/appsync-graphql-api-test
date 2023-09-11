/* eslint-disable no-case-declarations */

import * as actions from '../actions/app';
import CNS from '../../constants';

const { PUBLIC_CHAT_TYPES_ID } = CNS;
const initialState = {
  state: {
    fetching: false,
  },
  meetings: {
    meetingData: {},
    fetching: false,
  },
  isLockedScreen: false,
  chatArray: [
    {
      type: PUBLIC_CHAT_TYPES_ID.ALL,
      chatData: [],
    },
    {
      type: PUBLIC_CHAT_TYPES_ID.HOSTS,
      chatData: [],
    },
    {
      type: PUBLIC_CHAT_TYPES_ID.MODERATORS,
      chatData: [],
    },
    {
      type: PUBLIC_CHAT_TYPES_ID.OBSERVERS,
      chatData: [],
    },
    {
      type: PUBLIC_CHAT_TYPES_ID.PARTICIPANTS,
      chatData: [],
    },
  ],
  getChatArray: [],
};

const app = (state = initialState, action) => {
  switch (action.type) {
    case actions.APP_START_FETCHING:
      return { ...state, fetching: true };
    case actions.APP_STOP_FETCHING:
      return { ...state, fetching: false };
    case actions.MEETINGS_LIST_REQUEST:
      return { ...state, meetings: { fetching: true, meetingData: {} } };
    case actions.MEETINGS_LIST_SUCCESS:
      return {
        ...state,
        meetings: { meetingData: action.payload, fetching: false },
      };
    case actions.MEETINGS_LIST_FAILED:
      return {
        ...state,
        meetings: { fetching: false, error: action.payload, meetingData: {} },
      };
    case actions.LOCK_SCREEN_SUCCESS:
      return { ...state, isLockedScreen: action.payload.isLockedScreen };
    case actions.GET_PUBLIC_CHAT_SUCCESS:
      let filterchat = undefined;
      action.payload.forEach(element => {
        filterchat = state.chatArray.find(
          obj => obj.type.toString() === element.typeId.toString(),
        );
        filterchat.chatData = element.chat;
      });

      return filterchat
        ? {
            ...state,
            getChatArray: action.payload,
            chatArray: [
              ...state.chatArray.filter(
                e => e.type.toString() !== filterchat.type.toString(),
              ),
              filterchat,
            ],
          }
        : state;

    case actions.PUBLIC_CHAT_SUCCESS:
      const { typeId, chat } = action.payload;

      let existingChatByType = state.chatArray.find(
        e => e.type.toString() === typeId.toString(),
      );

      existingChatByType.chatData.push(chat);
      existingChatByType = { ...existingChatByType, isRead: false };
      return {
        ...state,
        chatArray: [
          ...state.chatArray.filter(
            e => e.type.toString() !== typeId.toString(),
          ),
          existingChatByType,
        ],
      };

    default:
      return state;
  }
};

export default app;

// APP fetching states
export const getIsFetching = state => state.fetching;
export const getMeetings = state => state.meetings;
export const lockedScreen = state => state.isLockedScreen;
export const publicChat = state => state.chatArray;
export const getPublicChat = state => state.getChatArray;
