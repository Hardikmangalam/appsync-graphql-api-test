/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Toast,
} from 'react-bootstrap';
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
import ParticipantQuestionCard from './ParticipantQuestionCard';
import { meetingGQL, screenGQL } from '../../../graphqlOperations';
import EABImage from '../../../assets/images/EABbrand.svg';
import seramountImage from '../../../assets/images/EABseramount.svg';
import { appReceiveError } from '../../../store/actions/error';
import { getSecureSessionData, setSecureSessionData } from '../../../graphqlOperations/encryprWrapper';

const brandLogs = JSON.parse(getSecureSessionData('branding'));
const ParticipantDashboard = ({
  host_ui,
  onCreateScreenSuccess,
  appReceiveError,
  onUpdateSelectedScreenSuccess,
}) => {
  const [screenName, setScreenName] = useState(null);
  const [started, setStarted] = useState(false);
  let userData = JSON.parse(getSecureSessionData('UserData'));

  useEffect(() => {
    setScreenName(
      host_ui && host_ui.selected_screen && host_ui.selected_screen.title,
    );
  }, [host_ui.selected_screen]);

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
      const {
        success,
        data,
        message,
      } = await screenGQL.getSelectedScreenHandler(payload);
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
        className="userDashboard dashboard participant safariAnimat"
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
              className="ms-3 text-blue"
              aria-label='OK'
              onClick={() => redirectUser()}
            >
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        <ParticipantDashboardHeader />
        <div className="dashboard-participant-wrapper dashboard-wrapper">
          <div className="question d-flex" style={{ width: '100%' }}>
            <ParticipantQuestionCard />
          </div>
        </div>
      </div>
    </>
  );
};

ParticipantDashboard.propTypes = {
  host_ui: PropTypes.object.isRequired,
  onCreateScreenSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  onUpdateSelectedScreenSuccess: PropTypes.func,
  compKey: PropTypes.number,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  return {
    host_ui: getHostUI(hostUI),
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    onCreateScreenSuccess: payload => dispatch(onCreateScreenSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    onUpdateSelectedScreenSuccess: payload =>
      dispatch(onUpdateSelectedScreenSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(ParticipantDashboard);
