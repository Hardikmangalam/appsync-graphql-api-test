/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Form,
  Image,
  ListGroup,
  Modal,
  Spinner,
  Toast,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import CustomModal from '../../../common/customModal';
import addIcon from '../../../assets/images/plus.svg';
import unlockIcon from '../../../assets/images/unlock.svg';
import lockIcon from '../../../assets/images/lock.png';
import { useModalWithData } from '../../../hooks/useModalWithData';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  AddQuestion,
  AddQuestionDetail,
  SelectQuestionTemplateModal,
} from '../Modal/AddQuestion';
import editIcon from '../../../assets/images/edit.svg';
import closeIcon from '../../../assets/images/close.svg';
import tickIcon from '../../../assets/images/blue/check.svg';
import { QuestionPreview } from '../Modal/QuestionOptionSection/QuestionPreview';
import useLocalStorage from '../../../hooks/useLocalStorage';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';
import {
  setHostUI,
  changeScaleView,
  onCreateScreenSuccess,
  onGetQuestionBankSuccess,
  onGetLayoutSuccess,
  onGetQuestionSuccess,
  onGetQuestionNumbersSuccess,
} from '../../../store/actions/host-ui';
import {
  appReceiveSuccess,
  appReceiveError,
} from '../../../store/actions/error';
import { setLockScreenSuccess } from '../../../store/actions/app';
import {
  meetingGQL,
  questionGQL,
  screenGQL,
  userGQL,
} from '../../../graphqlOperations';
import MessageNotification from '../messageNotification';
import AddNoteModal from './AddNoteModal';
import { API, graphqlOperation } from 'aws-amplify';
import {
  onCreateNote,
  onStartStopMeeting,
} from '../../../graphql/subscriptions';
import responseWrapper from '../../../graphqlOperations/responseWrapper';
import { hangUpCall, intitializeDevice } from './TwilioFunctions';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

const DashboardHeader = ({
  app,
  appReceiveSuccess,
  changeScaleView,
  host_ui,
  questionBank,
  setHostUI,
  onCreateScreenSuccess,
  onGetQuestionBankSuccess,
  setLockScreenSuccess,
  appReceiveError,
  onGetLayoutSuccess,
  onGetQuestionSuccess,
  onGetQuestionNumbersSuccess,
}) => {
  const { modalOpen, setModalState } = useModalWithData();
  const [modalNested, setModalNested] = useState(false);
  const [previewQuestionModal, setPreviewQuestionModal] = useState(false);
  const [lockScreen, setLockScreen] = useState(true);
  const [contentEditable, setContentEditable] = useState(false);
  const [screenName, setScreenName] = useState('');
  const [editQuestionModal, setEditQuestionModal] = useState();
  const [payload, setPayload] = useState({});
  const [selectedQuestionBank, setSelectedQuestionBank] = useState({});
  const [templateQueModal, setTemplateQueModal] = useState(false);
  // const [locked, setLocked] = useState(false);
  const [manageLock, setManageLock] = useState(false);
  const [scaleView, setScaleView] = useLocalStorage('scale_view', true);
  const [isStart, setIsStart] = useState(
    [true, 'true'].includes(getSecureSessionData('isStartMeeting')),
  );
  let noteData = JSON.parse(getSecureSessionData('meetData'));
  const [finalValue, setFinalValue] = useState(null);
  const [noteModal, setNoteModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [contentNoteEdit, setContentNoteEdit] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [popupValue, setPopupValue] = useState('');
  const [compKey, setCompKey] = useState(0);
  const [meetingEndModal, setMeetingEndModal] = useState(false);
  const [listAvailableNumberModal, setListAvailableNumberModal] = useState(
    false,
  );
  const [listAvailableNumber, setListAvailableNumber] = useState(false);
  const [listAvailableNumberId, setListAvailableNumberId] = useState({});
  const [activeTemplate, setActiveTemplate] = useState();
  const [loading, setLoading] = useState(false);

  const clickRef = useRef();
  const clickDataRef = useRef();

  const meetingName = JSON.parse(getSecureSessionData('UserData'));
  let currentMeetingId = null;
  if (meetingName !== null && Object.keys(meetingName).length) {
    const {
      meetingData: { id },
    } = meetingName;
    currentMeetingId = Number(id);
  }

  useEffect(() => {
    let selectedNumber =
      listAvailableNumber &&
      listAvailableNumber.length > 0 &&
      listAvailableNumber.find(obj => obj.is_selected);
    if (
      selectedNumber !== null &&
      selectedNumber !== undefined &&
      Object.keys(selectedNumber).length
    ) {
      setListAvailableNumberId(selectedNumber);
    }
  }, [listAvailableNumber]);

  async function startstopMeetingHandler(isStartParams) {
    const listId =
      listAvailableNumberId &&
      !listAvailableNumberId.is_available &&
      listAvailableNumberId.is_selected
        ? null
        : listAvailableNumberId && listAvailableNumberId.id;
    try {
      const {
        success,
        data,
        message,
      } = await meetingGQL.startstopMeetingHandler({
        isStart: isStartParams,
        twilio_number: listId,
      });
      if (success) {
        setListAvailableNumberModal(false);
        setSecureSessionData('isStartMeeting', isStartParams.toString());
        setIsStart(isStartParams);
        let meetingData = JSON.parse(getSecureSessionData('meetData'));
        let userData = JSON.parse(getSecureSessionData('UserData'));
        if (
          meetingData.meetingData.id == data.id &&
          userData.meetingData.id == data.id
        ) {
          delete meetingData.meetingData;
          delete userData.meetingData;
          meetingData = { ...meetingData, meetingData: data };
          userData = { ...userData, meetingData: data };
          setSecureSessionData('meetData', JSON.stringify(meetingData));
          setSecureSessionData('UserData', JSON.stringify(userData));
          // setIsStart(!isStart);
          appReceiveSuccess(message);
        }
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function getListAvailableNumber() {
    try {
      const {
        success,
        message,
        data,
      } = await meetingGQL.getListAvailableNumberHandler({
        meeting_id: Number(currentMeetingId),
      });
      if (success) {
        setLoading(false);
        setListAvailableNumber(data);
        appReceiveSuccess(message);
      } else {
        appReceiveError(message);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  }

  // Request an Access Token for Twilio
  async function twilioMeetingToken(isStartParams) {
    console.log('Requesting Access Token...');
    if (!isStartParams) {
      // document.getElementById('button-hangup-outgoing').click();
      hangUpCall();

      setIsStart(isStartParams);
      return;
    }

    try {
      setIsStart(isStartParams);
      const user_id = `${currentMeetingId}-${getSecureSessionData(
        'userId',
      )}-${getSecureSessionData('role')}`;
      const { success, data, message } = await meetingGQL.createTwilioToken({
        user_id,
      });
      if (success) {
        setSecureSessionData('twilioToken', data.token);

        // document.getElementById('button-call').click();

        intitializeDevice();
        setCallStarted(true);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      console.log(err);
      console.log(
        'An error occurred. See your browser console for more information.',
      );
    }
  }

  useClickOutside(clickRef, () => {
    setContentEditable(false);
  });

  useClickOutside(clickDataRef, () => {
    setContentNoteEdit(false);
  });

  useEffect(() => {
    setLockScreen(getSecureSessionData('isLockedScreen'));
  }, [getSecureSessionData('isLockedScreen')]);

  const handleKeydown = e => {
    if (e.key == 'Enter') {
      const { meeting_id, id } = host_ui.selected_screen;
      const payloadData = {
        id: id,
        name: e.target.value,
        meeting_id: meeting_id,
      };
      setScreenName(e.target.value);
      createScreensHandler(payloadData);
      setCompKey(compKey + 1);
    }

    if (e.key == 'Enter' || e.key == 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setContentEditable(false);
    }
  };

  async function createScreensHandler(payload) {
    try {
      if (payload.id == 'initalAdd') delete payload.id;
      const { success, message } = await screenGQL.createScreensHandler(
        payload,
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

  const editNote = () => {
    setNoteModal(true);
  };

  const removeNote = () => {
    const {
      selected_screen: { meeting_id },
    } = host_ui;

    const payloadData = {
      description: null,
      meeting_id,
    };
    createNoteHandler(payloadData);
    setFinalValue(null);
    setPopupValue('');
  };

  async function createNoteHandler(payload) {
    try {
      const { message, success, data } = await screenGQL.createNoteHandler(
        payload,
      );
      if (success) {
        let dataVal = JSON.parse(getSecureSessionData('meetData'));
        dataVal = {
          ...dataVal,
          meetingData: {
            ...dataVal.meetingData,
            note_description: data.note_description,
            note_title: data.note_title,
          },
        };
        setSecureSessionData('meetData', JSON.stringify(dataVal));
        setCompKey(compKey + 1);
        appReceiveSuccess(message);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  const handleKeyNoteDown = e => {
    if (e.key == 'Enter') {
      const {
        selected_screen: { id, meeting_id },
      } = host_ui;

      const payloadData = {
        description: finalValue,
        title: e.target.value,
        id,
        meeting_id,
      };
      createNoteHandler(payloadData);
    }

    if (e.key == 'Enter' || e.key == 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setContentNoteEdit(false);
    }
  };
  const handleEditorChange = data => {
    const {
      selected_screen: { meeting_id },
    } = host_ui;

    const payloadData = {
      description: data ? data : null,
      meeting_id,
      title: popupValue,
    };
    setPayload(payloadData);
  };
  const addNote = () => {
    if (Object.keys(payload).length > 2) {
      createNoteHandler(payload);
    }
    setNoteModal(false);
  };

  useEffect(() => {
    if (getSecureSessionData('meetData')) {
      setFinalValue(
        noteData &&
          noteData.meetingData &&
          noteData.meetingData.note_description,
      );
      setPopupValue(
        noteData && noteData.meetingData && noteData.meetingData.note_title,
      );
    }
  }, [getSecureSessionData('meetData')]);

  useEffect(() => {
    let meetData = JSON.parse(getSecureSessionData('meetData'));
    const subscription = API.graphql(
      graphqlOperation(onCreateNote, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onCreateNote',
        );
        if (success && data.id == currentMeetingId) {
          setFinalValue(data.note_description);
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
  }, []);

  useEffect(() => {
    if (getSecureSessionData('role') === 'HOST') {
      const subscription = API.graphql(
        graphqlOperation(onStartStopMeeting, { meeting_id: currentMeetingId }),
      ).subscribe({
        next: ({ provider, value }) => {
          const { success, data } = responseWrapper(
            value,
            'onStartStopMeeting',
          );
          if (success) {
            let meetingData = JSON.parse(getSecureSessionData('meetData'));
            let userData = JSON.parse(getSecureSessionData('UserData'));
            if (
              meetingData.meetingData.id == data.id &&
              userData.meetingData.id == data.id
            ) {
              // twilioMeetingToken(data.is_started);
            }
          }
        },
        error: error => console.warn(error),
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleAddQuestion = () => {
    const payloadData = {
      ...payload,
      input_type: Number(payload.type) || '',
      response: Number(payload.type) == 3 ? [''] : payload.response,
      screen_id: host_ui.selected_screen.id,
    };
    if (Object.keys(payloadData).length) {
      createQuestionHandler(payloadData);
    }
    setModalNested(false);
    setModalState(false);
    setEditContent('');
  };

  const saveQuestionBank = () => {
    const payloadData = {
      ...payload,
      input_type: Number(payload.type) || '',
      response: Number(payload.type) == 3 ? [''] : payload.response,
      screen_id: host_ui.selected_screen.id,
    };
    if (Object.keys(payloadData).length) {
      saveQuestionToBank(payloadData);
    }
    setModalNested(false);
    setModalState(false);
  };

  async function saveQuestionToBank(payload) {
    try {
      if (payload.id == 'initalAdd') delete payload.id;

      const { success, message } = await questionGQL.saveQuestionBankHandler(
        payload,
      );
      success ? appReceiveSuccess(message) : appReceiveError(message);
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function createQuestionHandler(payload) {
    try {
      if (payload.id == 'initalAdd') delete payload.id;

      const {
        success,
        message,
        data,
      } = await questionGQL.createQuestionHandler(payload);
      if (success) {
        appReceiveSuccess(message);
        if (
          host_ui &&
          host_ui.screen_layout &&
          host_ui.screen_layout.length >= 0
        ) {
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
          getQuestionHandler();
          getQuestionNumberHandler();
          // onGetLayoutSuccess(layoutData);
        }
      } else {
        appReceiveError(message);
      }
      setPayload({});
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

  async function getQuestionHandler() {
    const screenJson = JSON.parse(getSecureSessionData('selectedScreen'));
    try {
      const payload = {
        screen_id: screenJson.id,
      };
      const { success, data, message } = await questionGQL.getQuestionHandler(
        payload,
      );
      if (success) {
        onGetQuestionSuccess(data);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

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

  const getYvalue = i => {
    return 10;
  };

  const getXvalue = i => {
    if (host_ui && host_ui.screen_layout && host_ui.screen_layout.length > 0) {
      let cardW = 335;
      const cordX = host_ui.screen_layout.map(el => {
        if (el.y < 300) {
          return el.x;
        }
        return 0;
      });
      const maxPos = cordX.reduce(function(res, obj) {
        return obj > res ? obj : res;
      });
      host_ui.screen_layout.filter(e => {
        if (Number(maxPos) === e.x) {
          cardW = e.w + 15;
        }
      });
      return maxPos + cardW;
    }
    return 10;
  };

  async function lockScreenHandler() {
    try {
      const { meeting_id, id } = host_ui.selected_screen;
      const { success, data, message } = await screenGQL.setLoctScreenHandler({
        meeting_id,
        isLockedScreen: !app.isLockedScreen,
      });

      if (success) {
        setSecureSessionData('isLockedScreen', !app.isLockedScreen.toString());
        // setLocked(!lockScreen);
        setLockScreenSuccess(data);
        appReceiveSuccess(message);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  const updateRedux = () => {
    changeScaleView({ scale_view: scaleView });
  };

  const changeQueBank = que => {
    setSelectedQuestionBank(que);
  };

  const saveQuestionFromBank = () => {
    const { id } = host_ui.selected_screen;
    const payloadData = {
      ...selectedQuestionBank,
      response: selectedQuestionBank.response.map(({ name }) => name),
      input_type: selectedQuestionBank.type,
      screen_id: id,
    };
    delete payloadData.id;
    delete payloadData.que_display_seq;
    delete payloadData.metadata;
    createQuestionHandler(payloadData);
    setModalState(false);
    setTemplateQueModal(false);
  };

  const loadQuestionBank = () => {
    getTemplateDataHandler();
    setTemplateQueModal(true);
  };

  async function getTemplateDataHandler() {
    try {
      const {
        success,
        data,
        message,
      } = await questionGQL.getTemplateDataHandler();
      if (success) {
        onGetQuestionBankSuccess(data);
        appReceiveSuccess(message);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    setHostUI({
      ...host_ui,
      scale_view: scaleView,
    });
    updateRedux();
  }, [scaleView]);

  useEffect(() => {
    if (
      ['ADMIN', 'HOST'].includes(getSecureSessionData('role')) &&
      getSecureSessionData('isStartMeeting') === 'true' &&
      !callStarted
    ) {
      twilioMeetingToken(true);
    }
  }, [
    getSecureSessionData('isStartMeeting'),
    getSecureSessionData('isDeviceChecked'),
  ]);

  useEffect(() => {
    const screenId = JSON.parse(getSecureSessionData('selectedScreen'));
    setScreenName(
      screenId === undefined || screenId === null
        ? host_ui.selected_screen.name
        : screenId && screenId.name,
    );
  }, [host_ui.selected_screen]);

  return (
    <div className="dashboard-header d-flex align-items-center">
      <div style={{ position: 'absolute', left: '50%', top: '5px' }}>
        <MessageNotification />
      </div>
      {contentEditable &&
      (getSecureSessionData('isNewTemplate') !== 'false' ||
        getSecureSessionData('isEditTemplate')) ? (
        <Form.Control
          style={{ width: '290px' }}
          defaultValue={screenName}
          onKeyDown={handleKeydown}
          ref={clickRef}
        />
      ) : (
        <div
          style={{ flex: '1' }}
          onDoubleClick={() => {
            setContentEditable(true);
          }}
          key={compKey}
        >
          {screenName}
        </div>
      )}

      {(getSecureSessionData('isNewTemplate') !== 'false' ||
        getSecureSessionData('isEditTemplate')) && (
        <>
          {[true, 'true'].includes(!getSecureSessionData('templateView')) && (
            <>
              <div
                style={{ width: 'calc(100% - 325px)' }}
                className="d-flex"
                key={compKey}
              >
                {' '}
                {!getSecureSessionData('templateView') &&
                getSecureSessionData('role') !== 'Admin' &&
                finalValue ? (
                  <>
                    {' '}
                    <div
                      className="d-flex"
                      style={{ paddingTop: '0px', flex: '1' }}
                    >
                      {contentNoteEdit ? (
                        <Form.Control
                          style={{
                            width: '120px',
                            cursor: 'pointer',
                          }}
                          defaultValue={popupValue}
                          onKeyDown={handleKeyNoteDown}
                          ref={clickDataRef}
                        />
                      ) : (
                        <div
                          onDoubleClick={() => {
                            setContentNoteEdit(true);
                          }}
                          className="ps-4 fw-bold"
                        >
                          {popupValue ? `${popupValue} :` : 'Custom Field :'}
                        </div>
                      )}
                      <span
                        className="ms-2 text-bismark addnote_p d-flex"
                        dangerouslySetInnerHTML={{ __html: finalValue }}
                      />
                    </div>
                    <div className="d-flex">
                      <Button
                        className="p-0 border-0 mr-4"
                        aria-label="Edit"
                        onClick={() => {
                          editNote();
                        }}
                        style={{
                          marginRight: '10px',
                        }}
                      >
                        <Image src={editIcon} alt="Close" />
                      </Button>
                      <Button
                        className="p-0 border-0 mr-4"
                        aria-label="Remove"
                        onClick={() => {
                          removeNote();
                        }}
                        style={{
                          marginRight: '10px',
                        }}
                      >
                        <Image src={closeIcon} alt="Close" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="white"
                    aria-label="Add"
                    style={{ float: 'right' }}
                    className="text-blue"
                    onClick={() => {
                      setNoteModal(true);
                    }}
                  >
                    <Image
                      src={addIcon}
                      alt="Add"
                      className="me-2"
                      width={20}
                    />{' '}
                    Add Note
                  </Button>
                )}
              </div>
            </>
          )}

          <div className="d-flex">
            <Form.Check className="checkbox ms-auto">
              <Form.Check.Input
                id="checkbox-3"
                className="checkbox-input"
                type="checkbox"
                checked={scaleView}
                onChange={() => setScaleView(!scaleView)}
                aria-label="Toggle Scale View"
              />
            </Form.Check>
            <Button
              className="p-0 ms-4"
              onClick={() => setModalState(true)}
              aria-label="Open Modal"
            >
              <Image src={addIcon} width={24} alt="Add Icon" />
            </Button>
            {[true, 'true'].includes(!getSecureSessionData('templateView')) && (
              <>
                <Button
                  className="p-0 ms-4"
                  onClick={lockScreenHandler}
                  aria-label={
                    getSecureSessionData('isLockedScreen') === true ||
                    getSecureSessionData('isLockedScreen') === 'true'
                      ? 'Unlock Screen'
                      : 'Lock Screen'
                  }
                >
                  <Image
                    src={
                      getSecureSessionData('isLockedScreen') === true ||
                      getSecureSessionData('isLockedScreen') === 'true'
                        ? lockIcon
                        : unlockIcon
                    }
                    width={24}
                    alt={
                      getSecureSessionData('isLockedScreen') === true ||
                      getSecureSessionData('isLockedScreen') === 'true'
                        ? 'Locked'
                        : 'Unlocked'
                    }
                  />
                </Button>
              </>
            )}
          </div>
          {[true, 'true'].includes(!getSecureSessionData('templateView')) && (
            <>
              {!isStart ? (
                <Button
                  className="ms-4"
                  variant="blue"
                  aria-label="Start"
                  size="sm"
                  onClick={() => {
                    setLoading(true);
                    setListAvailableNumberModal(true);
                    getListAvailableNumber();
                  }}
                >
                  Start
                  {loading && (
                    <Spinner
                      className="ms-2"
                      animation="border"
                      role="status"
                      size="sm"
                    />
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  aria-label="End Session"
                  variant="red-10"
                  className="text-red ms-4"
                  onClick={() => {
                    setMeetingEndModal(true);
                  }}
                >
                  End Session
                </Button>
              )}
            </>
          )}
        </>
      )}

      {meetingEndModal && (
        <Modal show={meetingEndModal} style={{ marginTop: '20%' }}>
          <Modal.Header>
            <Modal.Title>
              <div className="model-title1">
                <strong>Are you sure you wish to end the session?</strong>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button
              variant="blue-10"
              aria-label="No"
              className="ms-3 text-blue"
              onClick={() => setMeetingEndModal(false)}
            >
              No
            </Button>
            <Button
              variant="blue-10"
              aria-label="Yes"
              className="ms-3 text-blue"
              onClick={() => {
                hangUpCall();
                startstopMeetingHandler(false);
                setMeetingEndModal(false);
              }}
            >
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {loading === false && listAvailableNumberModal && (
        <CustomModal
          title="Dial-In Number"
          isActive={listAvailableNumberModal}
          handleClose={() => {
            setListAvailableNumberModal(false);
            setActiveTemplate();
          }}
          handleClick={() => {
            setListAvailableNumberModal(false);
            setActiveTemplate();
          }}
          handleButtonClick={() => {
            startstopMeetingHandler(true);
          }}
          buttonTitle="Start Session"
        >
          <ListGroup className="select-template-list">
            {listAvailableNumber &&
              listAvailableNumber.length > 0 &&
              listAvailableNumber.map((ele, index) => (
                <ListGroup.Item
                  key={index}
                  onClick={() => {
                    setActiveTemplate(index);
                    setListAvailableNumberId(ele);
                  }}
                  className={classNames({
                    'text-blue': activeTemplate == index,
                    selectedNumber:
                      ele.is_selected === true && ele.is_available === true,
                  })}
                  disabled={ele.is_available === false}
                >
                  {ele.is_available === false
                    ? `${ele.number} ${
                        ele.sessionName ? `- (${ele.sessionName})` : ``
                      }`
                    : ele.number}{' '}
                  {activeTemplate === index && (
                    <Image
                      className="ms-auto"
                      src={tickIcon}
                      width={24}
                      height={24}
                      alt="tick-icon"
                    />
                  )}
                </ListGroup.Item>
              ))}
          </ListGroup>
        </CustomModal>
      )}

      {modalOpen ? (
        <CustomModal
          title="Add New Question"
          isActive={modalOpen}
          handleClose={() => {
            setModalState(false);
          }}
          handleButtonClick={() => {
            setModalNested(true);
          }}
          buttonTitle="Next"
          handleClick={() => {
            setModalNested(true);
            setModalState(false);
          }}
          bottomText="Select Question from the Bank"
          handleModalTextClick={loadQuestionBank}
          bottomTextFrom
        >
          <AddQuestion setEditQuestionModal={setEditQuestionModal} />
        </CustomModal>
      ) : (
        ''
      )}
      {modalNested && (
        <CustomModal
          title="Add New Question"
          isActive={modalNested}
          handleClose={() => {
            setModalNested(false);
            setModalState(false);
            setEditContent('');
          }}
          questionType={editQuestionModal}
          handleButtonClick={handleAddQuestion}
          handleClick={() => setModalState(false)}
          handleSaveClick={saveQuestionBank}
          buttonTitle="Save Question"
          buttonBottomTitle="Save Question to the Bank "
          buttonBottomFrom
          selectKey={payload}
          editContent={editContent}
        >
          <AddQuestionDetail
            questionType={editQuestionModal}
            setEditQuestionModal={setEditQuestionModal}
            questionLabel={''}
            handleChange={handleChange}
            setEditContent={setEditContent}
            editContent={editContent}
          />
        </CustomModal>
      )}

      {templateQueModal && (
        <CustomModal
          title="Select Question"
          isActive={modalOpen}
          handleClose={() => {
            setModalState(false);
            setTemplateQueModal(false);
          }}
          handleButtonClick={saveQuestionFromBank}
          handleClick={() => {
            setModalNested(false);
            setTemplateQueModal(false);
            setModalState(true);
          }}
          buttonTitle="Add Question"
          buttonBottomTitle="Preview"
          buttonBottomFrom
          handleSaveClick={() => {
            setPreviewQuestionModal(true);
            setTemplateQueModal(false);
          }}
        >
          <SelectQuestionTemplateModal
            changeQueBank={changeQueBank}
            list={questionBank}
          />
        </CustomModal>
      )}
      {previewQuestionModal && (
        <CustomModal
          title="Question Preview"
          isActive={modalOpen}
          handleClose={() => {
            setModalState(false);
            setTemplateQueModal(false);
          }}
          handleButtonClick={() => {
            setModalState(false);
            setTemplateQueModal(false);
          }}
          handleClick={() => {
            setModalNested(false);
            setTemplateQueModal(false);
            setModalState(true);
            setPreviewQuestionModal(false);
          }}
          buttonTitle="Add Question"
          buttonBottomTitle="Back"
          buttonBottomFrom
          handleSaveClick={() => {
            setPreviewQuestionModal(false);
            setTemplateQueModal(true);
          }}
        >
          <QuestionPreview data={questionBank} />
        </CustomModal>
      )}
      {noteModal ? (
        <CustomModal
          title={finalValue ? 'Edit Note' : 'Add Note'}
          isActive={noteModal}
          handleClose={() => setNoteModal(false)}
          handleButtonClick={addNote}
          handleClick={() => setNoteModal(false)}
          buttonTitle="Save"
          size="lg"
        >
          <AddNoteModal
            isNote={true}
            onChange={handleEditorChange}
            value={finalValue || ''}
            noteModal={noteModal}
          />
        </CustomModal>
      ) : (
        ''
      )}
    </div>
  );
};

DashboardHeader.propTypes = {
  host_ui: PropTypes.object.isRequired,
  setHostUI: PropTypes.func.isRequired,
  changeScaleView: PropTypes.func.isRequired,
  onCreateScreenSuccess: PropTypes.func,
  questionBank: PropTypes.array,
  onGetQuestionBankSuccess: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  setLockScreenSuccess: PropTypes.func,
  app: PropTypes.object,
  appReceiveError: PropTypes.func,
  onGetLayoutSuccess: PropTypes.func,
  onGetQuestionSuccess: PropTypes.func,
  onGetQuestionNumbersSuccess: PropTypes.func,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI, app, error } = state;
  const { questionBank } = hostUI;
  return {
    host_ui: getHostUI(hostUI),
    questionBank,
    app,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    setLockScreenSuccess: payload => dispatch(setLockScreenSuccess(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    onCreateScreenSuccess: payload => dispatch(onCreateScreenSuccess(payload)),
    onGetLayoutSuccess: payload => dispatch(onGetLayoutSuccess(payload)),
    onGetQuestionSuccess: payload => dispatch(onGetQuestionSuccess(payload)),
    onGetQuestionNumbersSuccess: payload =>
      dispatch(onGetQuestionNumbersSuccess(payload)),

    onGetQuestionBankSuccess: payload =>
      dispatch(onGetQuestionBankSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(DashboardHeader);
