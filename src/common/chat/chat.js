import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  Dropdown,
  Image,
  OverlayTrigger,
  Tab,
  Tabs,
  Tooltip,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment-timezone';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Messages from './messages';
import closeIcon from '../../assets/images/close.svg';
import MessageInput from '../messageInput';
import { chatGQL } from '../../graphqlOperations/index';

import {
  sendPublicChatSuccess,
  getPublicChatSuccess,
} from '../../store/actions/app';
import injectReducer from '../../utils/injectReducer';
import { publicChat, getPublicChat } from '../../store/reducers/app';
import reducer, { getDialInNo } from '../../store/reducers/host-ui';
import { appReceiveError } from '../../store/actions/error';
import { getSecureSessionData } from '../../graphqlOperations/encryprWrapper';
var valData = {};
const OPTIONS = [
  { text: 'Hosts', value: '2' },
  { text: 'Moderators', value: '3' },
];

const Chat = ({
  isChatExpanded,
  userRole,
  sendPublicChatSuccess,
  publicChat,
  getPublicChatSuccess,
  getAllChat,
  twilioNumber,
  appReceiveError,
}) => {
  const [updatedArray, setUpdatedArray] = useState({});
  const [key, setKey] = useState('1');
  const [data, setData] = useState([]);
  const [newData, setNewData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [active, setActive] = useState(false);
  const [state, activeState] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [compKey, setCompKey] = useState(0);
  const [update, setUpdateKey] = useState(0);
  const tabRefs = useRef({});

  useEffect(() => {
    let filteredArray = {};
    filteredArray =
      publicChat &&
      publicChat.length > 0 &&
      publicChat.find(e => {
        if (e.type.toString() === key.toString()) {
          // e.isRead = true;
          return e;
        }
      });

    setUpdatedArray(filteredArray);
  }, [key, updatedArray, publicChat, getAllChat]);

  const handleChatScroll = ky => {
    const tabRef = tabRefs.current[ky];
    if (tabRef) {
      tabRef.scrollIntoView();
    }
  };

  useEffect(() => {
    let updateNewData = [];
    publicChat &&
      publicChat.length > 0 &&
      publicChat.find(e => {
        if (e.isRead === false) {
          if (key.toString() !== e.type.toString()) {
            if (newData.length > 0 && !newData.includes(e.type.toString())) {
              updateNewData.push(e.type.toString());
            } else {
              updateNewData.push(e.type.toString());
            }
          }
          setNewData(updateNewData);
          if (key.toString() === e.type.toString()) {
            e.isRead = true;
            handleChatScroll(key);
          }
          activeState(true);
          let updateData = [];
          if (data && data.length > 0) {
            updateData = data;
            const findTab = data.find(opEle => opEle.value == e.type);
            if (findTab === undefined) {
              let optionObj = OPTIONS.find(opEle => opEle.value == e.type);
              if (optionObj) {
                optionObj.disable = true;
                updateData.push(optionObj);
              }
            } else {
              updateData = data.map(obj => {
                if (obj.value.toString() === e.type.toString()) {
                  obj.disable = true;
                }
                return obj;
              });
            }
          } else {
            let optionObj = OPTIONS.find(opEle => opEle.value == e.type);
            if (optionObj) {
              optionObj.disable = true;
              updateData = [optionObj];
            }
          }
          setData(updateData);
        }
      });
  }, [publicChat]);

  useEffect(() => {
    if (!isMounted && updatedArray && Object.keys(updatedArray).length > 0) {
      setTimeout(() => {
        handleChatScroll(key);
        setIsMounted(true);
      }, 6000);
    }
  }, [updatedArray]);

  useEffect(() => {
    let arr = [];
    getAllChat.length > 0 &&
      getAllChat.filter(obj =>
        OPTIONS.filter((ele, idx) => {
          if (ele.value.toString() === obj.typeId.toString()) {
            if (obj.chat.length > 0) {
              ele.disable = true;
            }

            arr.push(ele);

            return arr;
          }
        }),
      );
    setData(arr);
  }, [getAllChat]);

  async function chatHandler(value) {
    try {
      let userData = getSecureSessionData('UserData');
      userData = JSON.parse(userData);
      if (value === undefined || value === '' || !/\S/.test(value)) {
        return;
      }
      const payload = {
        chat: {
          text: value,
          timezone: moment.tz.guess(),
          timestamp: moment()
            .utc()
            .unix()
            .toString(),
          userDBId: userData.userData.id,
          user_Id: userData ? userData.user_id : '',
        },
        meeting_id: userData ? userData.meetingData.id : '',
        typeId: Number(key),
      };

      sendPublicChatSuccess(payload);
      setCompKey(compKey + 1);
      const { success, message } = await chatGQL.sendPublicChatHandler(payload);

      !success && appReceiveError(message);
    } catch (err) {
      appReceiveError(err);
    }
  }

  // const handleKeydown = e => {
  //   if (e.keyCode == 13 && e.shiftKey) {
  //     setQuickText({ ...quickText, value: quickText.value + '\n' });
  //     e.preventDefault();
  //   } else if (e.key == 'Enter') {
  //     chatHandler();
  //   }
  // };

  async function getPublicChatHandler() {
    try {
      let meetData = getSecureSessionData('meetData');
      meetData = JSON.parse(meetData);
      const Id = meetData.meetingData.id;
      const { success, data, message } = await chatGQL.getPublicChatHandler(Id);
      if (success) {
        if (
          data.allChatData &&
          Array.isArray(data.allChatData) &&
          data.allChatData.length
        )
          getPublicChatSuccess(data.allChatData);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    getPublicChatHandler();
  }, []);

  useEffect(() => {
    if (state) {
      setTimeout(() => {
        activeState(false);
      }, 7000);
    }
  }, [state]);

  useEffect(() => {
    setTimeout(() => {
      handleChatScroll(key);
    }, 800);
    if (key === '1') {
      return;
    }
    setActive(false);
  }, [key]);

  const handleRemove = (e, val) => {
    publicChat &&
      publicChat.length > 0 &&
      publicChat.find(e => {
        if (e.type.toString() === val.toString()) {
          e.isRead = true;
          return e;
        }
      });
    setUpdateKey(update + 1);
    e.stopPropagation();
    const arr = data.filter(obj => obj.value.toString() !== val.toString());
    setData(arr);
    valData = arr.find(obj => obj.disable === true);
    if (valData !== undefined && valData.value) {
      setKey(valData.value);
    } else {
      setKey('1');
    }
  };

  const handleAddOption = useCallback(
    val => {
      if (
        data.length > 0 &&
        data.find(obj => obj.value.toString() === val.value.toString())
      ) {
        const dataArr = data.map(el => {
          if (el.value.toString() === val.value.toString()) {
            const newObj = {
              ...el,
              disable: true,
            };
            return newObj;
          }
          return el;
        });

        setData(dataArr);
      } else {
        const obj = {
          ...val,
          disable: true,
        };
        data.push(obj);
        setData(data);
        setKey(val.value);
      }
    },
    [data],
  );

  const handleTabRef = (tab, ref) => {
    tabRefs.current[tab] = ref;
  };

  const isDisabled = (val, valData) => {
    let isDisable = false;
    valData.map(el => {
      if (el.value === val && el.disable) {
        isDisable = true;
      }
    });
    return isDisable;
  };

  const handleNewMark = ky => {
    if (newData.includes(ky.toString())) {
      const filData = newData.filter(e => e.toString() !== ky.toString());
      publicChat &&
        publicChat.length > 0 &&
        publicChat.find(e => {
          if (e.type.toString() === ky.toString()) {
            e.isRead = true;
            return e;
          }
        });
      setNewData(filData);
    }
  };
  const handleTooltip = text => {
    return <Tooltip>{text}</Tooltip>;
  };
  return (
    <>
      <div className={classNames({ expanded: isChatExpanded }, 'chat')}>
        <div className="host-sidebar__heading">
          {userRole === 'HOST' && twilioNumber !== null ? (
            <div>Dial in Number :- {twilioNumber}</div>
          ) : (
            <>
              {[true, 'true'].includes(
                getSecureSessionData('isStartMeeting'),
              ) &&
                userRole === 'HOST' &&
                'All numbers are allocated, so there is no number available.'}
            </>
          )}
          {userRole === 'HOST' || userRole === 'ADMIN' ? '' : 'Chat'}
          {/* {read.type && data && data.length > 0 && state ? (
            <span
              className="chat_msg"
              onClick={() => {
                activeState(false);
              }}
            >
              <img src={downIcon} alt="down" />
              <strong className="m-3">New Message</strong>
            </span>
          ) : (
            !state && ''
          )} */}
        </div>
        <div
          className={
            userRole === 'HOST' || userRole === 'ADMIN'
              ? 'chat-tabs'
              : 'chat-other-tab'
          }
        >
          <Tabs
            activeKey={key}
            className="lined-tabs chat-length-data"
            onSelect={k => setKey(k)}
          >
            <Tab
              eventKey="1"
              title={
                <span
                  className="d-flex align-items-center"
                  onClick={() => handleNewMark('1')}
                  role="button" // Add role="button" to make it keyboard accessible
                  tabIndex="0" // Add tabIndex="0" for keyboard focus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleNewMark('1');
                    }
                  }}
                >
                  {userRole === 'OBSERVER' ? 'Observer' : 'Everyone'}
                  {newData.includes('1') && (
                    <span className="instant-chat" aria-label="New Message">
                      &#8226;
                    </span>
                  )}
                  <OverlayTrigger
                    placement="top"
                    overlay={handleTooltip('Close')}
                  >
                    <Button
                      key={update}
                      className="p-0 ms-2"
                      onClick={e => {
                        handleRemove(e, '1');
                        setActive(true);
                      }}
                      aria-label="Close-update-Tab"
                    >
                      <Image src={closeIcon} width={16} alt="Close Icon" />
                    </Button>
                  </OverlayTrigger>
                </span>
              }
            >
              <Messages publicChat={updatedArray} />
              <div ref={ref => handleTabRef('1', ref)}></div>
            </Tab>
            {(userRole === 'HOST' ||
              userRole === 'ADMIN' ||
              userRole === 'MODERATOR') &&
              data &&
              data.length > 0 &&
              data.map(obj =>
                obj.disable ? (
                  <Tab
                    key={obj.text}
                    eventKey={obj.value}
                    onClick={() => {
                      setActive(true);
                    }}
                    title={
                      <span
                        className="d-flex align-items-center"
                        onClick={() => handleNewMark(obj.value)}
                      >
                        {obj.text}
                        {newData.includes(obj.value.toString()) && (
                          <p className="instant-chat">&#8226;</p>
                        )}
                        <OverlayTrigger
                          placement="top"
                          overlay={handleTooltip('Close')}
                          // overlay={<Tooltip>Close</Tooltip>}
                        >
                          <Button
                            key={update}
                            className="p-0 ms-2"
                            aria-label="CloseTab"
                            onClick={e => {
                              handleRemove(e, obj.value);
                              setActive(true);
                            }}
                          >
                            <Image
                              src={closeIcon}
                              width={16}
                              alt="Close Icon"
                            />
                          </Button>
                        </OverlayTrigger>
                      </span>
                    }
                  >
                    <Messages publicChat={updatedArray} />
                    <div
                      ref={ref => handleTabRef(obj.value.toString(), ref)}
                    ></div>
                  </Tab>
                ) : (
                  ''
                ),
              )}
          </Tabs>
          {userRole !== 'OBSERVER' && (
            <Dropdown align="end">
              <OverlayTrigger
                placement="top"
                overlay={handleTooltip('Start a Private Chat')}
              >
                <Dropdown.Toggle
                  id="dropdownToggle"
                  className="p-0"
                  aria-label="Start a Private Chat Options"
                >
                  <span className="visually-hidden">
                    Start a Private Chat Options
                  </span>
                </Dropdown.Toggle>
              </OverlayTrigger>

              <Dropdown.Menu aria-labelledby="dropdownToggle">
                {userRole === 'HOST' || userRole === 'ADMIN'
                  ? OPTIONS.map((option, i) => (
                      <Dropdown.Item
                        key={option.value}
                        onClick={() => {
                          handleAddOption(option);
                        }}
                        disabled={isDisabled(option.value, data)}
                      >
                        {option.text}
                      </Dropdown.Item>
                    ))
                  : userRole === 'MODERATOR' &&
                    OPTIONS.map(
                      (option, i) =>
                        option.value !== '3' && (
                          <Dropdown.Item
                            key={option.value}
                            onClick={() => {
                              handleAddOption(option);
                            }}
                            disabled={isDisabled(option.value, data)}
                          >
                            {option.text}
                          </Dropdown.Item>
                        ),
                    )}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        <MessageInput handleClick={chatHandler} />
      </div>
    </>
  );
};

Chat.propTypes = {
  isChatExpanded: PropTypes.bool,
  userRole: PropTypes.string,
  sendPublicChatSuccess: PropTypes.func,
  publicChat: PropTypes.array,
  appReceiveError: PropTypes.func,
  getPublicChatSuccess: PropTypes.func,
  getAllChat: PropTypes.array,
  twilioNumber: PropTypes.number,
};

const mapStateToProps = state => {
  const { app, hostUI } = state;
  return {
    publicChat: publicChat(app),
    twilioNumber: getDialInNo(hostUI),
    getAllChat: getPublicChat(app),
  };
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

export function mapDispatchToProps(dispatch) {
  return {
    sendPublicChatSuccess: payload => dispatch(sendPublicChatSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    getPublicChatSuccess: payload => dispatch(getPublicChatSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Chat);
