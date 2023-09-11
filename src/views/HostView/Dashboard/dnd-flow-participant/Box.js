import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from 'react-bootstrap';
import classNames from 'classnames';
import MessageInput from '../../../../common/messageInput';
import injectReducer from '../../../../utils/injectReducer';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { getPermissionSuccess } from '../../../../store/actions/login';
import {
  changeScaleView,
  onGetQuestionSuccess,
  onGetQuickAnswerSuccess,
  setHostUI,
  submitResponse,
} from '../../../../store/actions/host-ui';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../../store/actions/error';
import reducer, { getHostUI } from '../../../../store/reducers/host-ui';
import { chatGQL, questionGQL } from '../../../../graphqlOperations';
import { API, graphqlOperation } from 'aws-amplify';
import {
  onBroadcastQuestionResult,
  onCreateQuestionByScreen,
  onSetSelectedScreen,
} from '../../../../graphql/subscriptions';
import responseWrapper from '../../../../graphqlOperations/responseWrapper';
import momentTz from 'moment-timezone';
import { Resizable } from 're-resizable';
import ParticipantQuestions from '../ParticipantQuestions';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../../graphqlOperations/encryprWrapper';

var testLayout = {
  lg: [],
};

let updatedArray = [];
let submitIds = [];

const Box = memo(function Box({
  yellow,
  preview,
  question,
  host_ui,
  id,
  questions,
  questionNumbers,
  appReceiveError,
  appReceiveSuccess,
  onGetQuickAnswerSuccess,
  layout_view,
  refs,
  index,
  cardResize,
  left,
  top,
  meetingGroupChatId,
}) {
  const [list, setList] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [compKey, setcompKey] = useState(0);
  const [, setLoading] = useState(false);

  const [, setIsLayoutChanged] = useState(false);

  const [scrollTopHeight, setScrollTopHeight] = useState(null);
  const [oldScrollHeight, setScrollHeight] = useState(null);
  const [newScrollHeight, setNewScrollHeight] = useState(null);
  const [inBottom, setInBottom] = useState(true);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [layoutCompKey, setLayoutCompKey] = useState(0);
  const [, setCurrentScreenId] = useState('');
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [updateQue, setUpdateQue] = useState([]);
  const [isUpdated, setIsupdated] = useState(false);
  const [, setBtn] = useState({});
  const [layouts, setLayouts] = useState(testLayout);
  const [layoutKey, setLayoutKey] = useState(0);
  const [submitQue, setSubmitQue] = useState([]);

  // eslint-disable-next-line no-unused-vars
  const [QuestionData, setQuestionData] = useState({});
  const pointX = useRef();
  const pointY = useRef();
  const [, setIsCardResized] = useState(false);
  const [isQueAdded, setIsQueAdded] = useState(1);
  const [queKey, setqueKey] = useState(1);

  let scrollArray = JSON.parse(getSecureSessionData('newMessage')) || [];

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
      // setInBottom(true);
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

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateQuestionByScreen, {
        meeting_id: currentMeetingId,
      }),
    ).subscribe({
      next: ({ value }) => {
        const { success, data, meeting_id } = responseWrapper(
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

  const onSaveQuestion = useCallback(
    que => {
      const arrData = updateQue.find(
        ele => ele.question_id.toString() === que.id.toString(),
      );
      const id = [];
      // que.response.find(ele => {
      //   if (ele.isChecked) id.push(Number(ele.id));
      // });

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
    },
    [updateQue],
  );

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
      setLayouts({ lg: [] });
      setList([]);
    }
  }, [host_ui.selected_screen.id]);

  useEffect(() => {
    if (host_ui && host_ui.screen_layout && host_ui.screen_layout.length > 0) {
      setLayouts({ lg: host_ui.screen_layout });
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

  async function handleQuickAnswer(questionData, value) {
    setInBottom(true);
    try {
      let userData = getSecureSessionData('UserData');

      userData = JSON.parse(userData);
      const payload = {
        question_id: questionData && questionData.id,
        meetingGroupIds:
          getSecureSessionData('meetingGroupIds') > 0
            ? [Number(getSecureSessionData('meetingGroupIds'))]
            : [],
        meetingGroupIndex:
          getSecureSessionData('meetingGroupIndex') > 0
            ? [Number(getSecureSessionData('meetingGroupIndex'))]
            : [],
        userDBId: userData.userData.id,
        user_id: userData ? userData.user_id : '',
        message: value,
        timezone: momentTz.tz.guess(),
        meeting_id: userData ? userData.meetingData.id : '',
      };

      onGetQuickAnswerSuccess({
        ...payload,
        chat: {
          ...payload.message,
          id: 'chat-id',
        },
      });
      const { success, message } = await chatGQL.getQuickAnswerHandler(payload);
      if (success) {
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

  // const handleKeydown = (e, id) => {
  //   if (e.keyCode == 13 && e.shiftKey) {
  //     setQuickText({ name: id, value: e.target.value + '\n' });
  //     e.preventDefault();
  //   } else if (e.key == 'Enter') {
  //     e.preventDefault();
  //     handleQuickAnswer(quickType);
  //     setQuickText({ name: '', value: '' });
  //   }
  // };

  useEffect(() => {
    setIsCardResized(false);
  }, [cardResize]);

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
    if (layouts && layouts.lg && layouts.lg.length > 0) {
      const cordX = layouts.lg.map(el => {
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
            setLayouts({ lg: lyData });
          } else {
            if (data.layout.length === list.length) {
              lyData = data.layout;
              setLayouts({ lg: data.layout });
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
      setLayouts({ lg: [] });
      setList([]);
    }
  }, [host_ui.selected_screen.id]);

  const [isUpdateKey] = useState(0);

  const meetingName = JSON.parse(getSecureSessionData('UserData'));
  let currentMeetingId = null;
  if (meetingName !== null && Object.keys(meetingName).length) {
    const {
      meetingData: { id },
    } = meetingName;
    currentMeetingId = Number(id);
  }

  useEffect(() => {
    if (
      host_ui &&
      Object.keys(host_ui.selected_screen).length &&
      host_ui.selected_screen.id !== selectedScreen
    ) {
      setSelectedScreen(host_ui.selected_screen.id);
      setCurrentScreenId(host_ui.selected_screen.id);
    }
  }, [layouts, list, host_ui.selected_screen.id]);

  useEffect(() => {
    if (
      host_ui &&
      host_ui.screen_layout &&
      host_ui.screen_layout.length > 0 &&
      host_ui.screen_layout.length === list.length
    ) {
      // if (!isLayoutChanged) {
      setIsLayoutChanged(true);
      setLayouts({ lg: host_ui.screen_layout });
      // setLayoutCompKey(layoutCompKey + 1);
      // }
    }
  }, [host_ui.screen_layout]);

  useEffect(() => {
    document.querySelector('.dashboard-wrapper').scrollTo(0, 0);
  }, [selectedScreen]);

  useEffect(() => {
    setInBottom(true);
  }, [getSecureSessionData('selectedScreen')]);

  useEffect(() => {
    if (layout_view) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 1000);
    }
  }, [layout_view]);

  useEffect(() => {
    if (questions && questions.length >= 0) {
      setList(questions);
    }
  }, [questions, isUpdateKey]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onSetSelectedScreen, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data } = responseWrapper(value, 'onSetSelectedScreen');
        const screenJson = JSON.parse(getSecureSessionData('selectedScreen'));
        if (success && data.id.toString() === screenJson.id.toString()) {
          setLoading(true);
          setLayouts({ lg: [] });
          setIsLayoutChanged(false);
          setCurrentScreenId(data.id);
          getScreenLayoutHandlerdata();
          setLayoutCompKey(layoutCompKey + 1);
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getSize = question => {
    if (
      question &&
      question.metadata &&
      question.metadata.width &&
      question &&
      question.metadata &&
      question.metadata.height
    ) {
      return {
        width:
          width || (question && question.metadata && question.metadata.width),
        height:
          height || (question && question.metadata && question.metadata.height),
      };
    } else if (
      (width === null && height === null) ||
      (question && question.metadata === null)
    ) {
      if (question && Number(question.type) === 3) {
        return { width: 335, height: 450 };
      } else {
        return { width: 335, height: 450 };
      }
    }
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

  return (
    <Fragment key={question.id}>
      <Resizable
        key={question.id}
        id={`res_${question.id}`}
        role="region"
        size={getSize(question)}
        enable={{
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        onResizeStop={(e, direction, ref, d) => {
          // e.target.style.width = `${d.width}px`;
          // e.target.style.height = `${d.height}px`;
          // handleCardResizeDataValue(
          //   document.getElementById(`res_${question.id}`).style.width,
          //   document.getElementById(`res_${question.id}`).style.height,
          //   question.id,
          // );
          // setQuestionData(question);
          setHeight(document.getElementById(`res_${question.id}`).style.height);
          setWidth(document.getElementById(`res_${question.id}`).style.width);
        }}
        onResizeStart={() => {
          const leftPos = document.querySelector('.dashboard-wrapper')
            .scrollLeft;
          const bottomPos = document.querySelector('.dashboard-wrapper')
            .scrollTop;
          pointX.current = leftPos;
          pointY.current = bottomPos;
        }}
        onResize={() => {
          document.querySelector('.dashboard-wrapper').scrollLeft =
            pointX.current;
          document.querySelector('.dashboard-wrapper').scrollTop =
            pointY.current;
        }}
        className={`${
          question && question.type === 3
            ? 'question-card-resizeQuick'
            : 'question-card-resize'
        }`}
        handleStyles={{ height: '450px' }}
      >
        <Fragment key={question.id}>
          <Card
            className="h-100 w-100"
            key={question && question.id}
            role="region"
          >
            <Card.Header className="fw-bold d-flex justify-content-between align-items-center py-2 fw-14">
              {/* Q{index + 1} */}
              {getQuetionNumbers(question && question.id)}
            </Card.Header>
            <Card.Body className={classNames('host p-0 pb-3')}>
              <Card.Title
                id={`question-card-title-${question.id}`}
                className="fw-bold fw-14 text-start bg-alice-blue px-3 py-2"
              >
                {/* {question.label} */}
                <div dangerouslySetInnerHTML={{ __html: question.label }} />
              </Card.Title>
              <div
                key={question.id}
                onScroll={e => handleScroll(e, question.id)}
                id={`question-card-quickAns-${question.id}`}
                role="region"
                aria-label={`question-card-quickAns-${question.id}`}
                className={
                  question.type == 3
                    ? `question-card-quickAns question-card-body question-card-quickAns-${index} demo`
                    : updatedArray.includes(question.id)
                    ? 'question-card-body'
                    : 'opacity_manage'
                }
              >
                <ParticipantQuestions
                  inBottom={inBottom}
                  setInBottom={setInBottom}
                  setScrollTopHeight={setScrollTopHeight}
                  setScrollHeight={setScrollHeight}
                  setNewScrollHeight={setNewScrollHeight}
                  scrollToBottom={scrollToBottom}
                  scrollArray={scrollArray}
                  compKey={compKey}
                  submitted={question && question.isSubmitted}
                  type={question && question.type}
                  answers={(question && question.response) || []}
                  setQuestionData={setQuestionData}
                  QuestionData={(question && question.response) || []}
                  question_id={question && question.id}
                  is_broadcast={
                    question && question.hasOwnProperty('is_broadcast')
                      ? question.is_broadcast
                      : false
                  }
                  setUpdateQue={setUpdateQue}
                  qAClassname={
                    question && question.type === 3
                      ? `question-card-quickAns-`
                      : ''
                  }
                  updateQue={updateQue}
                  updatedArray={updatedArray}
                  setList={setList}
                  left={left}
                  top={top}
                />
              </div>
            </Card.Body>
            {question && question.type !== 3 ? (
              <Card.Footer className="participant_footer">
                <>
                  {question.type !== 2 && console.log('question----', question)}
                  {updatedArray.includes(question.id) ? (
                    <Button
                      size="sm"
                      variant="blue"
                      aria-label="Submit"
                      className="ms-2 flex-fill justify-content-center"
                      onClick={() => {
                        handleDeManage(question.id);
                        onSaveQuestion(question);
                        setBtn({ val: false });
                      }}
                      disabled={
                        !submitIds.includes(question && question.id) ||
                        isUpdated
                      }
                    >
                      Submit
                    </Button>
                  ) : (
                    <div
                      className="d-flex"
                      style={{
                        justifyContent: 'space-between',
                      }}
                    >
                      <h6
                        className="text-blue"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setBtn({ val: true });
                          handlebtn(question.id);
                        }}
                      >
                        Change answer
                      </h6>
                      <p className="text-gray-middle">Submitted</p>
                    </div>
                  )}
                </>
              </Card.Footer>
            ) : (
              <Card.Footer className="p-0 participant_footer">
                <MessageInput
                  handleClick={handleQuickAnswer}
                  question={question}
                />
              </Card.Footer>
            )}
          </Card>
        </Fragment>
      </Resizable>
    </Fragment>
  );
});

Box.propTypes = {
  host_ui: PropTypes.object.isRequired,
  attendeesData: PropTypes.array,
  selected_screen: PropTypes.object,
  questions: PropTypes.array,
  questionNumbers: PropTypes.array,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  onGetQuickAnswerSuccess: PropTypes.func,
  update: PropTypes.bool,
  setUpdate: PropTypes.bool,
  layout_view: PropTypes.string,
  title: PropTypes.string,
  yellow: PropTypes.bool,
  preview: PropTypes.bool,
  question: PropTypes.object,
  id: PropTypes.string,
  refs: PropTypes.func,
  index: PropTypes.number,
  cardResize: PropTypes.array,
  left: PropTypes.number,
  top: PropTypes.number,
  meetingGroupChatId: PropTypes.array,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  const { attendeesData, host_ui, meetingGroupChatId } = hostUI;
  const { selected_screen, layout_view } = host_ui;
  return {
    attendeesData,
    selected_screen,
    layout_view,
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
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    onGetQuickAnswerSuccess: payload =>
      dispatch(onGetQuickAnswerSuccess(payload)),
    getPermissionSuccess: payload => dispatch(getPermissionSuccess(payload)),

    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Box);
