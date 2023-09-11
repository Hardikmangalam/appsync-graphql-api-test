/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

import React, { useEffect, useState } from 'react';
import { Button, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import logo from '../../assets/images/locked-logo.svg';
import seramountLogo from '../../assets/images/seramount_locked_logo.svg';
import seramount_Logo from '../../assets/images/seramountLogo.svg';
import eabLogo from '../../assets/images/EABLogoColor-primaryLogo.png';
import moment from 'moment';
import classNames from 'classnames';
import { appReceiveError } from '../../store/actions/error';
import eabBranding from '../../assets/images/evs.jpg';
import seramountBranding from '../../assets/images/seramount.jpeg';
import { API, graphqlOperation } from 'aws-amplify';
import {
  onStartStopMeeting,
  onUpdateUserWaitlist,
} from '../../graphql/subscriptions';
import responseWrapper from '../../graphqlOperations/responseWrapper';
import EabLogo from '../../assets/images/EABbrand.svg';
import seraLogo from '../../assets/images/EABseramount.svg';
import popupSpeaker from '../../assets/images/popupSpeaker.svg';
import { meetingGQL } from '../../graphqlOperations';
import TestingSpeaker from '../../views/Vizart/testingSpeaker';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../graphqlOperations/encryprWrapper';
import { logoutUser } from '../../graphql/mutations';

const isSeramount = JSON.parse(getSecureSessionData('branding'));
const meetingName = JSON.parse(getSecureSessionData('UserData'));
let currentMeetingId = null;
if (meetingName !== null && Object.keys(meetingName).length) {
  const {
    meetingData: { id },
  } = meetingName;
  currentMeetingId = Number(id);
}

const WaitingScreen = () => {
  let userData = getSecureSessionData('UserData')
    ? JSON.parse(getSecureSessionData('UserData'))
    : null;
  const meetId = JSON.parse(getSecureSessionData('meetData')).meetingData.id;

  const role_name =
    JSON.parse(getSecureSessionData('UserData')) &&
    JSON.parse(getSecureSessionData('UserData')).userData &&
    JSON.parse(getSecureSessionData('UserData')).userData.role_name;
  const [userRole] = useState(role_name || 'OBSERVER');
  const [testSpeaker, setTestSpeaker] = useState(false);

  useEffect(() => {
    window.onbeforeunload = async function(e) {
      await fetch(API.graphql(graphqlOperation(logoutUser)))
        .then(result => result.json())
        .then(console.log);
    };
    let userData = JSON.parse(getSecureSessionData('UserData'));
    const user_id = getSecureSessionData('userId');
    const informHostPayload = {
      user_id,
      isAdd: true,
    };
    if (userData && !userData.isWait) {
      handleInformHost(informHostPayload);
    }
    if (userRole === 'PARTICIPANT') {
      handleInformHost(informHostPayload);
    }
  }, []);

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
            userData.meetingData.id == data.id
          ) {
            window.onbeforeunload = null;
          }
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateUserWaitlist, { meeting_id: currentMeetingId }),
    ).subscribe({
      next: async ({ provider, value }) => {
        const { success, data, message } = responseWrapper(
          value,
          'onUpdateUserWaitlist',
        );

        if (success && data && data.meeting_id == currentMeetingId) {
          if (
            userRole === 'OBSERVER' &&
            data.userDBIds.includes(userData.userData.id)
          ) {
            let userData = JSON.parse(getSecureSessionData('UserData'));

            if (data && !data.is_waiting) {
              window.onbeforeunload = null;

              // WHEN HOST ACCEPT
              delete userData.isWait;
              userData = { ...userData, isWait: false };
              setSecureSessionData('UserData', JSON.stringify(userData));

              const user_id = getSecureSessionData('userId');

              const informHostPayload = {
                user_id,
                isAdd: true,
              };

              await handleInformHost(informHostPayload);

              window.location.href = '/';
            } else if (data && data.is_waiting) {
              // WHEN HOST REJECT
              alert(
                'Your request for joining into session has been rejected by host.\n Thank you again for your participation.',
              );
              let meetData = getSecureSessionData('meetData');
              meetData = JSON.parse(meetData);
              let branding = getSecureSessionData('branding');
              branding = JSON.parse(branding);
              sessionStorage.clear();
              setSecureSessionData('meetData', JSON.stringify(meetData));
              setSecureSessionData('branding', JSON.stringify(branding));
              window.location.href = `/login`;
            }
          }
        } else {
          if (data && data.meeting_id == currentMeetingId) {
            appReceiveError(message);
          }
        }
      },
      error: error => console.warn(error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleInformHost(payload) {
    try {
      await meetingGQL.informHostHandler(payload);
    } catch (err) {
      console.log('error informing host...', err);
    }
  }

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    if (branding === null || branding === true) {
      document.body.style.backgroundImage = `url('${seraLogo}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = `url('${EabLogo}')`;
      document.body.style.backgroundSize = 'cover';
    }
  }, [JSON.parse(getSecureSessionData('branding'))]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const start_date_time = moment(
      new Date(userData.meetingData.start_date_time),
      'HH:mm:ss a',
    );
    const currentTime = moment(new Date(), 'HH:mm:ss a');
    const diff = start_date_time.diff(currentTime, 'millisecond');

    if (getSecureSessionData('role') !== 'OBSERVER') {
      setTimeout(() => {
        if (!userData.isWait) {
          delete userData.isWait;
          userData = { ...userData, isWait: false };
          setSecureSessionData('UserData', JSON.stringify(userData));
          window.location.href = '/';
        }
      }, Math.abs(diff));
    }
  }, []);

  return (
    <>
      <header
        className={classNames(
          { 'is-seramount': isSeramount },
          'locked-screen-header',
        )}
        style={{
          backgroundImage: `url(${
            isSeramount ? seramountBranding : eabBranding
          })`,
        }}
      >
        <Image
          src={isSeramount ? seramountLogo : logo}
          alt="Logo"
          width={isSeramount ? 192 : 108}
          className="mb-2"
        />
        {isSeramount === false ? (
          <div className="text-white mt-1">We Empower Inclusive Workplaces</div>
        ) : (
          ''
        )}
      </header>
      <section className="locked-screen-wrapper text-center">
        {['PARTICIPANT', 'OBSERVER'].includes(getSecureSessionData('role')) && (
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip>
                <strong>Please Note:</strong> You have been automatically muted
                and will not be able to speak during the session
              </Tooltip>
            }
          >
            <Image
              className="One"
              src={popupSpeaker}
              alt="popupSpeaker"
              style={{
                height: '70px',
                top: '128px',
                left: '10px',
                position: 'absolute',
                cursor: 'pointer',
              }}
            />
          </OverlayTrigger>
        )}
        <form
          className={`card col-md-6 ${
            getSecureSessionData('role') === 'PARTICIPANT'
              ? 'participant-card'
              : 'observer-card'
          }`}
        >
          <div className="wrapper__heading mb-4">
            {getSecureSessionData('role') === 'PARTICIPANT'
              ? ' Please wait for the session to start'
              : 'Please wait for the host to start this session.'}
          </div>

          <div className="col-md-12">
            <Image
              src={isSeramount ? seramount_Logo : eabLogo}
              alt="Logo"
              width={isSeramount ? 192 : 108}
              className="mb-2"
            />
          </div>

          {getSecureSessionData('role') === 'PARTICIPANT' ? (
            <div className="btn_speaker">
              <Button
                color="blue"
                variant="blue-10"
                aria-label='Test Computer Speaker'
                className="ms-3 text-blue"
                onClick={() => setTestSpeaker(true)}
              >
                Test Computer Speaker
              </Button>
            </div>
          ) : (
            <div className="btn_speaker">
              <Button
                color="blue"
                variant="blue-10"
                aria-label='Test Computer Speaker'
                className="ms-3 text-blue"
                onClick={() => setTestSpeaker(true)}
              >
                Test Computer Speaker
              </Button>
            </div>
          )}

          {/* )} */}
        </form>
        {testSpeaker && (
          <TestingSpeaker
            testSpeaker={testSpeaker}
            setTestSpeaker={setTestSpeaker}
          />
        )}
      </section>
    </>
  );
};

export default WaitingScreen;
