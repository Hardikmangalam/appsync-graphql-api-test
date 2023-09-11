import React, { useState, useRef, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import CustomModal from '../../../common/customModal';
import { useModalWithData } from '../../../hooks/useModalWithData';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  AddQuestion,
  AddQuestionDetail,
  SelectQuestionTemplateModal,
} from '../Modal/AddQuestion';
import { QuestionPreview } from '../Modal/QuestionOptionSection/QuestionPreview';
import useLocalStorage from '../../../hooks/useLocalStorage';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';
import {
  setHostUI,
  changeScaleView,
  onGetQuestionBankSuccess,
  onGetQuestionSuccess,
  onCreateQuestionSuccess,
  onUpdateSelectedScreenSuccess,
  onGetQuestionNumbersSuccess,
  onGetLayoutSuccess,
} from '../../../store/actions/host-ui';
import { questionGQL, screenGQL } from '../../../graphqlOperations';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../store/actions/error';
import MessageNotification from '../messageNotification';
import { getSecureSessionData } from '../../../graphqlOperations/encryprWrapper';

const ParticipantDashboardHeader = ({
  changeScaleView,
  host_ui,
  questionBank,
  setHostUI,
  onGetQuestionBankSuccess,
  onGetQuestionSuccess,
  onUpdateSelectedScreenSuccess,
  onGetQuestionNumbersSuccess,
  appReceiveSuccess,
  appReceiveError,
  onGetLayoutSuccess,
}) => {
  const { modalOpen, setModalState } = useModalWithData();
  const [modalNested, setModalNested] = useState(false);
  const [previewQuestionModal, setPreviewQuestionModal] = useState(false);
  const [contentEditable, setContentEditable] = useState(false);
  const [screenName, setScreenName] = useState('');
  const [editQuestionModal, setEditQuestionModal] = useState();
  const [payload, setPayload] = useState({});
  const [selectedQuestionBank, setSelectedQuestionBank] = useState({});
  const [templateQueModal, setTemplateQueModal] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [scaleView, setScaleView] = useLocalStorage('scale_view', true);

  const clickRef = useRef();

  useClickOutside(clickRef, () => {
    setContentEditable(false);
  });

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
      const { message, success } = await screenGQL.createScreensHandler(
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

      const { message, success } = await questionGQL.saveQuestionBankHandler(
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

      const { message, success } = await questionGQL.createQuestionHandler(
        payload,
      );
      success ? appReceiveSuccess(message) : appReceiveError(message);
      setPayload({});
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
        // setList(data);
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

  async function getQuestionHandler(item) {
    try {
      let screenId = item.id || null;

      if (!screenId) {
        let meetData = getSecureSessionData('meetData');
        meetData = meetData ? JSON.parse(meetData) : null;

        if (
          meetData &&
          meetData.meetingData &&
          meetData.meetingData.selectedscreen
        ) {
          screenId = meetData.meetingData.selectedscreen || -1;
        }
      }
      const payload = {
        screen_id: screenId || -1,
      };

      const { success, data, message } = await questionGQL.getQuestionHandler(
        payload,
      );
      if (success) {
        // setList(data);
        onGetQuestionSuccess(data);
        appReceiveSuccess(message);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function getQuestionNumberHandler(items) {
    try {
      let { meeting_id } = items;

      if (!meeting_id) {
        let meetData = getSecureSessionData('meetData');
        meetData = meetData ? JSON.parse(meetData) : null;

        if (meetData && meetData.meetingData && meetData.meetingData.id) {
          meeting_id = meetData.meetingData.id || -1;
        }
      }

      const payload = {
        meetingId: meeting_id,
      };

      if (meeting_id) {
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
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    if (host_ui && host_ui.selected_screen) {
      getQuestionHandler(host_ui.selected_screen);
      getQuestionNumberHandler(host_ui.selected_screen);
      getScreenLayoutHandlerdata(host_ui.selected_screen);
    }
  }, [host_ui.selected_screen.id]);

  async function getScreenLayoutHandlerdata(item) {
    if (['HOST', 'ADMIN'].includes(getSecureSessionData('role'))) {
      return;
    }
    try {
      let screenId = item.id || null;

      if (!screenId) {
        let meetData = getSecureSessionData('meetData');
        meetData = meetData ? JSON.parse(meetData) : null;

        if (
          meetData &&
          meetData.meetingData &&
          meetData.meetingData.selectedscreen
        ) {
          screenId = meetData.meetingData.selectedscreen || -1;
        }
      }

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
          onGetLayoutSuccess(data.layout);
        }
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    let screenName = host_ui.selected_screen.name || null;
    if (!screenName) {
      let screenData = JSON.parse(getSecureSessionData('selectedScreen'));
      if (screenData && Object.keys(screenData).length) {
        screenName = screenData.name;
      }
    }
    setScreenName(screenName);
  }, [host_ui.selected_screen.name]);

  return (
    <div className="dashboard-header d-flex align-items-center">
      <div style={{ position: 'absolute', left: '50%', top: '5px' }}>
        <MessageNotification />
      </div>
      {contentEditable ? (
        <Form.Control
          style={{ width: '290px' }}
          defaultValue={screenName}
          onKeyDown={handleKeydown}
          ref={clickRef}
        />
      ) : (
        <div>{screenName}</div>
      )}
      <div style={{ width: '60%', height: '56px', marginLeft: '2rem' }}>
        <>
          <div className="d-flex">
            <div className="fw-bold px-2" style={{ lineHeight: '55px' }}>
              {host_ui && host_ui.update_Title
                ? `${host_ui && host_ui.update_Title} :`
                : ''}
            </div>
            <div
              className=" text-bismark d-flex"
              style={{ marginTop: '17px' }}
              dangerouslySetInnerHTML={{
                __html: host_ui && host_ui.update_Description,
              }}
            ></div>
          </div>
        </>
      </div>

      {/* {(getSecureSessionData('isNewTemplate') !== 'false' ||
        getSecureSessionData('isEditTemplate')) && (
        <Form.Check className="checkbox ms-auto">
          <Form.Check.Input
            id="checkbox-3"
            className="checkbox-input"
            defaultChecked={scaleView}
            onChange={() => setScaleView(!scaleView)}
          />
          <Form.Check.Label htmlFor="checkbox-3" className="checkbox-label">
            Scale View
          </Form.Check.Label>
        </Form.Check>
      )} */}

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
        }}
        bottomText="Select Question from the Bank"
        handleModalTextClick={loadQuestionBank}
        bottomTextFrom
      >
        <AddQuestion setEditQuestionModal={setEditQuestionModal} />
      </CustomModal>

      {modalNested && (
        <CustomModal
          title="Add New Question"
          isActive={modalNested}
          handleClose={() => {
            setModalNested(false);
            setModalState(false);
          }}
          handleButtonClick={handleAddQuestion}
          handleClick={() => setModalState(false)}
          handleSaveClick={saveQuestionBank}
          buttonTitle="Save Question"
          buttonBottomTitle="Save Question to the Bank"
          buttonBottomFrom
        >
          <AddQuestionDetail
            questionType={editQuestionModal}
            handleChange={handleChange}
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
    </div>
  );
};

ParticipantDashboardHeader.propTypes = {
  host_ui: PropTypes.object.isRequired,
  setHostUI: PropTypes.func.isRequired,
  changeScaleView: PropTypes.func.isRequired,
  questionBank: PropTypes.array,
  onGetQuestionBankSuccess: PropTypes.func,
  onGetQuestionSuccess: PropTypes.func,
  onCreateQuestionSuccess: PropTypes.func,
  onUpdateSelectedScreenSuccess: PropTypes.func,
  onGetQuestionNumbersSuccess: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  onGetLayoutSuccess: PropTypes.func,
  setTitle: PropTypes.string,
  setPopup: PropTypes.string,
  compKey: PropTypes.number,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  const { questionBank } = hostUI;
  return {
    host_ui: getHostUI(hostUI),
    questionBank,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    onGetQuestionSuccess: payload => dispatch(onGetQuestionSuccess(payload)),
    onCreateQuestionSuccess: payload =>
      dispatch(onCreateQuestionSuccess(payload)),
    onGetQuestionBankSuccess: payload =>
      dispatch(onGetQuestionBankSuccess(payload)),
    onUpdateSelectedScreenSuccess: payload =>
      dispatch(onUpdateSelectedScreenSuccess(payload)),
    onGetQuestionNumbersSuccess: payload =>
      dispatch(onGetQuestionNumbersSuccess(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    onGetLayoutSuccess: payload => dispatch(onGetLayoutSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(ParticipantDashboardHeader);
