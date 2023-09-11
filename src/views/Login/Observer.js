/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Image,
  Modal,
  OverlayTrigger,
  Tooltip,
  Form,
} from 'react-bootstrap';
import logo from '../../assets/images/locked-logo.svg';
import seramountLogo from '../../assets/images/seramount_locked_logo.svg';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { compose } from 'redux';
import reducer from '../../store/reducers/login';
import eabBranding from '../../assets/images/evs.jpg';
import seramountBranding from '../../assets/images/seramount.jpeg';
import { API, graphqlOperation } from 'aws-amplify';
import { onUpdateUserWaitlist } from '../../graphql/subscriptions';
import responseWrapper from '../../graphqlOperations/responseWrapper';
import { appReceiveError } from '../../store/actions/error';
import { meetingGQL } from '../../graphqlOperations';
import EabLogo from '../../assets/images/EABbrand.svg';
import seraLogo from '../../assets/images/EABseramount.svg';
import popupSpeaker from '../../assets/images/popupSpeaker.svg';
import injectReducer from '../../utils/injectReducer';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../graphqlOperations/encryprWrapper';
import { loginSuccess } from '../../store/actions/login';

const Observer = () => {
  const role_name =
    JSON.parse(getSecureSessionData('UserData')) &&
    JSON.parse(getSecureSessionData('UserData')).userData &&
    JSON.parse(getSecureSessionData('UserData')).userData.role_name;

  const [userRole] = useState(role_name || 'OBSERVER');
  const history = useHistory();

  const [isSeramount, setIsSeramount] = useState(true);
  const [currentBrowser, setCurrentBrowser] = useState(true);
  const [isPermissionChecked, setIsPermissionChecked] = useState(
    ['OBSERVER', 'PARTICIPANT'].includes(getSecureSessionData('role'))
      ? getSecureSessionData(['isPermissionChecked']) === 'false'
        ? false
        : true
      : false,
  );
  const [permissionPopUp, setPermissionPopUp] = useState(false);
  const [userObs, setUserObs] = useState(
    ['true', true].includes(getSecureSessionData('isObserverLink')),
  );

  let currentMeetingId = null;
  let userData = JSON.parse(getSecureSessionData('UserData'));
  if (userData !== null && Object.keys(userData).length) {
    const {
      meetingData: { id },
    } = userData;
    currentMeetingId = Number(id);
  }

  const historyData =
    history &&
    history.location &&
    history.location.state &&
    history.location.state.data;

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    setIsSeramount(
      branding === null ? true : JSON.parse(getSecureSessionData('branding')),
    );
  }, [JSON.parse(getSecureSessionData('branding'))]);

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
            console.log('if');
            if (data && !data.is_waiting) {
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

  const handleRedirect = async () => {
    if (role_name !== 'OBSERVER') {
      const user_id = getSecureSessionData('userId');

      const informHostPayload = {
        user_id,
        isAdd: true,
      };

      await handleInformHost(informHostPayload);
    }

    const pathName = window.location.origin;
    window.location.href = `${pathName}/`;
  };

  async function handleInformHost(payload) {
    try {
      await meetingGQL.informHostHandler(payload);
    } catch (err) {
      console.log('error informing host...', err);
    }
  }

  const handleBrowserPermission = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(stream => {
        setIsPermissionChecked(false);
        setSecureSessionData('isPermissionChecked', 'false');
      })
      .catch(err => {
        setPermissionPopUp(true);
        console.log(`${err.name} : ${err.message}`);
      });
  };

  useEffect(() => {
    const BrowserRouter = (navigator.browserDetection = (function() {
      let ua = navigator.userAgent,
        tem,
        M =
          ua.match(
            /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
          ) || [];
      if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
      }
      if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null)
          return tem
            .slice(1)
            .join(' ')
            .replace('OPR', 'Opera');
      }
      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
      if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
      return M[0];
    })());
    setCurrentBrowser(BrowserRouter);
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
      <>
        {isPermissionChecked ? (
          <div className="permission-bg">
            <div className="permission-content align-items-center d-flex flex-column">
              <>
                <Image
                  className="One"
                  src={popupSpeaker}
                  style={{ height: '100px' }}
                  alt="popupSpeaker"
                />
              </>
              <div
                className="d-flex align-items-center flex-column text-center mt-5"
                style={{
                  width: '452px',
                  margin: '0 auto',
                }}
              >
                <div className="ms-3 ">
                  <span
                    style={{ color: '#333F48', fontWeight: 400 }}
                    className="mt-4"
                  >
                    <strong className="mt-5">
                      <h2>Please Note</h2>
                    </strong>{' '}
                    You will be asked to give access to your microphone and
                    speaker. You will be automatically muted and your microphone
                    will not be accessed during this session.
                  </span>
                </div>
                <div className="mt-4">
                  <span>
                    Please click <strong>“OK”</strong> to continue
                  </span>
                </div>
                <div className="mt-5 ms-3">
                  <Button
                    variant="primary"
                    aria-label="primary-OK"
                    style={{ marginRight: '272px', color: 'white' }}
                    className="m-0 d-flex flex-row justify-content-center align-items-center permissionbtn"
                    onClick={handleBrowserPermission}
                  >
                    OK
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="login_wrapper_main">
            {['PARTICIPANT', 'OBSERVER'].includes(
              getSecureSessionData('role'),
            ) && (
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip>
                    <strong>Please Note:</strong> You have been automatically
                    muted and will not be able to speak during the session
                  </Tooltip>
                }
              >
                <Image
                  className="One"
                  src={popupSpeaker}
                  style={{
                    height: '70px',
                    marginLeft: '10px',
                    cursor: 'pointer',
                    marginTop: '10px',
                  }}
                  alt="popupSpeaker"
                />
              </OverlayTrigger>
            )}
            <div className="container">
              <div className="login_wrapper col-lg-6 mx-auto ">
                <form
                  className="card p-136-80 align-items-center d-flex"
                  style={{ borderColor: '#777' }}
                >
                  <p
                    style={{ marginBottom: '20px', fontSize: '20px' }}
                    className="text-bismark mt-1"
                  >
                    You will enter the session as:
                  </p>
                  <Form.Group className="form-group">
                    <h3 className="mb-1" style={{ fontSize: '28px' }}>
                      {historyData && historyData.user_id}
                    </h3>
                  </Form.Group>

                  <button
                    type="submit"
                    className="login__submitbtn"
                    aria-label="Enter Session"
                    onClick={e => {
                      e.preventDefault();
                      handleRedirect();
                    }}
                  >
                    Enter session
                  </button>
                  <span className="mt-3" style={{ fontsize: '16px' }}>
                    {' '}
                    <p className="text-bismark mt-1">
                      Thank you in advance for joining this Employee Voice
                      Session. Your participation will be completely
                      confidential.Seramount reports responses only in an
                      anonymized and aggregated format.Your name will not appear
                      in any reports on this session, either as a participant or
                      as the individual who provided a particular response, To
                      ensure your anonymity can be maintained, please do not
                      provide any identifying information in the session.
                    </p>
                  </span>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
      <Modal show={permissionPopUp} style={{ marginTop: '20%' }}>
        <Modal.Header>
          <div className="fs-15">
            You will not be able to hear audio during the session without
            granting access to your microphone and speaker. Please reset your
            permissions and allow access to continue
          </div>
        </Modal.Header>
        <Modal.Footer>
          <Button
            variant="blue-10"
            className="ms-3 text-blue"
            aria-label="popUp-OK"
            onClick={() => setPermissionPopUp(false)}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const withReducer = injectReducer({ key: 'logIn', reducer });

export function mapDispatchToProps(dispatch) {
  return {
    loginSuccess: payload => dispatch(loginSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(null, mapDispatchToProps),
)(Observer);
