import React, { useState, useEffect } from 'react';
import { Button, Card, Image } from 'react-bootstrap';
import classNames from 'classnames';
import deleteIcon from '../../../assets/images/trash-default.svg';
import plusIcon from '../../../assets/images/blue/plus.svg';

// //store
import { connect } from 'react-redux';
import { compose } from 'redux';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';
import {
  setHostUI,
  changeScaleView,
  onGetScreenSuccess,
  onDeleteScreenSuccess,
  onCreateScreenRequest,
  onCreateScreenSuccess,
  onCreateQuestionSuccess,
  onGetQuestionSuccess,
  onDeleteQuestionSuccess,
  onUpdateQuestionSuccess,
  onUpdateQuestionOrdersuccess,
  onUpdateSelectedScreenSuccess,
  onGetQuestionNumbersSuccess,
  onGetLayoutSuccess,
} from '../../../store/actions/host-ui';
import { screenGQL, questionGQL } from '../../../graphqlOperations';
import PropTypes from 'prop-types';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../store/actions/error';
import { API, graphqlOperation } from 'aws-amplify';
import { onCreateScreens } from '../../../graphql/subscriptions';
import responseWrapper from '../../../graphqlOperations/responseWrapper';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

// Temporary remove for code improvement later

const meetingName = JSON.parse(getSecureSessionData('UserData'));
let currentMeetingId = null;
if (meetingName !== null && Object.keys(meetingName).length) {
  const {
    meetingData: { id },
  } = meetingName;
  currentMeetingId = Number(id);
}

const Moderator = ({
  screens,
  host_ui,
  changeScaleView,
  onGetScreenSuccess,
  onDeleteScreenSuccess,
  onCreateScreenRequest,
  onCreateScreenSuccess,
  onGetQuestionSuccess,
  onCreateQuestionSuccess,
  onUpdateQuestionSuccess,
  onUpdateQuestionOrdersuccess,
  onUpdateSelectedScreenSuccess,
  onGetQuestionNumbersSuccess,
  appReceiveSuccess,
  appReceiveError,
  onGetLayoutSuccess,
}) => {
  const [list, setList] = useState(screens || []);
  const [selectedCard, setSelectedCard] = useState('');

  const selectCard = card => {
    changeScaleView({ selected_screen: card });
    setSelectedCard(card && card.id);
    if (card && card.id) {
      const awaitApiCall = async () => {
        await onGetLayoutSuccess([]);
        await setSecureSessionData('selectedScreen', JSON.stringify(card));
        await getQuestionHandler(card);
        await setSelectedScreen(card);
        await getQuestionNumberHandler();
      };
      awaitApiCall();
    }
    if (!getSecureSessionData('selectedScreen')) {
      setSecureSessionData('selectedScreen', JSON.stringify(card));
    }
  };

  async function getScreensHandler() {
    try {
      const payload = {
        meeting_id: currentMeetingId,
      };

      const { success, data, message } = await screenGQL.getScreensHandler(
        payload,
      );
      if (success) {
        // setList(data);
        onGetScreenSuccess(data);
        // appReceiveSuccess(message);
      } else {
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
  async function getQuestionHandler(item) {
    try {
      let screenId = (item && item.id) || null;

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
        screen_id: item.id || screenId,
      };

      const { success, data, message } = await questionGQL.getQuestionHandler(
        payload,
      );
      if (success) {
        // setList(data);
        onGetQuestionSuccess(data);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function getQuestionNumberHandler(item) {
    try {
      let templateMeetId = null;

      if (['true', true].includes(getSecureSessionData('templateView'))) {
        let screenData = getSecureSessionData('selectedScreen');
        screenData = screenData ? JSON.parse(screenData) : null;

        if (screenData && screenData.meeting_id) {
          templateMeetId = screenData.meeting_id;
        }
      }
      const payload = {
        meetingId: ['true', true].includes(getSecureSessionData('templateView'))
          ? templateMeetId
          : currentMeetingId,
        templateView: ['true', true].includes(
          getSecureSessionData('templateView'),
        ),
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

  async function deleteScreensHandler(screenId) {
    try {
      const payload = {
        meeting_id: currentMeetingId,
        id: screenId,
      };
      onDeleteScreenSuccess({ ...payload, screen_id: payload.id });
      const { success, message } = await screenGQL.deleteScreensHandler(
        payload,
      );
      if (success) {
        sessionStorage.removeItem('selectedScreen');
        const allScreens = screens.filter(e => e.id != screenId);

        if (allScreens.length) {
          setSecureSessionData('selectedScreen', JSON.stringify(allScreens[0]));
          selectCard(allScreens[0]);
        }

        // setList(data);
        appReceiveSuccess(message);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  async function createScreensHandler(payload) {
    try {
      if (payload.id == 'initalAdd') delete payload.id;

      const { success, message, data } = await screenGQL.createScreensHandler(
        payload,
      );
      if (success) {
        // setSecureSessionData('selectedScreen', JSON.stringify(data));
        selectCard(data);
        appReceiveSuccess(message);
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  useEffect(() => {
    getScreensHandler();
  }, []);

  const handleAdd = () => {
    let largest = 0;
    if (list.length) {
      largest = list[0].display_seq;

      for (var i = 1; i < list.length; i++) {
        if (largest < list[i].display_seq) {
          largest = list[i].display_seq;
        }
      }
    }
    const payloadData = {
      id: 'initalAdd',
      name: `screen ${list.length <= largest ? largest + 1 : list.length + 1}`,
      // name: `screen ${list.length + 1}`,
      meeting_id: currentMeetingId,
    };
    onCreateScreenRequest(payloadData);
    createScreensHandler(payloadData);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteScreensHandler(id);
  };

  useEffect(() => {
    setList(screens);
    if (
      screens &&
      screens.length &&
      (selectedCard == '' || selectedCard === undefined)
    ) {
      const screenId = JSON.parse(getSecureSessionData('selectedScreen'));
      setSelectedCard(
        screenId === undefined || screenId === null
          ? screens[0]
          : screenId && screenId.id,
      );
      selectCard(
        screenId === undefined || screenId === null ? screens[0] : screenId,
      );
      onUpdateSelectedScreenSuccess(
        screenId === undefined || screenId === null
          ? screens[0]
          : screenId && screenId,
      );
    }
  }, [screens]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateScreens, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onCreateScreens',
        );
        // Action to add screen data
        if (success) {
          if (data.meeting_id == currentMeetingId) {
            onCreateScreenSuccess(data);
            setSelectedScreen(data);
            appReceiveSuccess(message);
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
  }, []);

  return (
    <>
      <div className="host-sidebar__heading"></div>

      <div className="moderator__card host-sidebar-pad">
        <div className="moderator__card-items">
          {list &&
            list.length > 0 &&
            list.map((item, index) => (
              <Card
                body
                key={index.toString()}
                className={classNames(
                  { active: selectedCard == item.id },
                  'mb-2',
                )}
                role="region"
                onClick={() => {
                  selectCard(item);
                  setSecureSessionData('selectedScreen', JSON.stringify(item));
                }}
              >
                {item.name}
                {(getSecureSessionData('isNewTemplate') !== 'false' ||
                  getSecureSessionData('isEditTemplate')) && (
                  <Button
                    className="p-0"
                    aria-label="Delete"
                    onClick={e => handleDelete(item.id, e)}
                    disabled={list.length <= 1}
                  >
                    <Image src={deleteIcon} alt="Delete" width={20} />
                  </Button>
                )}
              </Card>
            ))}
        </div>
        {(getSecureSessionData('isNewTemplate') !== 'false' ||
          getSecureSessionData('isEditTemplate')) && (
          <Button
            className="moderator__btn"
            onClick={handleAdd}
            aria-label="Add Moderator Section"
          >
            <Image src={plusIcon} alt="Delete" width={18} />
            <div>Add Section</div>
          </Button>
        )}
      </div>
    </>
  );
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  return {
    host_ui: getHostUI(hostUI),
    screens: hostUI.screens,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    onGetScreenSuccess: payload => dispatch(onGetScreenSuccess(payload)),
    onGetQuestionSuccess: payload => dispatch(onGetQuestionSuccess(payload)),
    onDeleteScreenSuccess: payload => dispatch(onDeleteScreenSuccess(payload)),
    onUpdateSelectedScreenSuccess: payload =>
      dispatch(onUpdateSelectedScreenSuccess(payload)),
    onDeleteQuestionSuccess: payload =>
      dispatch(onDeleteQuestionSuccess(payload)),
    onCreateScreenRequest: payload => dispatch(onCreateScreenRequest(payload)),
    onCreateScreenSuccess: payload => dispatch(onCreateScreenSuccess(payload)),
    onGetLayoutSuccess: payload => dispatch(onGetLayoutSuccess(payload)),
    onCreateQuestionSuccess: payload =>
      dispatch(onCreateQuestionSuccess(payload)),
    onUpdateQuestionSuccess: payload =>
      dispatch(onUpdateQuestionSuccess(payload)),
    onUpdateQuestionOrdersuccess: payload =>
      dispatch(onUpdateQuestionOrdersuccess(payload)),
    onGetQuestionNumbersSuccess: payload =>
      dispatch(onGetQuestionNumbersSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    dispatch,
  };
}

Moderator.propTypes = {
  screens: PropTypes.array,
  host_ui: PropTypes.object,
  changeScaleView: PropTypes.func,
  onGetScreenSuccess: PropTypes.func,
  onDeleteScreenSuccess: PropTypes.func,
  onCreateScreenRequest: PropTypes.func,
  onCreateScreenSuccess: PropTypes.func,
  onGetQuestionSuccess: PropTypes.func,
  onCreateQuestionSuccess: PropTypes.func,
  onUpdateQuestionSuccess: PropTypes.func,
  onUpdateQuestionOrdersuccess: PropTypes.func,
  onUpdateSelectedScreenSuccess: PropTypes.func,
  onGetQuestionNumbersSuccess: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  onGetLayoutSuccess: PropTypes.func,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Moderator);

// export default Moderator;
