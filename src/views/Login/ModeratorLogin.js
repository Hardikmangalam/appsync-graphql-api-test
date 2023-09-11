import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, Image } from 'react-bootstrap';
import logo from '../../assets/images/locked-logo.svg';
import seramountLogo from '../../assets/images/seramount_locked_logo.svg';
import classNames from 'classnames';
import eabBranding from '../../assets/images/evs.jpg';
import seramountBranding from '../../assets/images/seramount.jpeg';
import { meetingGQL } from '../../graphqlOperations';
import EabLogo from '../../assets/images/EABbrand.svg';
import seraLogo from '../../assets/images/EABseramount.svg';
import { getSecureSessionData } from '../../graphqlOperations/encryprWrapper';

const ModeratorLogin = () => {
  const pathName = window.location.origin;
  const history = useHistory();
  const historyData = history.location.state && history.location.state.data;

  const [isSeramount, setIsSeramount] = useState(true);

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    setIsSeramount(
      branding === null ? true : JSON.parse(getSecureSessionData('branding')),
    );
  }, [JSON.parse(getSecureSessionData('branding'))]);

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

  const handleRedirect = async wait => {
    // if (wait) {
    //   history.replace({ pathname: '/waitingscreen', state: { historyData } });
    // } else {

    const user_id = getSecureSessionData('userId');

    const informHostPayload = {
      user_id,
      isAdd: true,
    };

    await handleInformHost(informHostPayload);

    window.location.href = `${pathName}/`;
    // }
  };

  async function handleInformHost(payload) {
    try {
      await meetingGQL.informHostHandler(payload);
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
      <div className="login_wrapper_main">
        <div className="container">
          <div className="login_wrapper col-lg-6 mx-auto">
            <form className="card p-136-80" style={{ borderColor: '#777' }}>
              {/* <h5 className="login__signin mb-2 fw-bold">Sign in</h5> */}
              <p
                style={{ marginBottom: '40px', fontSize: '20px' }}
                className="text-bismark mt-1"
              >
                You will enter the session as:
              </p>
              <Form.Group className="form-group">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter" />
              </Form.Group>

              <button
                type="submit"
                className="login__submitbtn"
                aria-label="Enter Session"
                onClick={e => {
                  e.preventDefault();
                  handleRedirect(historyData && historyData.isWait);
                }}
              >
                Enter session
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default ModeratorLogin;
