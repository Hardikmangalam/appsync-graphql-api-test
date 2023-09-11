import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
// import { propTypes } from 'react-bootstrap/esm/Image';
import { Image } from 'react-bootstrap';
import checkAllIcon from '../../assets/images/blue/check-all.svg';
import moment from 'moment-timezone';
import { getSecureSessionData } from '../../graphqlOperations/encryprWrapper';

const Messages = ({ publicChat }) => {
  const usrData = JSON.parse(getSecureSessionData('UserData')) || {};
  const userDBId =
    (usrData && Object.keys(usrData).length && usrData.userData.id) || '';
  useEffect(() => {
    // if (publicChat['chatData'])
    //   publicChat &&
    //     publicChat.chatData.find(ele =>
    //       ele && ele.userDBId.toString() == userDBId.toString()
    //         ? setSenders(ele)
    //         : setReceivers(ele),
    //     );
  }, [publicChat]);

  return (
    <>
      <div className="message">
        {publicChat.type == 1 &&
        publicChat &&
        publicChat['chatData'] !== undefined
          ? publicChat.chatData.length > 0 &&
            publicChat.chatData.map((msg, idx) =>
              msg.userDBId.toString() == userDBId.toString() ? (
                <>
                  <div className="message__sent">
                    <div className="message__sent-text">
                      {msg &&
                        msg.text
                          .trim()
                          .split(/\r\n|\r|\n/)
                          .map(e => (
                            <div key={e} className="break-word">
                              {e}
                              <br />
                            </div>
                          ))}
                    </div>
                  </div>
                  <div className="message__sent-detail">
                    <Image src={checkAllIcon} alt="Double Tick" />{' '}
                    {moment.unix(msg.timestamp).format('LT')}{' '}
                  </div>
                </>
              ) : (
                <>
                  <div className="message__received">
                    <div className="message__received-text">
                      {msg &&
                        msg.text
                          .trim()
                          .split(/\r\n|\r|\n/)
                          .map(e => (
                            <div key={e} className="break-word">
                              {e}
                              <br />
                            </div>
                          ))}
                    </div>
                  </div>
                  <div className="message__received-detail">
                    {msg.user_Id}, {moment.unix(msg.timestamp).format('LT')}{' '}
                  </div>
                </>
              ),
            )
          : ''}

        {publicChat.type == 2 &&
        publicChat &&
        publicChat['chatData'] !== undefined
          ? publicChat.chatData.length > 0 &&
            publicChat.chatData.map((msg, idx) =>
              // msg.from == 2 &&
              msg.userDBId.toString() == userDBId.toString() ? (
                <>
                  <div className="message__sent">
                    <div className="message__sent-text">
                      {msg &&
                        msg.text
                          .trim()
                          .split(/\r\n|\r|\n/)
                          .map(e => (
                            <div key={e} className="break-word">
                              {e}
                              <br />
                            </div>
                          ))}
                    </div>
                  </div>
                  <div className="message__sent-detail">
                    <Image src={checkAllIcon} alt="Double Tick" />{' '}
                    {moment.unix(msg.timestamp).format('LT')}{' '}
                  </div>
                </>
              ) : (
                <>
                  <div className="message__received">
                    <div className="message__received-text">
                      {msg &&
                        msg.text
                          .trim()
                          .split(/\r\n|\r|\n/)
                          .map(e => (
                            <div key={e} className="break-word">
                              {e}
                              <br />
                            </div>
                          ))}
                    </div>
                  </div>
                  <div className="message__received-detail">
                    {msg.user_Id}, {moment.unix(msg.timestamp).format('LT')}{' '}
                  </div>
                </>
              ),
            )
          : ''}

        {publicChat.type == 3 &&
        publicChat &&
        publicChat['chatData'] !== undefined
          ? publicChat.chatData.length > 0 &&
            publicChat.chatData.map((msg, idx) =>
              msg.userDBId.toString() == userDBId.toString() ? (
                <>
                  <div className="message__sent">
                    <div className="message__sent-text">
                      {msg &&
                        msg.text
                          .trim()
                          .split(/\r\n|\r|\n/)
                          .map(e => (
                            <div key={e} className="break-word">
                              {e}
                              <br />
                            </div>
                          ))}
                    </div>
                  </div>
                  <div className="message__sent-detail">
                    <Image src={checkAllIcon} alt="Double Tick" />{' '}
                    {moment.unix(msg.timestamp).format('LT')}{' '}
                  </div>
                </>
              ) : (
                <>
                  <div className="message__received">
                    <div className="message__received-text">
                      {msg &&
                        msg.text
                          .trim()
                          .split(/\r\n|\r|\n/)
                          .map(e => (
                            <div key={e} className="break-word">
                              {e}
                              <br />
                            </div>
                          ))}
                    </div>
                  </div>
                  <div className="message__received-detail">
                    {msg.user_Id}, {moment.unix(msg.timestamp).format('LT')}{' '}
                  </div>
                </>
              ),
            )
          : ''}
      </div>
    </>
  );
};

Messages.propTypes = {
  publicChat: PropTypes.object,
};

export default Messages;
