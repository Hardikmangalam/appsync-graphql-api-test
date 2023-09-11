/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
/* eslint-disable indent */
import React, { useEffect, useRef, useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CustomModal from '../../../common/customModal';
import { AddQuestionDetail } from '../Modal/AddQuestion';
import { useModalWithData } from '../../../hooks/useModalWithData';
import { userGQL } from '../../../graphqlOperations/index';
import { meetingGQL } from '../../../graphqlOperations/index';
import { connect } from 'react-redux';
import { compose } from 'redux';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';
import 'gridstack/dist/gridstack.min.css';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  setHostUI,
  changeScaleView,
  onDeleteQuestionSuccess,
  onGetLayoutSuccess,
  onGetQuestionNumbersSuccess,
  onGetQuestionSuccess,
} from '../../../store/actions/host-ui';
import { questionGQL } from '../../../graphqlOperations';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../store/actions/error';
import _ from 'lodash';
import { getPermissionSuccess } from '../../../store/actions/login';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Example from './dnd-flow/Example';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

const initialDnDState = {
  draggedFrom: null,
  draggedTo: null,
  isDragging: false,
  originalOrder: [],
  updatedOrder: [],
};

const StackQuestionCard = ({
  host_ui,
  questions,
  questionNumbers,
  onDeleteQuestionSuccess,
  appReceiveError,
  appReceiveSuccess,
  update,
  setUpdate,
  attendeesData,
  selected_screen,
  onGetLayoutSuccess,
  onGetQuestionNumbersSuccess,
  onGetQuestionSuccess,
  layout_view,
}) => {
  const [list, setList] = useState([]);
  const [listQuestionNumbers, setListQuestionNumbers] = useState([]);
  const [payload, setPayload] = useState({});
  const [editContent, setEditContent] = useState('');
  const [dragAndDrop, setDragAndDrop] = useState(initialDnDState);
  const [editQuestionModal, setEditQuestionModal] = useState();
  const { modalOpen, setModalState } = useModalWithData();
  const { editQuestionNumber, setEditQuestionNumber } = useModalWithData();
  const [editNumber, setEditNumber] = useState();
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [saveQuestionKey, setSaveQuestionKey] = useState(0);
  const [compKey, setCompKey] = useState(0);
  const [quickText, setQuickText] = useState({ name: '', value: '' });
  const [loading, setLoading] = useState(false);
  const [broadcast, setbroadcast] = useState({
    broad: false,
    id: '',
  });

  const [width, setWidth] = useState(null);
  const [questionError, setQuestionError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [height, setHeight] = useState(null);
  const [zoomImage, setZoomImage] = useState(false);
  const [isLayoutChanged, setIsLayoutChanged] = useState(false);

  const [scrollTopHeight, setScrollTopHeight] = useState(null);
  const [oldScrollHeight, setScrollHeight] = useState(null);
  const [newScrollHeight, setNewScrollHeight] = useState(null);
  const [inBottom, setInBottom] = useState(true);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [userCountData, setUserCountData] = useState({});
  const [currentScreenId, setCurrentScreenId] = useState('');
  const [currentInterval, setCurrentInterval] = useState('');
  const [layoutCompKey, setLayoutCompKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(
    Number(getSecureSessionData('zoomLevel')) || 1,
  );
  const [windowWidth, setWindowWidth] = useState(0);
  const [layouts, setLayouts] = useState({ lg: [] });

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
        setCurrentBreakpoint(key);
        isBpSet = true;
        return;
      }
    });
  };
  useEffect(() => {
    setSecureSessionData('zoomLevel', zoomLevel.toString());
  }, [zoomLevel]);

  useEffect(() => {
    resizeWindow();
    window.addEventListener('resize', resizeWindow);
    return () => window.removeEventListener('resize', resizeWindow);
  }, []);

  const [isUpdateKey, setIsUpdateKey] = useState(0);
  const [editSequence, setEditQueId] = useState();
  let scrollArray = JSON.parse(getSecureSessionData('newMessage')) || [];

  const [attendeesListData, setAttendeesData] = useState({
    Hosts: [],
    Moderator: [],
    Participants: [],
    Observers: [],
  });
  const [items, setItems] = useState([{ id: 'item-1' }, { id: 'item-2' }]);

  const meetingName = JSON.parse(getSecureSessionData('UserData'));
  let currentMeetingId = null;
  if (meetingName !== null && Object.keys(meetingName).length) {
    const {
      meetingData: { id },
    } = meetingName;
    currentMeetingId = Number(id);
  }

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
      question_ids: 12, //add question id
    };
    if (payloadData) {
      updateQuestionOrder(payloadData);
    }
  };

  const handleEditQuestionNumber = () => {
    // const payloadData = {
    //   screen_id: selectedScreen,
    //   question_ids: 12,
    //   oldQueNo: editSequence,
    //   // newQueNo:
    // };
    // if (payloadData) {
    //   console.log('payloadData:::::::::', payloadData);
    //   updateQuestionOrder(payloadData);
    //   setEditQuestionNumber(false);
    // }
    setQuestionError('');
    if (!editNumber) {
      setQuestionError('Please enter question number');
      return;
    }
    const currentQuest = list.find(l => l.id === editSequence);
    const listIds = list.map(l => l.id);
    const arrOfNum = listIds.map(
      id => questionNumbers.find(el => el.id == id).queNo,
    );

    const queNos = arrOfNum.map(str => {
      return parseInt(str, 10);
    });
    const minList = queNos.reduce(function(res, obj) {
      return obj < res ? obj : res;
    });
    const maxList = queNos.reduce(function(res, obj) {
      return obj > res ? obj : res;
    });
    const payload = {
      screenId: selectedScreen,
      questionId: Number(currentQuest.queNoId),
      newQuestionNo: editNumber,
      startQueNo: minList,
    };
    if (
      Number(editNumber) < Number(minList) ||
      Number(editNumber) > Number(maxList)
    ) {
      setQuestionError(
        `Question no. must be in between ${minList} to ${maxList}`,
      );
      return;
    }
    if (payload) {
      setIsLoading(true);
      updateQuestionNumber(payload);
    }
  };

  async function getPermissionHandler() {
    try {
      const { success, data, message } = await userGQL.getPermissionsHandler();
      if (success) {
        if (data.meeting_id == currentMeetingId)
          getPermissionSuccess(data.permissions);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }
  async function getQuestionNumberHandler() {
    try {
      const payload = {
        meetingId: currentMeetingId,
      };

      const {
        success,
        data,
        message,
      } = await questionGQL.getQuestionNumbersHandler(payload);
      if (success) {
        onGetQuestionNumbersSuccess(data);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function updateQuestionNumber(payload) {
    try {
      // if (payload.id == 'initalAdd') delete payload.id;
      const {
        message,
        success,
      } = await questionGQL.updateQuestionNumberHandler(payload);
      if (success) {
        getQuestionNumberHandler();
        appReceiveSuccess(message);
        setEditQuestionNumber(false);
        setIsLoading(true);
      } else {
        setIsLoading(true);
        setEditQuestionNumber(false);
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
      setIsLoading(false);
      setEditQuestionNumber(false);
    }
  }
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
    setEditContent('');
    setSaveQuestionKey(saveQuestionKey + 1);
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
  async function duplicateQuestion(payload) {
    try {
      const {
        success,
        message,
        data,
      } = await questionGQL.createQuestionHandler(payload);
      if (success) {
        appReceiveSuccess(message);
        let layoutData = host_ui.screen_layout;
        const newObj = {
          i: data[0].id.toString(),
          maxW: 12,
          minW: 3,
          moved: false,
          static: false,
          x: getXvalue(),
          y: getYvalue(),
          w: 350,
          h: 3,
        };
        layoutData.push(newObj);
        handleCardResize(layoutData);

        getQuestionNumberHandler();
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function updateQuestionHandler(payload) {
    try {
      const { id, label, type, response } = payload;
      const payloadData = {
        id,
        label,
        input_type: type,
        screen_id: selectedScreen,
        type,
        response: Number(type) == 3 ? [] : response,
      };
      if (payload.id == 'initalAdd') delete payload.id;

      const {
        message,
        success,
        data,
      } = await questionGQL.updateQuestionHandler(payloadData);
      if (success) {
        if (list && list.length > 0 && data && data.length > 0) {
          const newQuestionData =
            list &&
            list.map(el => {
              if (el.id === data[0].id) {
                return data[0];
              }
              return el;
            });
          onGetQuestionSuccess(newQuestionData);
        }
        appReceiveSuccess(message);
        setIsUpdateKey(isUpdateKey + 1);
      } else {
        appReceiveError(message);
      }
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
      if (success) {
        appReceiveSuccess(message);
        if (layouts && layouts.lg && layouts.lg.length) {
          const newData = layouts.lg.filter(
            el => el.i.toString() !== queId.toString(),
          );
          handleCardResize(newData);
          setLayouts({ lg: newData });
        }
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      broadcastHadler;
      appReceiveError(err);
    }
  }

  useEffect(() => {
    if (
      host_ui &&
      Object.keys(host_ui.selected_screen).length &&
      host_ui.selected_screen.id !== selectedScreen
    ) {
      setLoading(true);
      setList([]);
      setLayouts({ lg: [] });
      setSelectedScreen(host_ui.selected_screen.id);
      setCurrentScreenId(host_ui.selected_screen.id);
      getScreenLayoutHandlerdata(host_ui.selected_screen.id);
    }
  }, [layouts, host_ui.selected_screen.id]);

  useEffect(() => {
    if (host_ui && host_ui.screen_layout && host_ui.screen_layout.length > 0) {
      setLayouts({ lg: host_ui.screen_layout });
      setLoading(false);
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
        if (layout_view === 'Sharing') {
          const dashEle = document.querySelector('.dashboard-wrapper');
          let dashEleWidth = '100%';
          if (dashEle !== null) {
            const dashwidth = dashEle.clientWidth;
            dashEleWidth = dashwidth;
            const main_width = document.querySelector('.main-box');
            if (main_width !== null) {
              main_width.class = 'expand-to-right';
              main_width.style.width = dashEleWidth + 'px';
            }
          }
        }
        window.dispatchEvent(new Event('resize'));
      }, 1000);
    }
  }, [layout_view]);

  useEffect(() => {
    if (questions && questions.length >= 0) {
      setList(questions);
    }
  }, [questions]);

  useEffect(() => {
    if (
      questionNumbers &&
      questionNumbers.length >= 0 &&
      questionNumbers.length !== listQuestionNumbers.length
    ) {
      setListQuestionNumbers(questionNumbers);
    }
  }, [questionNumbers]);

  async function handleCardResize(layoutData) {
    try {
      const screenJson = JSON.parse(getSecureSessionData('selectedScreen'));

      const payload = {
        screen_id: screenJson.id,
        layout: layoutData,
      };

      const { success, data } = await meetingGQL.changeScreenLayout(payload);
      if (success) {
        // add condition to compare screen id
        // if (screenJson.id.toString() === data.screen_id.toString()) {
        //   onGetLayoutSuccess(data.layout);
        // }
      }
    } catch (err) {
      console.log('err', err);
    }
  }
  const getOnlyQuetionNumbers = question_id => {
    let foundNumber = 'Q-#',
      foundObj = null;
    if (
      questionNumbers &&
      Array.isArray(questionNumbers) &&
      questionNumbers.length
    ) {
      foundObj = questionNumbers.find(ele => ele.id == question_id);
      foundNumber = foundObj ? foundObj.queNo : foundNumber;
    }
    return foundNumber;
  };

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
    if (layouts && layouts.lg && layouts.lg.length > 0) {
      let cardW = 350;
      const cordX = layouts.lg.map(el => {
        if (el.y < 300) {
          cardW = el.w;
          return el.x;
        }
        return 0;
      });
      const maxPos = cordX.reduce(function(res, obj) {
        return obj > res ? obj : res;
      });
      return maxPos + cardW;
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
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');

  useEffect(() => {
    if (list && list.length === 0) {
      return;
    }
    const screenJson = JSON.parse(getSecureSessionData('selectedScreen'));
    if (list && list.length === 1 && !layouts.lg) {
      getScreenLayoutHandlerdata(screenJson.id);
    }

    if (!isMounted) {
      setCurrentScreenId(screenJson.id);
      setIsMounted(true);
      getScreenLayoutHandlerdata(screenJson.id);
    }
  }, [list]);

  async function getScreenLayoutHandlerdata(screenId) {
    try {
      const payload = {
        screen_id: screenId,
      };

      const {
        success,
        data,
        message,
      } = await questionGQL.getScreenLayoutHandler(payload);
      if (success) {
        if (screenId.toString() === data.screen_id.toString()) {
          if (data.layout !== null) {
            onGetLayoutSuccess(data.layout);
          }
          setLoading(false);
        }
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  const onUpdateLayout = async (id, left, top) => {
    if (layouts && layouts.lg && layouts.lg.length) {
      let updatedLayout = [];

      const cordI = layouts.lg.map(el => {
        return el.i;
      });
      if (cordI.includes(id.toString())) {
        updatedLayout = layouts.lg.map(el => {
          if (el.i.toString() === id.toString()) {
            const obj = {
              ...el,
              x: left,
              y: top,
            };
            return obj;
          }
          return el;
        });
      } else {
        updatedLayout = layouts.lg;
        const newObj = {
          i: id.toString(),
          maxW: 12,
          minW: 3,
          moved: false,
          static: false,
          x: left,
          y: top,
          w: 350,
          h: 3,
        };
        updatedLayout.push(newObj);
      }
      setLayouts({ lg: updatedLayout });
      await handleCardResize(updatedLayout);
    }
  };
  const onUpdateResize = async (width, id) => {
    let maxFinalVal = 450;
    let minFinalVal = 0;

    if (layouts && layouts.lg && layouts.lg.length) {
      const selData = await layouts.lg.filter(
        e => e.i.toString() === id.toString(),
      );
      const cordI = [];

      if (selData[0].y > 450) {
        const divValue = Math.ceil(selData[0].y / 450);
        maxFinalVal = 450 * divValue;
        minFinalVal = 450 * (divValue - 1);
        minFinalVal = minFinalVal - 50;
      }

      await layouts.lg.filter(el => {
        if (
          Number(selData[0].x) < Number(el.x) &&
          Number(el.y) <= maxFinalVal &&
          Number(el.y) >= minFinalVal
        ) {
          cordI.push(el.x);
        }
      });

      const minList =
        (await cordI.length) > 0 &&
        cordI.reduce(function(res, obj) {
          return obj < res ? obj : res;
        });

      const newWidth = selData[0].x + Number(width) - minList;

      const data = await layouts.lg.map(el => {
        if (el.i.toString() === id.toString()) {
          const obj = {
            ...el,
            w: width,
          };
          return obj;
        }
        if (
          Number(selData[0].x) < Number(el.x) &&
          Number(el.y) <= maxFinalVal &&
          Number(el.y) >= minFinalVal
        ) {
          console.log('el', el);
          const obj = {
            ...el,
            x: el.x + newWidth + 15,
          };
          return obj;
        }
        return el;
      });
      setLayouts({ lg: data });
      onGetLayoutSuccess(data);
      await handleCardResize(data);
    }
  };

  return (
    <>
      {loading ? (
        <Spinner
          className="ms-2 spinner-center"
          animation="border"
          role="status"
          size="lg"
          style={{ color: 'grey' }}
        />
      ) : (
        <>
          <div className="question d-flex w-100">
            {list &&
              listQuestionNumbers &&
              list.length > 0 &&
              listQuestionNumbers.length > 0 && (
                <>
                  <DndProvider
                    backend={HTML5Backend}
                    options={{
                      enableTouchEvents: false,
                      enableMouseEvents: true,
                    }}
                  >
                    <Example
                      list={list}
                      onUpdateLayout={onUpdateLayout}
                      onUpdateResize={onUpdateResize}
                      duplicateQuestion={duplicateQuestion}
                      deleteQuestionHandler={deleteQuestionHandler}
                      layouts={layouts}
                      setUpdate={setUpdate}
                      isHost={true}
                      handleChange={handleChange}
                      setModalState={setModalState}
                      setEditQuestionModal={setEditQuestionModal}
                      setEditQuestionNumber={setEditQuestionNumber}
                      setEditQueId={setEditQueId}
                      getOnlyQuetionNumbers={getOnlyQuetionNumbers}
                      setEditNumber={setEditNumber}
                      setIsLoading={setIsLoading}
                      setQuestionError={setQuestionError}
                      setZoomLevel={setZoomLevel}
                      zoomLevel={zoomLevel}
                    />
                  </DndProvider>
                </>
              )}
          </div>
          {editQuestionNumber ? (
            <CustomModal
              title={'Edit Question Number'}
              isActive={editQuestionNumber}
              isEdit={editQuestionNumber}
              handleClose={() => setEditQuestionNumber(false)}
              handleButtonClick={handleEditQuestionNumber}
              handleClick={() => setEditQuestionNumber(false)}
              handleSaveClick={handleEditQuestionNumber}
              buttonTitle="Save"
              buttonBottomFrom
              handleSpinner={isLoading}
            >
              <Form>
                <Form.Label>Question Number</Form.Label>
                <Form.Control
                  type="text"
                  value={editNumber}
                  name="label"
                  placeholder="The Question"
                  onChange={e => {
                    const re = /^[0-9\b]+$/;
                    if (e.target.value === '' || re.test(e.target.value)) {
                      setEditNumber(e.target.value);
                    }
                    setQuestionError('');
                  }}
                  className="mb-3"
                />
                {questionError && (
                  <span
                    className="is-invalid-text mt-2"
                    style={{ color: 'red' }}
                  >
                    {questionError}
                  </span>
                )}
              </Form>
            </CustomModal>
          ) : (
            ''
          )}
          {modalOpen && (
            <CustomModal
              title={modalOpen ? 'Edit Question' : 'Add New Question'}
              isActive={modalOpen}
              isEdit={modalOpen}
              handleClose={() => {
                setModalState(false);
                setEditContent('');
              }}
              handleButtonClick={handleAddQuestion}
              handleClick={() => setModalState(false)}
              handleSaveClick={saveQuestionBank}
              buttonTitle="Save Question"
              buttonBottomTitle="Save Question to the Bank"
              buttonBottomFrom
              selectKey={payload}
              editContent={editContent}
              questionLabel={payload.label || ''}
            >
              <AddQuestionDetail
                questionType={editQuestionModal}
                isEdit={modalOpen}
                questions={payload}
                questionLabel={payload.label || ''}
                handleChange={handleChange}
                setEditContent={setEditContent}
                editContent={editContent}
              />
            </CustomModal>
          )}
        </>
      )}
    </>
  );
};

StackQuestionCard.propTypes = {
  host_ui: PropTypes.object.isRequired,
  attendeesData: PropTypes.array,
  selected_screen: PropTypes.object,
  questions: PropTypes.array,
  questionNumbers: PropTypes.array,
  onDeleteQuestionSuccess: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  onGetLayoutSuccess: PropTypes.func,
  update: PropTypes.bool,
  setUpdate: PropTypes.func,
  layout_view: PropTypes.string,
  onGetQuestionNumbersSuccess: PropTypes.func,
  onGetQuestionSuccess: PropTypes.func,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  const { attendeesData, host_ui } = hostUI;
  const { selected_screen, layout_view } = host_ui;
  return {
    attendeesData,
    selected_screen,
    layout_view,
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
    onGetLayoutSuccess: payload => dispatch(onGetLayoutSuccess(payload)),
    onGetQuestionNumbersSuccess: payload =>
      dispatch(onGetQuestionNumbersSuccess(payload)),
    getPermissionSuccess: payload => dispatch(getPermissionSuccess(payload)),
    onGetQuestionSuccess: payload => dispatch(onGetQuestionSuccess(payload)),

    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(StackQuestionCard);
