/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Form, Image, Navbar, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { meetingGQL } from '../../graphqlOperations';
// //store
import { connect } from 'react-redux';
import { compose } from 'redux';
import logo from '../../assets/images/locked-logo.svg';
import seramountLogo from '../../assets/images/seramount_locked_logo.svg';
import eabBranding from '../../assets/images/evs.jpg';
import seramountBranding from '../../assets/images/seramount.jpeg';
import favicon from '../../assets/images/favicon.ico';
import favicon_eab from '../../assets/images/favicon_eab.ico';
import EabLogo from '../../assets/images/EABbrand.svg';
import seraLogo from '../../assets/images/EABseramount.svg';
import injectReducer from '../../utils/injectReducer';
import { loginSuccess, loginFailed } from '../../store/actions/login';
import reducer, { loginData } from '../../store/reducers/login';
import { createBrowserHistory } from 'history';
import { appReceiveError, appReceiveSuccess } from '../../store/actions/error';
import classNames from 'classnames';
import { getCookieConstent } from '../../store/reducers/host-ui';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../graphqlOperations/encryprWrapper';

const history = createBrowserHistory();
const Login = ({
  meetingData,
  loginSuccess,
  loginFailed,
  appReceiveError,
  appReceiveSuccess,
}) => {
  const history = useHistory();

  const pathName = window.location.origin;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSeramount, setIsSeramount] = useState(true);

  let meetData = getSecureSessionData('meetData');
  meetData = JSON.parse(meetData);

  const handleSubmit = e => {
    setLoading(true);
    const data = {
      full_name: name,
      email: email.toLowerCase(),
      meeting_id: meetData.meetingData.id,
    };
    handleLogin(data);
  };

  useEffect(() => {
    // window.onbeforeunload = function(e) {
    //   if (getSecureSessionData('CookieConsent') === 'false') {
    //     let Cookies = document.cookie.split(';');
    //     console.log('Cookies', Cookies);
    //     // set past expiry to all cookies
    //     for (const element of Cookies) {
    //       document.cookie =
    //         element + '=; expires=' + new Date(0).toUTCString();
    //       clearCookie.remove('CookieConsent');
    //     }
    //   }
    // };
  }, []);

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    const header = document.querySelector('.locked-screen-header');

    if (branding === null || branding === true) {
      header.style.backgroundImage = `url(${seramountBranding})`;
      document.body.style.backgroundImage = `url('${seraLogo}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      header.style.backgroundImage = `url(${eabBranding})`;
      document.body.style.backgroundImage = `url('${EabLogo}')`;
      document.body.style.backgroundSize = 'cover';
    }
    header.style.display = 'block';

    setIsSeramount(
      branding === null ? true : JSON.parse(getSecureSessionData('branding')),
    );

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (branding === null || branding === true) {
      link.href = favicon;
      document.title = 'Seramount';
    } else {
      link.href = favicon_eab;
      document.title = 'EAB';
    }
  }, [JSON.parse(getSecureSessionData('branding'))]);

  async function handleLogin(payload) {
    try {
      const { data, success, message } = await meetingGQL.loginHandler(payload);
      if (success) {
        appReceiveSuccess(message);
        setLoading(false);
        loginSuccess(data);
        setSecureSessionData('UserData', JSON.stringify(data));
        setSecureSessionData('token', data.token);
        setSecureSessionData('role', data.userData.role_name);
        setSecureSessionData(
          'isStartMeeting',
          data.meetingData.is_started.toString(),
        );
        setSecureSessionData(
          'isLockedScreen',
          data.meetingData.is_screen_lock.toString(),
        );
        setSecureSessionData('userId', data.user_id);
        setSecureSessionData('fromSession', 'true');
        setSecureSessionData('userName', name);
        sessionStorage.removeItem('isDeviceChecked');

        if (data.screenData) {
          setSecureSessionData(
            'selectedScreen',
            JSON.stringify(data.screenData),
          );
        }

        if (
          data.userData.role_name === 'HOST' ||
          data.userData.role_name === 'ADMIN'
        ) {
          setSecureSessionData('allowEditTemplate', 'true');
          const informHostPayload = {
            user_id: data.user_id,
            isAdd: true,
          };

          await handleInformHost(informHostPayload);
        }
        if (data.userData.role_name == 'OBSERVER') {
          history.replace({ pathname: '/observer', state: { data } });
        } else if (data.userData.role_name == 'MODERATOR') {
          history.replace({ pathname: '/moderator', state: { data } });
        } else if (data.userData.role_name == 'PARTICIPANT') {
          history.replace({ pathname: '/participant', state: { data } });
        } else {
          window.location.href = `${pathName}/`;
        }
      } else {
        setMessage(message);
        setLoading(false);
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
      setLoading(false);
      loginFailed(err);
    }
  }

  async function handleInformHost(payload) {
    try {
      await meetingGQL.informHostHandler(payload);
      setSecureSessionData('Attendees', JSON.stringify([]));
    } catch (err) {
      console.log('error informing host...', err);
    }
  }

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
      <div className="login_wrapper_main user_login">
        <div className="container">
          <div className="login_wrapper col-lg-6 mx-auto">
            <form className="card p-80" style={{ borderColor: '#777' }}>
              <div>
                <div>
                  <p
                    style={{ marginBottom: '40px', fontSize: '20px' }}
                    className="text-bismark mt-1"
                  >
                    Please enter the same email you used to register in order to
                    enter the session.
                  </p>
                  <Form.Group className="form-group">
                    <Form.Label>Full name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter"
                      onChange={e => setName(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="form-group">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter"
                      onChange={e => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <button
                    type="submit"
                    className="login__submitbtn"
                    aria-label="Generate Anonymous User ID"
                    disabled={email === ''}
                    onClick={e => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    Generate Anonymous User ID
                    {loading && (
                      <Spinner
                        className="ms-2"
                        animation="border"
                        role="status"
                        size="sm"
                      />
                    )}
                  </button>
                  <span
                    className="is-invalid-text text-ceneter mb-2"
                    style={{ color: 'red' }}
                  >
                    {message}
                  </span>
                  <p className="text-bismark mt-1">
                    Your name and email address are used only to verify your
                    registration.They will NOT be visible to the other
                    participants in the session.Your responses in the session
                    will be kept completely confidential.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const withReducer = injectReducer({ key: 'logIn', reducer });

const mapStateToProps = state => {
  const { logIn, hostUI } = state;
  const {
    meetings: { meetingData },
  } = logIn;
  return {
    login: loginData(logIn),
    meetingData,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    loginSuccess: payload => dispatch(loginSuccess(payload)),
    loginFailed: payload => dispatch(loginFailed(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    dispatch,
  };
}

Login.propTypes = {
  loginSuccess: PropTypes.func,
  loginFailed: PropTypes.func,
  meetingData: PropTypes.object,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Login);
