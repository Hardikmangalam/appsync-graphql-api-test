const Constants = {
  PUBLIC_CHAT_TYPES: {
    1: 'ALL',
    2: 'HOSTS',
    3: 'MODERATORS',
    4: 'PARTICIPANTS',
    5: 'OBSERVERS',
  },
  PUBLIC_CHAT_TYPES_ID: {
    ALL: 1,
    HOSTS: 2,
    MODERATORS: 3,
    PARTICIPANTS: 4,
    OBSERVERS: 5,
  },

  ALLOWED_PUBLIC_CHAT_SECTION_BY_ROLE: [
    {
      role_id: 1,
      chat_section: ['ALL', 'HOSTS', 'MODERATORS', 'PARTICIPANTS', 'OBSERVERS'],
    },
    {
      role_id: 2,
      chat_section: ['ALL', 'HOSTS', 'MODERATORS', 'PARTICIPANTS', 'OBSERVERS'],
    },
    {
      role_id: 3,
      chat_section: ['ALL', 'PARTICIPANTS'],
    },
    {
      role_id: 4,
      chat_section: ['ALL', 'MODERATORS'],
    },
    {
      role_id: 5,
      chat_section: ['ALL'],
    },
  ],
};

export default Constants;
