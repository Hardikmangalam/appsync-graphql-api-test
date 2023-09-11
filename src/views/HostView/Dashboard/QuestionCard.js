/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
/* eslint-disable indent */
import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Resizable } from 're-resizable';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import momentTz from 'moment-timezone';
import closeIcon from '../../../assets/images/close.svg';
import duplicatIcon from '../../../assets/images/duplicate.svg';
import broadcastIcon from '../../../assets/images/broadcast.svg';
import editIcon from '../../../assets/images/edit.svg';
import moveIcon from '../../../assets/images/move.svg';
import CustomModal from '../../../common/customModal';
import { AddQuestionDetail } from '../Modal/AddQuestion';
import { useModalWithData } from '../../../hooks/useModalWithData';
import MessageInput from '../../../common/messageInput';
import { chatGQL } from '../../../graphqlOperations/index';
import { meetingGQL } from '../../../graphqlOperations/index';

//store
import { connect } from 'react-redux';
import { compose } from 'redux';

import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';
import zoomInIcon from '../../../assets/images/zoom-in.svg';
import zoomOutIcon from '../../../assets/images/zoom-out.svg';
import maximizeIcon from '../../../assets/images/maximize.svg';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// import { onDeleteQuestionByScreen } from '../../../graphql/subscriptions';

// import { API, graphqlOperation } from 'aws-amplify';

import {
  setHostUI,
  changeScaleView,
  onDeleteQuestionSuccess,
  onGetQuickAnswerSuccess,
  onGetCardResizeSuccess,
} from '../../../store/actions/host-ui';
import { questionGQL } from '../../../graphqlOperations';
// import responseWrapper from '../../../graphqlOperations/responseWrapper';
import HostQuestions from './HostQuestions';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../store/actions/error';
import { getSecureSessionData, setSecureSessionData } from '../../../graphqlOperations/encryprWrapper';

const initialDnDState = {
  draggedFrom: null,
  draggedTo: null,
  isDragging: false,
  originalOrder: [],
  updatedOrder: [],
};

const QuestionCard = ({
  host_ui,
  questions,
  questionNumbers,
  onDeleteQuestionSuccess,
  appReceiveError,
  appReceiveSuccess,
  onGetQuickAnswerSuccess,
  onGetCardResizeSuccess,
  update,
  setUpdate,
  attendeesData,
  selected_screen,
}) => {
  const pointX = useRef();
  const pointY = useRef();

  const [list, setList] = useState([]);
  const [payload, setPayload] = useState({});
  const [dragAndDrop, setDragAndDrop] = useState(initialDnDState);
  const [editQuestionModal, setEditQuestionModal] = useState();
  const { modalOpen, setModalState } = useModalWithData();
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [compKey, setCompKey] = useState(0);
  const [quickText, setQuickText] = useState({ name: '', value: '' });
  const [quickType, setQuickType] = useState({});
  const [broadcast, setbroadcast] = useState({
    broad: false,
    id: '',
  });
  const [width, setWidth] = useState(null);

  const [height, setHeight] = useState(null);
  const [questionData, setQuestionData] = useState({});
  const [zoomImage, setZoomImage] = useState(false);

  const [scrollTopHeight, setScrollTopHeight] = useState(null);
  const [oldScrollHeight, setScrollHeight] = useState(null);
  const [newScrollHeight, setNewScrollHeight] = useState(null);
  const [inBottom, setInBottom] = useState(true);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [userCountData, setUserCountData] = useState({});
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
      setInBottom(true);
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
  const onDragStart = event => {
    const crt = event.currentTarget.cloneNode(true);

    crt.style.transform = 'rotate(2deg)';
    crt.style.overflow = 'hidden';
    crt.style.width = `${event.currentTarget.offsetWidth}px`;
    crt.classList.add('border-blue');
    crt.querySelector('.card-header').classList.add('overflow-hidden');
    crt.querySelector('.card-header button').classList.add('d-none');
    crt.querySelector('.card-body').classList.add('d-none');
    crt.querySelector('.card-footer').classList.add('d-none');
    crt.classList.add('ghost-image');
    crt.style.position = 'absolute';
    crt.style.top = '0px';
    crt.style.right = '0px';
    document.body.appendChild(crt);
    event.dataTransfer.setDragImage(crt, 0, 0);
    const initialPosition = Number(event.currentTarget.dataset.position);

    setDragAndDrop({
      ...dragAndDrop,
      draggedFrom: initialPosition,
      isDragging: true,
      originalOrder: list,
    });
    event.dataTransfer.setData('text/html', '');
  };

  const onDragOver = event => {
    event.preventDefault();
    const draggedTo = Number(event.currentTarget.dataset.position);
    setTimeout(() => {
      if (draggedTo !== dragAndDrop.draggedTo) {
        setDragAndDrop({
          ...dragAndDrop,
          draggedTo,
        });
      }
    }, 100);
  };
  const onDrop = () => {
    const { draggedFrom, draggedTo } = dragAndDrop;

    const newList = dragAndDrop.originalOrder;
    const itemDropped = newList[draggedTo];
    const itemDragged = newList[draggedFrom];
    newList[draggedFrom] = itemDropped;
    newList[draggedTo] = itemDragged;
    setList(newList);
    const orderData = [];
    newList.filter(el => {
      orderData.push(el && el.id);
    });
    changeOrder(orderData);
    setTimeout(() => {
      setDragAndDrop({
        ...dragAndDrop,
        draggedFrom: null,
        draggedTo: null,
        isDragging: false,
      });
    }, 100);

    const ghostImage = document.querySelector('.ghost-image');
    if (ghostImage) {
      ghostImage.remove();
    }
  };

  const changeOrder = orderData => {
    const payloadData = {
      screen_id: selectedScreen,
      question_ids: orderData,
    };
    if (payloadData) {
      updateQuestionOrder(payloadData);
    }
  };

  const onDragLeave = () => {
    setDragAndDrop({
      ...dragAndDrop,
      draggedTo: null,
    });
  };
  const onDragEnd = () => {
    setTimeout(() => {
      setDragAndDrop({
        ...dragAndDrop,
        draggedTo: null,
        draggedFrom: null,
      });
    }, 100);

    const ghostImage = document.querySelector('.ghost-image');
    if (ghostImage) {
      ghostImage.remove();
    }
  };

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

  const handleAddQuestion = () => {
    // props.addQuestionRequest(payloadData);
    if (Object.keys(payload).length) {
      updateQuestionHandler(payload);
    }
    setModalState(false);
  };

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

  async function updateQuestionOrder(payload) {
    try {
      // if (payload.id == 'initalAdd') delete payload.id;
      const { message, success } = await questionGQL.updateQuestionOrderHandler(
        payload,
      );
      success ? appReceiveSuccess(message) : appReceiveError(message);
    } catch (err) {
      appReceiveError(err);
    }
  }
  async function duplicateQuestion(data) {
    try {
      let payloadData = { ...data };
      delete payloadData.id;
      delete payloadData.que_display_seq;
      delete payloadData.userCount;
      delete payloadData.totalUsers;
      delete payloadData.isSubmitted;
      delete payloadData.is_broadcast;
      delete payloadData.metadata;
      payloadData = {
        ...payloadData,
        input_type: payloadData.type,
        screen_id: selectedScreen,
        response: payloadData.response.map(({ name }) => name),
      };
      const { success, message } = await questionGQL.createQuestionHandler(
        payloadData,
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

  async function deleteQuestionHandler(screenId, queId) {
    try {
      const payload = { screen_id: screenId, id: queId };
      onDeleteQuestionSuccess(payload);
      const { success, message } = await questionGQL.deleteQuestionHandler(
        payload,
      );
      success ? appReceiveSuccess(message) : appReceiveError(message);
    } catch (err) {
      broadcastHadler;
      appReceiveError(err);
    }
  }

  useEffect(() => {
    if (host_ui && Object.keys(host_ui.selected_screen).length) {
      setSelectedScreen(host_ui.selected_screen.id);
    }
  }, [host_ui.selected_screen]);

  useEffect(() => {
    document.querySelector('.dashboard-wrapper').scrollTo(0, 0);
  }, [selectedScreen]);

  useEffect(() => {
    setInBottom(true);
  }, [getSecureSessionData('selectedScreen')]);

  useEffect(() => {
    if (questions && questions.length >= 0) {
      setList(questions);
    }
  }, [questions]);

  const handleIncrease = () => {
    setZoomImage(true);
    setUpdate(false);
  };

  const handleDecrease = () => {
    setZoomImage(false);
    setUpdate(true);
  };

  // useEffect(() => {
  //   const subscription = API.graphql(
  //     graphqlOperation(onDeleteQuestionByScreen),
  //   ).subscribe({
  //     next: ({ provider, value }) => {
  //       const response = responseWrapper(value, 'onDeleteQuestionByScreen');
  //       // // Action to add screen data
  //       onDeleteQuestionSuccess(response);
  //     },
  //     error: error => console.warn(error),
  //   });

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);

  async function handleQuickAnswer(questionData) {
    setInBottom(true);
    try {
      let userData = getSecureSessionData('UserData');

      userData = JSON.parse(userData);

      const payload = {
        question_id: questionData && questionData.id,
        meeting_id: userData ? userData.meetingData.id : '',
        chat: {
          userDBId: userData.userData.id,
          user_Id: userData ? userData.user_id : '',
          text: quickText.value,

          timezone: momentTz.tz.guess(),
        },
      };
      setQuickText({ name: '', value: '' });

      onGetQuickAnswerSuccess({
        ...payload,
        chat: {
          ...payload.chat,
          id: 'chat-id',
        },
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
        document.querySelector(
          `#question-card-quickAns-${data.question_id}`,
        ).scrollTop = document.querySelector(
          `#question-card-quickAns-${data.question_id}`,
        ).scrollHeight;
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

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
    setWidth(null);
    setHeight(null);
  }, [host_ui && host_ui.selected_screen && host_ui.selected_screen.id]);

  async function handleCardResize() {
    try {
      const payload = {
        question_id: questionData && questionData.id,
        screen_id:
          host_ui && host_ui.selected_screen && host_ui.selected_screen.id,
        height,
        width,
      };

      const { success, data } = await meetingGQL.changeCardSizeHandler(payload);
      if (success) {
        onGetCardResizeSuccess(data);
      }
    } catch (err) {
      console.log('err', err);
    }
  }

  useEffect(() => {
    handleCardResize();
  }, [height, width]);

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
        width: question && question.metadata && question.metadata.width,
        height: question && question.metadata && question.metadata.height,
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
    <>
      <TransformWrapper
        defaultScale={1}
        initialPositionX={0}
        initialPositionY={0}
        doubleClick={{ disabled: true }}
        centerOnInit={{ disabled: true }}
        wheel={{ wheelEnabled: false }}
        pan={{ disabled: true }}
      >
        {({
          zoomIn,
          zoomOut,
          resetTransform,
          setScale,
          previousScale,

          ...rest
        }) => (
          <div
            className={
              (update && 'transform-class') ||
              (zoomImage && 'cursor-grab update-zoomin')
            }
          >
            <TransformComponent>
              <div className="question d-flex">
                {list &&
                  questionNumbers &&
                  list.length > 0 &&
                  questionNumbers.length > 0 &&
                  list.map((question, index) => (
                    <Resizable
                      key={index}
                      id={index}
                      size={getSize(question)}
                      enable={{
                        top: false,
                        right: true,
                        bottom: true,
                        left: false,
                        topRight: false,
                        bottomRight: false,
                        bottomLeft: false,
                        topLeft: false,
                      }}
                      onResizeStop={(e, direction, ref, d) => {
                        e.target.style.width = `${d.width}px`;
                        e.target.style.height = `${d.height}px`;
                        setQuestionData(question);
                        setHeight(document.getElementById(index).style.height);
                        setWidth(document.getElementById(index).style.width);
                      }}
                      onResizeStart={() => {
                        const leftPos = document.querySelector(
                          '.dashboard-wrapper',
                        ).scrollLeft;
                        const bottomPos = document.querySelector(
                          '.dashboard-wrapper',
                        ).scrollTop;
                        pointX.current = leftPos;
                        pointY.current = bottomPos;
                      }}
                      onResize={() => {
                        document.querySelector(
                          '.dashboard-wrapper',
                        ).scrollLeft = pointX.current;
                        document.querySelector('.dashboard-wrapper').scrollTop =
                          pointY.current;
                      }}
                      // className="question-card-resize"
                      className={`${
                        question && question.type === 3
                          ? 'question-card-resizeQuick'
                          : 'question-card-resize'
                      }`}
                      handleStyles={{ height: '335px' }}
                    >
                      <Card
                        data-position={index}
                        draggable
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onDragLeave={onDragLeave}
                        onDragEnd={onDragEnd}
                        className={classNames(
                          {
                            'drop-area':
                              dragAndDrop &&
                              dragAndDrop.draggedTo == Number(index) &&
                              dragAndDrop.draggedFrom !== null &&
                              dragAndDrop.draggedTo !== null,
                            'drag-area':
                              dragAndDrop &&
                              dragAndDrop.draggedFrom == Number(index) &&
                              dragAndDrop.draggedTo !== null,
                          },
                          'question-card',
                        )}
                      >
                        <Card.Header
                          className="fw-bold d-flex justify-content-between align-items-center py-2 fw-14"
                          key={question && question.id}
                        >
                          {/* Q{index + 1} */}
                          {!getQuetionNumbers(question && question.id)
                            ? `Q ${index + 1}`
                            : getQuetionNumbers(question && question.id)}
                          {/* {getQuetionNumbers(question && question.id)} */}
                          {(getSecureSessionData('isNewTemplate') !==
                            'false' ||
                            getSecureSessionData('isEditTemplate')) && (
                            <Button
                              onClick={() =>
                                removeQuestion(
                                  selectedScreen,
                                  question && question.id,
                                )
                              }
                              className="p-0"
                            >
                              <Image src={closeIcon} alt="Close" width={24} />
                            </Button>
                          )}
                        </Card.Header>
                        <Card.Body
                          className={classNames(
                            { 'host-3-type': question && question.type === 3 },
                            'host',
                          )}
                        >
                          <Card.Title className="fw-bold fw-14 text-start bg-alice-blue">
                            {question && question.label}
                          </Card.Title>
                          <div
                            key={question && question.id && question.id}
                            onScroll={event => handleScroll(event, question.id)}
                            id={`question-card-quickAns-${question.id}`}
                            className={
                              question && question.type === 3
                                ? `question-card-body question-card-quickAns host question-card-quickAns-${index}`
                                : 'question-card-body'
                            }
                          >
                            <HostQuestions
                              inBottom={inBottom}
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
                              handleClick={() => handleQuickAnswer(question)}
                              setQuickText={setQuickText}
                              quickText={quickText}
                              question={question}
                              handleKeydown={handleKeydown}
                              handleInputClick={() => setQuickType(question)}
                            />
                          )}
                        </Card.Body>
                        {(getSecureSessionData('isNewTemplate') !== 'false' ||
                          getSecureSessionData('isEditTemplate')) && (
                          <Card.Footer className="d-flex participant_footer participant_footer_count">
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
                                  onClick={() => duplicateQuestion(question)}
                                  className="ms-auto btn-icon-default"
                                >
                                  <Image
                                    src={duplicatIcon}
                                    alt="Duplicate"
                                    width={24}
                                  />
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
                                  >
                                    <Image
                                      src={broadcastIcon}
                                      alt="Broadcast"
                                      width={24}
                                      className={
                                        broadVal.includes(
                                          question && question.id,
                                        ) ||
                                        (broadcast &&
                                          broadcast.broad &&
                                          broadcast.id ===
                                            (question && question.id))
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
                              onClick={() => {
                                setModalState(true);
                                setEditQuestionModal(question && question.type);
                                handleChange(question);
                              }}
                            >
                              <Image src={editIcon} alt="Edit" width={24} />
                            </Button>
                          </Card.Footer>
                        )}

                        {dragAndDrop &&
                          dragAndDrop.draggedFrom !== dragAndDrop.draggedTo && (
                            <div className="switch-card">
                              <Image src={moveIcon} alt="Move" width={32} />
                              <div className="text-blue fw-14 mt-2 fw-bold">
                                Switch
                              </div>
                            </div>
                          )}
                      </Card>
                    </Resizable>
                  ))}
              </div>
            </TransformComponent>
            <CustomModal
              title={modalOpen ? 'Edit Question' : 'Add New Question'}
              isActive={modalOpen}
              isEdit={modalOpen}
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
                isEdit={modalOpen}
                questionLabel={payload.label || ''}
                handleChange={handleChange}
              />
            </CustomModal>
            <div className="dashboard-footer__right">
              <Button
                variant="white"
                className="btn-icon ms-auto"
                onClick={e => {
                  handleDecrease();
                  setTimeout(() => {
                    resetTransform(e);
                  }, 100);
                }}
              >
                <Image src={maximizeIcon} alt="Add" width={24} />
              </Button>
              <Button
                variant="white"
                className="btn-icon ms-3"
                onClick={e => {
                  handleIncrease();
                  setTimeout(() => {
                    setScale(previousScale - 0.5);
                  }, 100);
                }}
              >
                <Image src={zoomOutIcon} alt="Add" width={24} />
              </Button>
              <Button
                variant="white"
                className="btn-icon ms-3"
                onClick={() => {
                  handleIncrease();
                  setTimeout(() => {
                    setScale(previousScale + 0.5);
                  }, 100);
                }}
              >
                <Image src={zoomInIcon} alt="Add" width={24} />
              </Button>
            </div>
          </div>
        )}
      </TransformWrapper>
    </>
  );
};

QuestionCard.propTypes = {
  host_ui: PropTypes.object.isRequired,
  attendeesData: PropTypes.array,
  selected_screen: PropTypes.object,
  questions: PropTypes.array,
  questionNumbers: PropTypes.array,
  onDeleteQuestionSuccess: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  onGetQuickAnswerSuccess: PropTypes.func,
  onGetCardResizeSuccess: PropTypes.func,
  update: PropTypes.bool,
  setUpdate: PropTypes.bool,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  const { attendeesData, host_ui } = hostUI;
  const { selected_screen } = host_ui;
  return {
    attendeesData,
    selected_screen,
    host_ui: getHostUI(hostUI),
    questions: hostUI.questions,
    questionNumbers: hostUI.questionNumbers,
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
    onGetCardResizeSuccess: payload =>
      dispatch(onGetCardResizeSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(QuestionCard);
