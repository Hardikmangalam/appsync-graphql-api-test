/* eslint-disable no-unused-vars */
/* eslint-disable indent */
import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Image } from 'react-bootstrap';
import { Resizable } from 're-resizable';
import PropTypes from 'prop-types';
import momentTz from 'moment-timezone';
import { chatGQL } from '../../../graphqlOperations/index';
import CustomModal from '../../../common/customModal';
import { AddQuestionDetail } from '../Modal/AddQuestion';
import { useModalWithData } from '../../../hooks/useModalWithData';
import seramount_Logo from '../../../assets/images/seramountLogo.svg';
import eabLogo from '../../../assets/images/EABLogoColor-primaryLogo.png';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
//store
import EabLogo from '../../../assets/images/EABbrand.svg';
import seraLogo from '../../../assets/images/EABseramount.svg';
import { connect } from 'react-redux';
import { compose } from 'redux';

import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';

import {
  onBroadcastQuestionResult,
  onCreateQuestionByScreen,
  onUpdateQuestionByScreen,
} from '../../../graphql/subscriptions';

import { API, graphqlOperation } from 'aws-amplify';

import {
  setHostUI,
  changeScaleView,
  onDeleteQuestionSuccess,
  onGetQuickAnswerSuccess,
  onGetQuestionSuccess,
  submitResponse,
} from '../../../store/actions/host-ui';
import { questionGQL } from '../../../graphqlOperations';
import responseWrapper from '../../../graphqlOperations/responseWrapper';
import ParticipantQuestions from './ParticipantQuestions';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../store/actions/error';
import classNames from 'classnames';
import { Responsive, WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Example from './dnd-flow-participant/Example';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

const isSeramount = JSON.parse(getSecureSessionData('branding'));
const meetingName = JSON.parse(getSecureSessionData('UserData'));
let currentMeetingId = null;
if (meetingName !== null && Object.keys(meetingName).length) {
  const {
    meetingData: { id },
  } = meetingName;
  currentMeetingId = Number(id);
}

let updatedArray = [];
let payData = [];
let submitIds = [];

var testLayout = {
  lg: [],
};

const ParticipantQuestionCard = ({
  host_ui,
  questions,
  questionNumbers,
  onDeleteQuestionSuccess,
  appReceiveError,
  appReceiveSuccess,
  onGetQuickAnswerSuccess,
  cardResize,
  onGetQuestionSuccess,
  submitResponse,
  meetingGroupChatId,
}) => {
  const pointX = useRef();
  const pointY = useRef();
  const [list, setList] = useState([]);
  const [payload, setPayload] = useState({});
  const [btn, setBtn] = useState({});
  const [editQuestionModal, setEditQuestionModal] = useState();
  const { modalOpen, setModalState } = useModalWithData();
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [QuestionData, setQuestionData] = useState({});
  const [quickText, setQuickText] = useState({ name: '', value: '' });
  const [quickType, setQuickType] = useState({});
  const [submitQue, setSubmitQue] = useState([]);
  const [height, setHeight] = useState(null);
  const [width, setWidth] = useState(null);
  const [cardResizeData, setCardResizeData] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isCardResized, setIsCardResized] = useState(false);
  const [isUpdated, setIsupdated] = useState(false);
  const [isQueAdded, setIsQueAdded] = useState(1);
  const [updateQue, setUpdateQue] = useState([]);
  const [val, setVal] = useState('');
  const [classname, setClassname] = useState('');
  const [broadcastFlag, setBroadcastFlag] = useState(false);
  const [compKey, setcompKey] = useState(false);
  const [isMoveable, setIsMoveable] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [update, setUpdate] = useState(true);
  const [queKey, setqueKey] = useState(1);

  const [scrollTopHeight, setScrollTopHeight] = useState(null);
  const [oldScrollHeight, setScrollHeight] = useState(null);
  const [newScrollHeight, setNewScrollHeight] = useState(null);
  const [inBottom, setInBottom] = useState(true);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  let scrollArray = JSON.parse(getSecureSessionData('newMessage')) || [];
  const [newLayout, setNewLayout] = useState(testLayout);
  const [layoutKey, setLayoutKey] = useState(0);

  const handleScroll = (event, id) => {
    var positionTop = document.getElementById(`question-card-quickAns-${id}`)
      .scrollTop;
    var positionHeight = document.getElementById(`question-card-quickAns-${id}`)
      .scrollHeight;
    var positionClient = document.getElementById(`question-card-quickAns-${id}`)
      .clientHeight;

    if (
      positionHeight - positionTop === positionClient ||
      positionHeight - positionTop - 1 === positionClient
    ) {
      const data = scrollArray.filter(e => e != Number(id));
      scrollArray = data;
      setSecureSessionData('newMessage', JSON.stringify(data));
      setqueKey(queKey + 1);
    }
    if (Number(scrollTopHeight) === Number(event.target.scrollTop)) {
      setInBottom(true);
    } else if (Number(newScrollHeight) === Number(event.target.scrollHeight)) {
      if (
        oldScrollHeight <
          Number(event.target.scrollTop) + Number(event.target.clientHeight) ||
        newScrollHeight ===
          Number(event.target.scrollTop) + Number(event.target.clientHeight)
      ) {
        setScrollToBottom(true);
        setInBottom(true);
      } else {
        setScrollToBottom(false);
        setInBottom(false);
      }
    } else {
      setInBottom(false);
    }
  };

  useEffect(() => {
    setcompKey(compKey + 1);
  }, [updateQue]);

  const handleAddQuestion = () => {
    // props.addQuestionRequest(payloadData);
    if (Object.keys(payload).length) {
      updateQuestionHandler(payload);
    }
    setModalState(false);
  };

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    if (branding === null || branding === true) {
      document.body.style.backgroundImage = `url('${seraLogo}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = `url('${EabLogo}')`;
      document.body.style.backgroundSize = 'cover';
    }
  }, [JSON.parse(getSecureSessionData('branding'))]);

  const saveQuestionBank = () => {
    if (Object.keys(payload).length) {
      saveQuestionToBank(payload);
    }
    setModalState(false);
  };

  async function saveQuestionToBank(payload) {
    try {
      delete payload.id;
      delete payload.que_display_seq;
      payload = {
        ...payload,
        input_type: payload.type,
        screen_id: selectedScreen,
        response: payload.response.map(({ name }) => name),
      };
      const { message, success } = await questionGQL.saveQuestionBankHandler(
        payload,
      );
      success ? appReceiveSuccess(message) : appReceiveError(message);
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function updateQuestionHandler(payload) {
    try {
      const { id, label } = payload;
      const payloadData = { id, label };
      if (payload.id == 'initalAdd') delete payload.id;

      const { message, success } = await questionGQL.updateQuestionHandler(
        payloadData,
      );
      success ? appReceiveSuccess(message) : appReceiveError(message);
    } catch (err) {
      appReceiveError(err);
    }
  }

  const handleChange = data => {
    const py = {
      ...payload,
      ...data,
    };
    setPayload(py);
  };

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateQuestionByScreen, {
        meeting_id: currentMeetingId,
      }),
    ).subscribe({
      next: ({ value }) => {
        const { success, data, meeting_id, message } = responseWrapper(
          value,
          'onCreateQuestionByScreen',
        );
        // Action to add screen data
        if (success && data.length && meeting_id == currentMeetingId) {
          // setIsupdated(false);
          setIsQueAdded(isQueAdded + 1);
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedScreen]);

  const onSaveQuestion = que => {
    const arrData = updateQue.find(
      ele => ele.question_id.toString() === que.id.toString(),
    );
    let idx = null;
    const id = [];
    que.response.find(ele => {
      if (ele.isChecked) id.push(Number(ele.id));
    });

    let finalPayload = {};
    if (arrData && Object.keys(arrData).length) {
      finalPayload = {
        meeting_id: currentMeetingId,
        screen_id: selectedScreen,
        ...arrData,
      };
    } else {
      finalPayload = {
        meeting_id: currentMeetingId,
        screen_id: selectedScreen,
        response_id: id,
        type: que && que.type,
        question_id: que && que.id,
      };
    }
    setIsupdated(true);
    saveQuestionResponse(finalPayload);
  };

  const handleIncrease = () => {
    setZoomImage(true);
    setUpdate(false);
  };
  const handleDecrease = () => {
    setZoomImage(false);
    setUpdate(true);
  };

  const getQuetionNumbers = question_id => {
    let foundNumber = 'Q-#',
      foundObj = null;
    if (
      questionNumbers &&
      Array.isArray(questionNumbers) &&
      questionNumbers.length
    ) {
      foundObj = questionNumbers.find(ele => ele.id == question_id);
      foundNumber = foundObj ? foundObj.queNumber : foundNumber;
    }
    return foundNumber;
  };

  async function saveQuestionResponse(payload) {
    try {
      const {
        data,
        message,
        success,
      } = await questionGQL.saveQuestionResponseHandler(payload);
      if (success && !isUpdated) {
        submitResponse({ ...data, fromSubscription: false });
        setIsupdated(false);
        appReceiveSuccess(message);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    if (host_ui && Object.keys(host_ui.selected_screen).length) {
      setSelectedScreen(host_ui.selected_screen.id);
    } else {
      let meetData = getSecureSessionData('meetData');
      meetData = meetData ? JSON.parse(meetData) : null;

      if (
        meetData &&
        meetData.meetingData &&
        meetData.meetingData.selectedscreen
      ) {
        setSelectedScreen(meetData.meetingData.selectedscreen);
      }
    }
  }, [host_ui.selected_screen]);

  useEffect(() => {
    if (host_ui && Object.keys(host_ui.selected_screen).length) {
      setNewLayout({ lg: [] });
      setList([]);
    }
  }, [host_ui.selected_screen.id]);

  useEffect(() => {
    if (host_ui && host_ui.screen_layout && host_ui.screen_layout.length > 0) {
      setNewLayout({ lg: host_ui.screen_layout });
      setLayoutKey(layoutKey + 1);
      // if (list.length === host_ui.screen_layout.length) {
      // }
    }
  }, [host_ui.screen_layout]);

  useEffect(() => {
    if (questions && questions.length >= 0) {
      questions.filter(e => {
        if (e && !e.isSubmitted && Number(e.type) !== 3) {
          updatedArray.push(e.id);
          updatedArray = updatedArray.filter((item, pos) => {
            return updatedArray.indexOf(item) == pos;
          });
          // setIsupdated(true);
        }
      });
      setList(questions);
    }
  }, [questions]);

  useEffect(() => {
    document.querySelector('.dashboard-wrapper').scrollTo(0, 0);
  }, [selectedScreen]);

  useEffect(() => {
    if (questions && questions.length) {
      const subscription = API.graphql(
        graphqlOperation(onBroadcastQuestionResult, {
          meeting_id: currentMeetingId,
        }),
      ).subscribe({
        next: ({ value }) => {
          const { success, data, message } = responseWrapper(
            value,
            'onBroadcastQuestionResult',
          );
          // if (success && data.length) onUpdateQuestionSuccess(data[0]);
          const {
            question_obj,
            is_broadcast,
            question_id,
            meeting_id = undefined,
            screen_id = undefined,
          } = data;

          if (
            success &&
            meeting_id == currentMeetingId &&
            selectedScreen == screen_id
          ) {
            if (is_broadcast && questions && questions.length) {
              const newQuestion = questions.map(e => {
                return question_id.toString() == e.id.toString()
                  ? {
                      ...e,
                      totalUsers: question_obj.totalUsers,
                      userCount: question_obj.totalUsers,
                      is_broadcast,
                      response:
                        question_obj.response && question_obj.response.length
                          ? question_obj.response.sort(
                              (a, b) => a.res_display_seq - b.res_display_seq,
                            )
                          : [],
                    }
                  : e;
              });
              onGetQuestionSuccess(newQuestion);
              setList(newQuestion);
            } else if (!is_broadcast && questions && questions.length) {
              const newQuestion = questions.map(e => {
                let obj = { ...e };
                if (obj.id.toString() == question_id.toString()) {
                  delete obj['totalUsers'];
                  delete obj['userCount'];
                  delete obj['is_broadcast'];
                }
                return obj;
              });
              onGetQuestionSuccess(newQuestion);
              setList(newQuestion);
            }
          } else {
            appReceiveError(message);
          }
        },
        error: error => appReceiveError(error),
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [questions, updateQue]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateQuestionByScreen, {
        meeting_id: currentMeetingId,
      }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, message, meeting_id } = responseWrapper(
          value,
          'onUpdateQuestionByScreen',
        );
        // Action to add screen data
        if (success) {
          if (data && data.length && meeting_id == currentMeetingId) {
            setTimeout(() => {
              setcompKey(compKey + 1);
            }, 100);
          }
        } else {
          appReceiveError(message);
        }
      },
      error: error => {
        const {
          data: { meeting_id },
          message,
        } = error;
        if (meeting_id == currentMeetingId) appReceiveError(message);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedScreen]);

  const handlebtn = id => {
    updatedArray.push(id);
  };

  const handleDeManage = id => {
    const index = updatedArray.indexOf(id);
    if (index !== -1) {
      updatedArray = updatedArray.filter(
        ele => ele.toString() !== id.toString(),
      );
    }
  };

  async function handleQuickAnswer(questionData) {
    setInBottom(true);
    try {
      let userData = getSecureSessionData('UserData');

      userData = JSON.parse(userData);

      const payload = {
        question_id: questionData && questionData.id,
        meetingGroupIds:
          meetingGroupChatId.length > 0 ? meetingGroupChatId : [],
        meetingGroupIndex:
          getSecureSessionData('meetingGroupIndex') > 0
            ? [Number(getSecureSessionData('meetingGroupIndex'))]
            : [],
        userDBId: userData.userData.id,
        user_id: userData ? userData.user_id : '',
        message: quickText.value,
        timezone: momentTz.tz.guess(),
        meeting_id: userData ? userData.meetingData.id : '',
      };
      setQuickText({ name: '', value: '' });

      onGetQuickAnswerSuccess({
        ...payload,
        chat: {
          ...payload.message,
        },
        id: 'chat-id',
      });
      const { success, message } = await chatGQL.getQuickAnswerHandler(payload);
      if (success) {
        setQuickText({ name: '', value: '' });
        document.querySelector(
          `#question-card-quickAns-${questionData.id}`,
        ).scrollTop = document.querySelector(
          `#question-card-quickAns-${questionData.id}`,
        ).scrollHeight;
      }
      if (!success) {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    let arr = [];
    if (Object.keys(QuestionData).length) {
      // arr.push(QuestionData.question_id);
      setSubmitQue(arr);

      if (
        submitIds &&
        Array.isArray(submitIds) &&
        !submitIds
          .map(ele => ele.toString())
          .includes(QuestionData.question_id.toString())
      ) {
        submitIds.push(...submitQue, QuestionData.question_id);
        submitIds = submitIds.filter((item, pos) => {
          return submitIds.indexOf(item) == pos;
        });
      } else if (!submitIds.includes(QuestionData.question_id.toString())) {
        submitIds.push(QuestionData.question_id.toString());
        setIsupdated(true);
      }
    }
  }, [QuestionData]);

  const handleKeydown = (e, id) => {
    if (e.keyCode == 13 && e.shiftKey) {
      setQuickText({ name: id, value: e.target.value + '\n' });
      e.preventDefault();
    } else if (e.key == 'Enter') {
      e.preventDefault();
      handleQuickAnswer(quickType);
      setQuickText({ name: '', value: '' });
    }
  };

  useEffect(() => {
    setIsCardResized(false);
  }, [cardResize]);

  function random(start, end) {
    return Math.floor(Math.random() * (end - start) + start);
  }

  const getYvalue = i => {
    // if (layouts && layouts.lg && layouts.lg.length > 0) {
    //   const cordX = layouts.lg.map(el => {
    //     return el.y;
    //   });
    //   const maxPos = cordX.reduce(function(res, obj) {
    //     return obj > res ? obj : res;
    //   });
    //   return maxPos;
    // }
    return 10;
  };

  const getXvalue = i => {
    if (newLayout && newLayout.lg && newLayout.lg.length > 0) {
      const cordX = newLayout.lg.map(el => {
        if (el.y < 300) {
          return el.x;
        }
        return 0;
      });
      const maxPos = cordX.reduce(function(res, obj) {
        return obj > res ? obj : res;
      });
      return maxPos + 350;
    }
    return 10;
  };

  const generateLayout = () => {
    if (list && list.length === 0) {
      return;
    }
    const ids = list.map(l => l.id);

    const data = [...Array(ids.length).keys()];
    return data.map((item, i) => {
      const y = Math.ceil(Math.random() * 2) + 1;
      return {
        x: getXvalue(i),
        y: getYvalue(i),
        w: 3,
        h: 3,
        i: ids[i],
        minW: 3,
        maxW: 12,
        minH: 2,
      };
    });
  };
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (list && list.length === 0) {
      return;
    }
    if (!isMounted) {
      setIsMounted(true);
      getScreenLayoutHandlerdata();
    }
  }, [list]);

  async function getScreenLayoutHandlerdata() {
    const screenJson = JSON.parse(getSecureSessionData('selectedScreen'));
    try {
      const payload = {
        screen_id: screenJson.id,
      };

      const {
        success,
        data,
        message,
      } = await questionGQL.getScreenLayoutHandler(payload);
      if (success) {
        let lyData = [];
        if (screenJson.id.toString() === data.screen_id.toString()) {
          if (data.layout === null) {
            lyData = generateLayout();
            setNewLayout({ lg: lyData });
          } else {
            if (data.layout.length === list.length) {
              lyData = data.layout;
              setNewLayout({ lg: data.layout });
            }
            // setLayoutKey(layoutKey + 1);
          }
        }
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  return (
    <>
      {!selectedScreen ? (
        <section
          className="locked-screen-wrapper text-center"
          style={{ width: '100%' }}
        >
          {/* <form className="card col-md-9 observer-card"> */}
          <form className="card col-md-9 observer-card">
            <div className="wrapper__heading mb-4 center">
              Please wait for the session to continue
            </div>
            <div className="col-md-12">
              <Image
                src={isSeramount ? seramount_Logo : eabLogo}
                alt="Logo"
                width={isSeramount ? 192 : 108}
                className="mb-2"
              />
            </div>
          </form>
        </section>
      ) : (
        <div key={compKey} className="question d-flex w-100">
          {list &&
            questionNumbers &&
            list.length > 0 &&
            questionNumbers.length > 0 && (
              <>
                <DndProvider
                  backend={HTML5Backend}
                  options={{
                    enableTouchEvents: false,
                    enableMouseEvents: false,
                  }}
                >
                  <Example
                    list={list}
                    // onUpdateLayout={onUpdateLayout}
                    layouts={newLayout}
                    setUpdate={setUpdate}
                    setZoomLevel={setZoomLevel}
                    zoomLevel={zoomLevel}
                    isHost={false}
                  />
                </DndProvider>
              </>
            )}
        </div>
      )}
      <CustomModal
        title="Add New Question"
        isActive={modalOpen}
        handleClose={() => setModalState(false)}
        handleButtonClick={handleAddQuestion}
        handleClick={() => setModalState(false)}
        handleSaveClick={saveQuestionBank}
        buttonTitle="Save Question"
        buttonBottomTitle="Save Question to the Bank"
        buttonBottomFrom
      >
        <AddQuestionDetail
          questionType={editQuestionModal}
          questionLabel={payload.label || ''}
          handleChange={handleChange}
        />
      </CustomModal>
    </>
  );
};

ParticipantQuestionCard.propTypes = {
  host_ui: PropTypes.object.isRequired,
  questions: PropTypes.array,
  questionNumbers: PropTypes.array,
  onDeleteQuestionSuccess: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  onGetQuickAnswerSuccess: PropTypes.func,
  cardResize: PropTypes.array,
  onGetQuestionSuccess: PropTypes.func,
  submitResponse: PropTypes.func,
  meetingGroupChatId: PropTypes.array,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  const { meetingGroupChatId } = hostUI;
  return {
    host_ui: getHostUI(hostUI),
    questions: hostUI.questions,
    questionNumbers: hostUI.questionNumbers,
    cardResize: hostUI.cardResizeData,
    meetingGroupChatId:
      meetingGroupChatId && meetingGroupChatId.map(e => Number(e)),
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    onDeleteQuestionSuccess: payload =>
      dispatch(onDeleteQuestionSuccess(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    onGetQuickAnswerSuccess: payload =>
      dispatch(onGetQuickAnswerSuccess(payload)),
    onGetQuestionSuccess: payload => dispatch(onGetQuestionSuccess(payload)),
    submitResponse: payload => dispatch(submitResponse(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(ParticipantQuestionCard);
