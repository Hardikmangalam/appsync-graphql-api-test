import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import injectReducer from '../../../utils/injectReducer';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import {
  onCreateScreenSuccess,
  onUpdateSelectedScreenSuccess,
} from '../../../store/actions/host-ui';
import ParticipantDashboardHeader from './ParticipantDashboardHeader';
import ModeratorRightSidebar from './ModeratorRightSidebar';
import ObserverQuestionCard from './ObserverQuestionCard';
import { meetingGQL, screenGQL } from '../../../graphqlOperations';
import EABImage from '../../../assets/images/EABbrand.svg';
import seramountImage from '../../../assets/images/EABseramount.svg';
import { Button, Modal } from 'react-bootstrap';
import responseWrapper from '../../../graphqlOperations/responseWrapper';
import { onStartStopMeeting } from '../../../graphql/subscriptions';
import { API, graphqlOperation } from 'aws-amplify';
import { appReceiveError } from '../../../store/actions/error';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';
const brandLogs = JSON.parse(getSecureSessionData('branding'));

const ObserverDashboard = ({ onUpdateSelectedScreenSuccess, layout_view }) => {
  const [finalValue, setFinalValue] = useState(null);
  const [popupValue, setPopupValue] = useState(null);
  const [started, setStarted] = useState(false);

  let currentMeetingId = null;
  const meetingName = JSON.parse(getSecureSessionData('UserData'));
  if (meetingName !== null && Object.keys(meetingName).length) {
    const {
      meetingData: { id },
    } = meetingName;
    currentMeetingId = Number(id);
  }

  let noteData = JSON.parse(getSecureSessionData('meetData'));
  useEffect(() => {
    const user_id = getSecureSessionData('userId');
    const informHostPayload = {
      user_id,
      isAdd: true,
    };

    handleInformHost(informHostPayload);
    getSelectedScreenHandler();
  }, []);
  async function handleInformHost(payload) {
    try {
      await meetingGQL.informHostHandler(payload);
    } catch (err) {
      console.log('error informing host...', err);
    }
  }

  async function getSelectedScreenHandler() {
    let noteData = JSON.parse(getSecureSessionData('meetData'));
    const payload = {
      meetingId: Number(noteData.meetingData.id),
    };
    try {
      const { success, data } = await screenGQL.getSelectedScreenHandler(
        payload,
      );
      if (success) {
        if (data.meeting_id === Number(noteData.meetingData.id)) {
          setSecureSessionData('selectedScreen', JSON.stringify(data));
          onUpdateSelectedScreenSuccess(data);
        }
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

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
    const subscription = API.graphql(
      graphqlOperation(onStartStopMeeting, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: ({ provider, value }) => {
        const { success, data } = responseWrapper(value, 'onStartStopMeeting');
        // Action to add screen data
        if (success) {
          let meetingData = JSON.parse(getSecureSessionData('meetData'));
          let userData = JSON.parse(getSecureSessionData('UserData'));
          if (
            meetingData.meetingData.id == data.id &&
            userData.meetingData.id == data.id &&
            !data.is_started
          ) {
            let meetData = getSecureSessionData('meetData');
            meetData = JSON.parse(meetData);
            let branding = getSecureSessionData('branding');
            branding = JSON.parse(branding);

            sessionStorage.clear();
            setStarted(true);
            setSecureSessionData('meetData', JSON.stringify(meetData));
            setSecureSessionData('branding', JSON.stringify(branding));
          }
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getSecureSessionData('UserData')]);

  const redirectUser = () => {
    let branding = getSecureSessionData('branding');
    branding = JSON.parse(branding);
    if (branding === true) {
      window.location.href = `https://seramount.com/`;
    } else {
      window.location.href = `https://eab.com/`;
    }
  };

  return (
    <>
      <div
        className="userDashboard dashboard observer"
        style={{
          overflow: 'hidden',
          backgroundImage: `url(${
            brandLogs && brandLogs !== null && brandLogs === true
              ? seramountImage
              : EABImage
          })`,
        }}
      >
        <Modal show={started} style={{ marginTop: '20%' }}>
          <Modal.Header>
            <Modal.Title>
              <div className="model-title1">
                <strong>
                  The session has ended. Thank you again for your participation.
                </strong>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button
              variant="blue-10"
              aria-label='OK'
              className="ms-3 text-blue"
              onClick={() => redirectUser()}
            >
              OK
            </Button>
          </Modal.Footer>
        </Modal>
        <ModeratorRightSidebar />
        <ParticipantDashboardHeader
          setPopup={finalValue}
          setTitle={popupValue}
        />
        <div className="dashboard-participant-wrapper dashboard-wrapper">
          <div className="question d-flex" style={{ width: '100%' }}>
            <ObserverQuestionCard />
          </div>
        </div>
      </div>
    </>
  );
};

ObserverDashboard.propTypes = {
  host_ui: PropTypes.object.isRequired,
  onCreateScreenSuccess: PropTypes.func,
  onUpdateSelectedScreenSuccess: PropTypes.func,
  layout_view: PropTypes.string,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  const { host_ui } = hostUI;
  const { layout_view } = host_ui;
  return {
    host_ui: getHostUI(hostUI),
    layout_view,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    onCreateScreenSuccess: payload => dispatch(onCreateScreenSuccess(payload)),
    onUpdateSelectedScreenSuccess: payload =>
      dispatch(onUpdateSelectedScreenSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(ObserverDashboard);
