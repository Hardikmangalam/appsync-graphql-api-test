import React, { useEffect, useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import CustomModal from '../../../common/customModal';
import SaveTemplate from './SaveTemplate';
import SelectTemplate from './SelectTemplate';
import PropTypes from 'prop-types';

// //store
import { connect } from 'react-redux';
import { compose } from 'redux';
import reducer from '../../../store/reducers/host-ui';

import injectReducer from '../../../utils/injectReducer';

import { screenGQL, meetingGQL } from '../../../graphqlOperations';
import {
  getTemplateSuccess,
  onGetScreenSuccess,
  onUpdateSelectedScreenSuccess,
} from '../../../store/actions/host-ui';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../store/actions/error';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

const meetingName = JSON.parse(getSecureSessionData('UserData'));
let currentMeetingId = null;
if (meetingName !== null && Object.keys(meetingName).length) {
  const {
    meetingData: { id },
  } = meetingName;
  currentMeetingId = Number(id);
}

const Templates = ({
  templates,
  screens,
  getTemplateSuccess,
  appReceiveError,
  appReceiveSuccess,
  onGetScreenSuccess,
  onUpdateSelectedScreenSuccess,
  setIsTempLoad,
}) => {
  const [selectTemplateModal, setSelectTemplateModal] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(
    getSecureSessionData('isNewTemplate') === 'false' ? false : true,
  );
  // const [templatePreview, setTemplatePreview] = useState(
  //   getSecureSessionData('templateView') === 'true' ? true : false,
  // );
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [isTemplateLoad, setIsTemplateLoad] = useState(true);
  const [templateData, setTemplateData] = useState([]);
  const [templateName, setTemplateName] = useState();
  const [templateId, setTemplateId] = useState('');
  const [useModal, setUseModal] = useState(false);
  const [listLoader, setListLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveAsNewTemplate, setSaveAsNewTemplate] = useState(false);

  const loadTemplates = () => {
    getTemplate();
    setSelectTemplateModal(true);
  };
  useEffect(() => {
    localStorage.setItem('templateId', templateId);
  }, [templateId]);

  useEffect(() => {
    setIsNewTemplate(
      getSecureSessionData('isNewTemplate') === 'false' ? false : true,
    );
  }, [getSecureSessionData('isNewTemplate')]);

  async function getTemplate() {
    try {
      setListLoader(true);
      const { success, data, message } = await screenGQL.getTemplateHandler();
      if (success) {
        setListLoader(false);
        // appReceiveSuccess(message);
        getTemplateSuccess(data);
      } else {
        setListLoader(false);
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function loadTemplate() {
    try {
      setLoading(true);
      const payload = {
        template_id: templateId,
      };
      const { success, data, message } = await meetingGQL.loadTemplateHandler(
        payload,
      );
      if (success) {
        setLoading(false);
        setSecureSessionData('isNewTemplate', 'false');
        setSecureSessionData('templateView', 'true');
        sessionStorage.removeItem('selectedScreen');
        onGetScreenSuccess(data);
        // appReceiveSuccess(message);
        setIsTempLoad(true);
        setIsTemplateLoad(false);
        if (data && data.length) {
          setSecureSessionData('selectedScreen', JSON.stringify(data[0]));
          setSelectedScreen(data[0]);
          onUpdateSelectedScreenSuccess(data[0]);
        }
      } else {
        setLoading(false);
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function setSelectedScreen(item) {
    try {
      const payload = {
        id: item.id,
      };
      await screenGQL.setSelectedScreenHandler(payload);
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function metUseTemplateHandler() {
    try {
      setLoading(true);
      const tempId = localStorage.getItem('templateId');
      const payload = {
        template_id: Number(tempId),
        meeting_id: currentMeetingId,
      };
      const { success, message } = await meetingGQL.useTemplateInSessionHandler(
        payload,
      );
      setUseModal(false);
      if (success) {
        setLoading(false);
        setIsTemplateLoad(true);
        appReceiveSuccess(message);
        sessionStorage.removeItem('isNewTemplate');
        sessionStorage.removeItem('templateView');
        sessionStorage.removeItem('selectedScreen');
        window.onbeforeunload = null;

        window.location.reload();
      } else {
        setLoading(false);
        sessionStorage.removeItem('isNewTemplate');
        sessionStorage.removeItem('templateView');
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  // async function onDeleteTemplate() {
  //   try {
  //     const tempId = getSecureSessionData('templateId');
  //     const payload = {
  //       template_id: Number(tempId),
  //     };
  //     const { success, message } = await meetingGQL.deleteTemplateHandler(
  //       payload,
  //     );
  //     if (success) {
  //       exitHandler();
  //     } else {
  //       appReceiveError(message);
  //     }
  //   } catch (err) {
  //     appReceiveError(err);
  //   }
  // }

  const saveTemplateData = () => {
    const payload = {
      type_name: templateName,
      saveAsNew: saveAsNewTemplate,
    };
    createTemplate(payload);
    setSaveTemplate(false);
    setSaveAsNewTemplate(false);
  };
  async function createTemplate(payload) {
    try {
      setLoading(true);
      payload = {
        ...payload,
        screen_id: screens.map(({ id }) => id),
        meeting_id: currentMeetingId,
      };
      const { success, message } = await screenGQL.createTemplateHandler(
        payload,
      );
      if (success) {
        setLoading(false);
        appReceiveSuccess(message);
      } else {
        setLoading(false);
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    if (templates && templates.length > 0) {
      setTemplateData(templates);
    }
  }, [templates]);

  const exitHandler = () => {
    if (getSecureSessionData('fromSession') === 'true') {
      setSecureSessionData('allowEditTemplate', 'true');
      sessionStorage.removeItem('isNewTemplate');
      sessionStorage.removeItem('templateView');
      sessionStorage.removeItem('selectedScreen');
      window.location.reload();
    } else {
      window.close();
    }
  };
  return (
    <>
      <div className="host-sidebar__heading">Templates</div>
      <div className="host-sidebar-pad">
        {getSecureSessionData('fromSession') === 'true' && (
          <div className="d-flex justify-content-between">
            <Button
              size="sm"
              variant="blue-10"
              disabled={!isTemplateLoad}
              aria-label="Load"
              className="text-blue flex-fill justify-content-center"
              onClick={loadTemplates}
            >
              Load
            </Button>
            <Button
              size="sm"
              variant="blue"
              disabled={isTemplateLoad}
              aria-label="Use"
              className="ms-2 flex-fill justify-content-center"
              onClick={() => {
                setUseModal(true);
              }}
            >
              Use
            </Button>
          </div>
        )}
        {getSecureSessionData('isNewTemplate') &&
          !getSecureSessionData('isEditTemplate') &&
          isNewTemplate && (
            <div className="d-flex justify-content-between">
              {/* <Button
              size="sm"
              variant="blue-10"
              className="text-blue flex-fill justify-content-center"
              onClick={loadTemplates}
            >
              Load
            </Button> */}
              <Button
                size="sm"
                variant="blue"
                className="ms-2 flex-fill justify-content-center"
                onClick={() => setSaveTemplate(true)}
              >
                Save
              </Button>
            </div>
          )}
        {getSecureSessionData('isEditTemplate') && (
          <div className="d-flex justify-content-between">
            <Button
              size="sm"
              variant="blue"
              className="ms-2 flex-fill justify-content-center"
              aria-label="Save as New"
              onClick={() => {
                setSaveAsNewTemplate(true);
                setSaveTemplate(true);
              }}
            >
              Save as New
            </Button>
          </div>
        )}
        {!isNewTemplate && (
          <>
            <div className="d-flex justify-content-between">
              {/* <Button
                size="sm"
                variant="blue-10"
                className="text-blue flex-fill justify-content-center"
                onClick={() => onDeleteTemplate()}
              >
                Delete
              </Button> */}
              {/* <Button
                size="sm"
                variant="blue"
                className="ms-2 flex-fill justify-content-center"
                onClick={() => setUseModal(true)}
              >
                Use
              </Button> */}
            </div>
            <div className="d-flex justify-content-center mt-4">
              <Button
                size="sm"
                variant="link"
                className="text-decoration-none text-blue p-0"
                aria-label="Exit Template Edit"
                onClick={() => exitHandler()}
              >
                {getSecureSessionData('isEditTemplate')
                  ? 'Exit Template Edit'
                  : 'Exit Template Preview'}
              </Button>
            </div>
          </>
        )}
      </div>

      <CustomModal
        title="Please Enter a Template Name"
        isActive={saveTemplate}
        handleClose={() => setSaveTemplate(false)}
        handleButtonClick={saveTemplateData}
        handleClick={() => setSaveTemplate(false)}
        buttonTitle="Save Template"
        size="xs"
        handleSpinner={loading}
      >
        <SaveTemplate handleChange={setTemplateName} />
      </CustomModal>
      <CustomModal
        title="Select a Template"
        isActive={selectTemplateModal}
        handleClose={() => setSelectTemplateModal(false)}
        handleButtonClick={() => {
          setSelectTemplateModal(false);
          loadTemplate();
          setSecureSessionData('allowEditTemplate', 'false');
        }}
        handleClick={() => {
          setSelectTemplateModal(false);
        }}
        buttonTitle="Load Template"
        size="xs"
        handleSpinner={loading}
      >
        {listLoader ? (
          <div style={{ height: '80vh', display: 'flex' }}>
            <Spinner
              className="m-auto"
              animation="border"
              role="status"
              size="lg"
            />
          </div>
        ) : (
          <SelectTemplate list={templateData} setTemplateId={setTemplateId} />
        )}
      </CustomModal>

      {/* for the use template modal */}
      <CustomModal
        title="Are you sure you want to use this Template?"
        isActive={useModal}
        handleClose={() => setUseModal(false)}
        handleButtonClick={() => {
          metUseTemplateHandler();
          setSecureSessionData('allowEditTemplate', 'true');
        }}
        handleClick={() => setUseModal(false)}
        buttonTitle="Use Template"
        size="xs"
        handleSpinner={loading}
      >
        <Modal.Body> This will override your screens and question</Modal.Body>
      </CustomModal>
    </>
  );
};

Templates.propTypes = {
  host_ui: PropTypes.object,
  templates: PropTypes.array,
  screens: PropTypes.array,
  getTemplateSuccess: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  onUpdateSelectedScreenSuccess: PropTypes.func,
  onGetScreenSuccess: PropTypes.func,
  setIsTempLoad: PropTypes.func,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  const { templates, screens } = hostUI;
  return {
    templates,
    screens,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    getTemplateSuccess: payload => dispatch(getTemplateSuccess(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    onGetScreenSuccess: payload => dispatch(onGetScreenSuccess(payload)),
    onUpdateSelectedScreenSuccess: payload =>
      dispatch(onUpdateSelectedScreenSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Templates);
