import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import HostQuestions from '../HostQuestions';
import MessageInput from '../../../../common/messageInput';
import injectReducer from '../../../../utils/injectReducer';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { getPermissionSuccess } from '../../../../store/actions/login';
import {
  changeScaleView,
  onGetCardResizeSuccess,
  onGetLayoutSuccess,
  onGetQuestionNumbersSuccess,
  onGetQuickAnswerSuccess,
  setHostUI,
} from '../../../../store/actions/host-ui';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../../store/actions/error';
import reducer, { getHostUI } from '../../../../store/reducers/host-ui';
import {
  chatGQL,
  meetingGQL,
  questionGQL,
} from '../../../../graphqlOperations';
import closeIcon from '../../../../assets/images/close.svg';
import momentTz from 'moment-timezone';
import editIcon from '../../../../assets/images/edit.svg';
import broadcastIcon from '../../../../assets/images/broadcast.svg';
import duplicatIcon from '../../../../assets/images/duplicate.svg';
import moveIcon from '../../../../assets/images/move.svg';
import { Resizable } from 're-resizable';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../../graphqlOperations/encryprWrapper';
import { map } from 'lodash';

const initialDnDState = {
  draggedFrom: null,
  draggedTo: null,
  isDragging: false,
  originalOrder: [],
  updatedOrder: [],
};

const Box = memo(function Box({
  preview,
  question,
  host_ui,
  id,
  questionNumbers,
  appReceiveError,
  appReceiveSuccess,
  onGetQuickAnswerSuccess,
  onGetCardResizeSuccess,
  attendeesData,
  layout_view,
  refs,
  duplicateQuestion,
  deleteQuestionHandler,
  handleChange,
  setModalState,
  setEditQuestionModal,
  setEditQuestionNumber,
  setEditQueId,
  getOnlyQuetionNumbers,
  setEditNumber,
  setIsLoading,
  setQuestionError,
  onUpdateResize,
  meetingGroupChatId,
  meetingGroupChatIndex,
}) {
  const [dragAndDrop] = useState(initialDnDState);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [compKey, setCompKey] = useState(0);
  const [broadcast, setbroadcast] = useState({
    broad: false,
    id: '',
  });

  const [, setUserCountData] = useState({});
  const [scrollTopHeight, setScrollTopHeight] = useState(null);
  const [oldScrollHeight, setScrollHeight] = useState(null);
  const [newScrollHeight, setNewScrollHeight] = useState(null);
  const [inBottom, setInBottom] = useState(true);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [, setWindowWidth] = useState(0);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [questionData, setQuestionData] = useState({});
  const pointX = useRef();
  const pointY = useRef();
  let resizeWindow = () => {
    setWindowWidth(window.innerWidth);
    const bp = {
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
      xxs: 0,
    };
    let isBpSet = false;
    Object.keys(bp).map((b, i) => {
      const key = Object.keys(bp)[i];
      if (bp[key] < window.innerWidth && !isBpSet) {
        // setCurrentBreakpoint(key);
        isBpSet = true;
        return;
      }
    });
  };

  useEffect(() => {
    resizeWindow();
    window.addEventListener('resize', resizeWindow);
    return () => window.removeEventListener('resize', resizeWindow);
  }, []);

  let scrollArray = JSON.parse(getSecureSessionData('newMessage')) || [];

  const [attendeesListData, setAttendeesData] = useState({
    Hosts: [],
    Moderator: [],
    Participants: [],
    Observers: [],
  });

  useEffect(() => {
    if (attendeesData.length) {
      const attendeesList = {
        Hosts: attendeesData
          ? attendeesData.filter(
              e =>
                e.userData.role_name === 'HOST' ||
                e.userData.role_name === 'ADMIN',
            )
          : [],
        Moderator: attendeesData
          ? attendeesData.filter(e => e.userData.role_name == 'MODERATOR')
          : [],
        Participants: attendeesData
          ? attendeesData.filter(e => e.userData.role_name == 'PARTICIPANT')
          : [],
        Observers: attendeesData
          ? attendeesData.filter(e => e.userData.role_name == 'OBSERVER')
          : [],
      };
      setAttendeesData(attendeesList);
    } else {
      const attendeesList = {
        Hosts: [],
        Moderator: [],
        Participants: [],
        Observers: [],
      };
      setAttendeesData(attendeesList);
    }
  }, [attendeesData]);

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
      setCompKey(compKey + 1);
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
        const data = scrollArray.filter(e => e != Number(event.target.id));
        scrollArray = data;
        setSecureSessionData('newMessage', JSON.stringify(data));
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

  const broadVal = getSecureSessionData('broadcast_questions') || [];

  const broadcastHadler = async question_id => {
    let questionroadcastList =
      getSecureSessionData('broadcast_questions') || [];
    if (!questionroadcastList.length) questionroadcastList = [];
    else questionroadcastList = JSON.parse(questionroadcastList);

    let payload = {},
      is_broadcast = true;

    if (
      questionroadcastList &&
      Array.isArray(questionroadcastList) &&
      questionroadcastList.length
    ) {
      is_broadcast = questionroadcastList.find(e => e == question_id)
        ? false
        : true;

      if (!is_broadcast) {
        questionroadcastList = questionroadcastList.filter(
          e => e !== question_id,
        );
      } else {
        questionroadcastList = [...questionroadcastList, question_id];
      }

      setSecureSessionData(
        'broadcast_questions',
        JSON.stringify(questionroadcastList),
      );
    } else {
      questionroadcastList = [question_id];
      setSecureSessionData(
        'broadcast_questions',
        JSON.stringify(questionroadcastList),
      );
    }
    setbroadcast({ broad: is_broadcast, id: question_id });
    payload = {
      screen_id: selectedScreen,
      question_id,
      is_broadcast,
    };
    const { message, success } = await questionGQL.broadcastQuestionHandler(
      payload,
    );
    success ? appReceiveSuccess(message) : appReceiveError(message);
  };

  async function handleDuplicateQuestion(data) {
    let payloadData = { ...data };
    delete payloadData.id;
    delete payloadData.que_display_seq;
    delete payloadData.userCount;
    delete payloadData.totalUsers;
    delete payloadData.isSubmitted;
    delete payloadData.is_broadcast;
    delete payloadData.metadata;
    delete payloadData.isHost;
    delete payloadData.isMount;
    delete payloadData.left;
    delete payloadData.top;
    delete payloadData.queNoId;
    payloadData = {
      ...payloadData,
      input_type: payloadData.type,
      screen_id: selectedScreen,
      response: payloadData.response.map(({ name }) => name),
    };
    await duplicateQuestion(payloadData);
  }

  // const handleChange = data => {
  //   const py = {
  //     ...payload,
  //     ...data,
  //   };
  //   setPayload(py);
  // };

  const removeQuestion = (screenId, queId) => {
    deleteQuestionHandler(screenId, queId);
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

  useEffect(() => {
    if (
      host_ui &&
      Object.keys(host_ui.selected_screen).length &&
      host_ui.selected_screen.id !== selectedScreen
    ) {
      setSelectedScreen(host_ui.selected_screen.id);
    }
  }, [host_ui.selected_screen.id]);

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

  async function handleQuickAnswer(questionData, value) {
    setInBottom(true);
    try {
      const userData = JSON.parse(getSecureSessionData('UserData') || '{}');
     
      const payload = {
        question_id: questionData?.id,
        meetingGroupIds: meetingGroupChatId || [],
        meetingGroupIndex: meetingGroupChatIndex || [],
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
        meetingGroupIds: payload.meetingGroupIds,
        meetingGroupIndex: payload.meetingGroupIndex,
        userCount: questionData.userCount || 0,
      });

      const { success, data, message } = await chatGQL.getQuickAnswerHandler(
        payload,
      );

      if (!success) {
        appReceiveError(message);
      } else {
        setUserCountData({
          userCount: data.userCount,
          question_id: data.question_id,
        });

        const questionCard = document.querySelector(
          `#question-card-quickAns-${data.question_id}`,
        );
        questionCard.scrollTop = questionCard.scrollHeight;
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  // const handleKeydown = (e, id) => {
  //   if (e.keyCode == 13 && e.shiftKey) {
  //     // setQuickText({ name: id, value: e.target.value + '\n' });
  //     e.preventDefault();
  //   } else if (e.key == 'Enter') {
  //     e.preventDefault();
  //     // handleQuickAnswer(quickType);
  //     // setQuickText({ name: '', value: '' });
  //   }
  // };

  useEffect(() => {
    setWidth(null);
    setHeight(null);
  }, [selectedScreen, question]);

  async function handleCardResizeDataValue(widths, heights, id) {
    let myString = widths.replace(/\D/g, '');
    try {
      const screenJson = JSON.parse(getSecureSessionData('selectedScreen'));
      const payload = {
        question_id: Number(id) || (questionData && questionData.id),
        screen_id:
          Number(screenJson.id) ||
          (host_ui && host_ui.selected_screen && host_ui.selected_screen.id),
        height: heights,
        width: widths,
      };
      const { success, data } = await meetingGQL.changeCardSizeHandler(payload);
      if (success) {
        // if (myString < 335) {
        //   myString = 335;
        // }
        onUpdateResize(myString, id);
        onGetCardResizeSuccess(data);
        // getScreenLayoutHandlerdata();
      }
    } catch (err) {
      console.log('err', err);
    }
  }

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

  return (
    <Fragment key={question.id}>
      <Resizable
        key={question.id}
        id={`res_${question.id}`}
        size={getSize(question)}
        enable={{
          top: false,
          right:
            [true, 'true'].includes(
              getSecureSessionData('allowEditTemplate'),
            ) || [true, 'true'].includes(getSecureSessionData('isNewTemplate')),
          bottom:
            [true, 'true'].includes(
              getSecureSessionData('allowEditTemplate'),
            ) || [true, 'true'].includes(getSecureSessionData('isNewTemplate')),
          // right: true,
          // bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        onResizeStop={(e, direction, ref, d) => {
          // e.target.style.width = `${d.width}px`;
          // e.target.style.height = `${d.height}px`;
          handleCardResizeDataValue(
            document.getElementById(`res_${question.id}`).style.width,
            document.getElementById(`res_${question.id}`).style.height,
            question.id,
          );
          setQuestionData(question);
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
        {['HOST', 'ADMIN'].includes(getSecureSessionData('role')) && (
          <Card key={question.id} className="h-100 w-100" role="region">
            <Card.Header
              className="fw-bold d-flex justify-content-between align-items-center py-2 fw-14 shadow-none position-relative"
              ref={refs}
            >
              {!getQuetionNumbers(question && question.id)
                ? `Q ${id + 1}`
                : getQuetionNumbers(question && question.id)}
              {(getSecureSessionData('isNewTemplate') !== 'false' ||
                getSecureSessionData('isEditTemplate')) && (
                <div className="d-flex">
                  {![true, 'true'].includes(
                    getSecureSessionData('isStartMeeting'),
                  ) && (
                    <Button
                      className="p-0"
                      aria-label="Edit"
                      onClick={() => {
                        setEditQueId(question && question.id);
                        setEditNumber(
                          getOnlyQuetionNumbers(question && question.id),
                        );
                        setQuestionError('');
                        setIsLoading(false);
                        setEditQuestionNumber(true);
                      }}
                    >
                      <Image src={editIcon} alt="Edit" width={24} />
                    </Button>
                  )}
                  <Button
                    onClick={() =>
                      removeQuestion(selectedScreen, question && question.id)
                    }
                    aria-label="Close"
                    className="p-0"
                  >
                    <Image src={closeIcon} alt="Close" width={24} />
                  </Button>
                </div>
              )}
            </Card.Header>
            <Card.Body
              className={classNames(
                { 'host-3-type': question && question.type === 3 },
                'host p-0 pb-3',
              )}
            >
              <Card.Title
                id={`question-card-title-${question.id}`}
                className="fw-bold fw-14 text-start bg-alice-blue px-3 py-2"
              >
                <div dangerouslySetInnerHTML={{ __html: question.label }} />
              </Card.Title>
              <div
                key={question && question.id && question.id}
                role="region"
                aria-label={`question-card-quickAns-${question.id}`}
                onScroll={event => handleScroll(event, question.id)}
                id={`question-card-quickAns-${question.id}`}
                className={
                  question && question.type === 3
                    ? `question-card-body question-card-quickAns host question-card-quickAns-${id}`
                    : 'question-card-body'
                }
              >
                <HostQuestions
                  inBottom={inBottom}
                  meetingGroupChatId={meetingGroupChatId}
                  setInBottom={setInBottom}
                  setScrollTopHeight={setScrollTopHeight}
                  setScrollHeight={setScrollHeight}
                  scrollArray={scrollArray}
                  setNewScrollHeight={setNewScrollHeight}
                  scrollToBottom={scrollToBottom}
                  question={question}
                  type={question && question.type}
                  answers={(question && question.response) || []}
                  selectedScreen={selectedScreen}
                  host={host_ui}
                  qAClassname={
                    question && question.type === 3
                      ? `question-card-quickAns-`
                      : ''
                  }
                />
              </div>
              {question && question.type == 3 && (
                <MessageInput
                  handleClick={handleQuickAnswer}
                  question={question}
                />
              )}
            </Card.Body>
            {(getSecureSessionData('isNewTemplate') !== 'false' ||
              getSecureSessionData('isEditTemplate')) && (
              <Card.Footer
                id={`question-card-footer-${question.id}`}
                className="d-flex participant_footer participant_footer_count"
              >
                <div>
                  <p className="mb-0">
                    Participants Answered:&nbsp;
                    <b>{question && question.userCount}</b>
                  </p>
                  <p className="mb-0">
                    Live Participants:&nbsp;
                    <b>{attendeesListData.Participants.length}</b>
                  </p>
                </div>
                {question && question.type !== 3 && (
                  <>
                    <Button
                      onClick={() => handleDuplicateQuestion(question)}
                      className="ms-auto btn-icon-default"
                      aria-label="Duplicate"
                    >
                      <Image src={duplicatIcon} alt="Duplicate" width={24} />
                    </Button>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip>Broadcast Results</Tooltip>}
                    >
                      <Button
                        className="ms-3 btn-icon-default"
                        onClick={() => {
                          broadcastHadler(question && question.id);
                        }}
                        aria-label="broadCast"
                      >
                        <Image
                          src={broadcastIcon}
                          alt="Broadcast"
                          width={24}
                          className={
                            broadVal.includes(question && question.id) ||
                            (broadcast &&
                              broadcast.broad &&
                              broadcast.id === (question && question.id))
                              ? 'bg-color'
                              : 'bg-none'
                          }
                        />
                      </Button>
                    </OverlayTrigger>
                  </>
                )}

                <Button
                  className={
                    question && question.type !== 3
                      ? 'ms-3 btn-icon-default'
                      : 'edit-btn'
                  }
                  aria-label="Edit"
                  onClick={() => {
                    setModalState(true);
                    setEditQuestionModal(question && question.type);
                    handleChange(question);
                    setEditQuestionNumber();
                  }}
                >
                  <Image src={editIcon} alt="Edit" width={24} />
                </Button>
              </Card.Footer>
            )}
            {dragAndDrop && dragAndDrop.draggedFrom !== dragAndDrop.draggedTo && (
              <div className="switch-card">
                <Image src={moveIcon} alt="Move" width={32} />
                <div className="text-blue fw-14 mt-2 fw-bold">Switch</div>
              </div>
            )}
          </Card>
        )}
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
  onGetCardResizeSuccess: PropTypes.func,
  onGetLayoutSuccess: PropTypes.func,
  update: PropTypes.bool,
  setUpdate: PropTypes.bool,
  layout_view: PropTypes.string,
  onGetQuestionNumbersSuccess: PropTypes.func,
  title: PropTypes.string,
  preview: PropTypes.bool,
  question: PropTypes.object,
  id: PropTypes.string,
  refs: PropTypes.func,
  duplicateQuestion: PropTypes.func,
  deleteQuestionHandler: PropTypes.func,
  handleChange: PropTypes.func,
  setModalState: PropTypes.func,
  setEditQuestionModal: PropTypes.func,
  setQuestionError: PropTypes.func,
  setEditQuestionNumber: PropTypes.func,
  setEditQueId: PropTypes.func,
  setEditNumber: PropTypes.func,
  setIsLoading: PropTypes.func,
  getOnlyQuetionNumbers: PropTypes.func,
  onUpdateResize: PropTypes.func,
  meetingGroupChatId: PropTypes.array,
  meetingGroupChatIndex: PropTypes.array,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  const {
    attendeesData,
    host_ui,
    meetingGroupChatId,
    meetingGroupChatIndex,
  } = hostUI;
  const { selected_screen, layout_view } = host_ui;
  return {
    attendeesData,
    selected_screen,
    layout_view,
    meetingGroupChatId: map(meetingGroupChatId, Number),
    meetingGroupChatIndex: map(meetingGroupChatIndex, Number),
    host_ui: getHostUI(hostUI),
    questions: hostUI.questions,
    questionNumbers: hostUI.questionNumbers,
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
    onGetCardResizeSuccess: payload =>
      dispatch(onGetCardResizeSuccess(payload)),
    onGetLayoutSuccess: payload => dispatch(onGetLayoutSuccess(payload)),
    onGetQuestionNumbersSuccess: payload =>
      dispatch(onGetQuestionNumbersSuccess(payload)),
    getPermissionSuccess: payload => dispatch(getPermissionSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Box);
