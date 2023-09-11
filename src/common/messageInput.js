import React, { useState } from 'react';
import { Button, Form, Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import sendBlueIcon from '../assets/images/blue/send.svg';
import sendIcon from '../assets/images/send.svg';
import { getSecureSessionData } from '../graphqlOperations/encryprWrapper';

const MessageInput = ({ handleClick, question }) => {
  const [quickTextmsg, setQuickTextmsg] = useState({ name: '', value: '' });
  const btnClick = e => {
    e.preventDefault();
    if (quickTextmsg.value) {
      if (question) {
        handleClick(question, quickTextmsg.value);
      } else {
        handleClick(quickTextmsg.value);
      }
      setQuickTextmsg({ name: '', value: '' });
    }
  };

  const role = getSecureSessionData('role');
  return (
    <div
      className={`${
        getSecureSessionData('templateView') === 'true' ||
        getSecureSessionData('templateView') === true
          ? `${'message__input parti_input_Template w-100'} ${
              getSecureSessionData('isEditTemplate') === 'true'
                ? 'message__input_edit'
                : ''
            } `
          : `${role === 'HOST' &&
              'message__input parti_input messageInput'} message__input messageInput`
      }`}
    >
      <Form onSubmit={btnClick}>
        <div className="message__inr">
          <Form.Control
            as="textarea"
            style={{ minHeight: '100%', padding: '11px 15px' }}
            rows={1}
            placeholder="Send a message..."
            name={quickTextmsg && quickTextmsg.name}
            onChange={e => {
              setQuickTextmsg({
                name: question && question.id,
                value: e.target.value,
              });
            }}
            value={
              quickTextmsg.name === (question && question.id)
                ? quickTextmsg.value
                : ''
            }
            disabled={
              ['HOST', 'ADMIN'].includes(role) &&
              (![true, 'true'].includes(
                getSecureSessionData('allowEditTemplate'),
              ) ||
                [true, 'true'].includes(getSecureSessionData('isEditTemplate')))
            }
            onKeyDown={e => {
              if (e.key == 'Enter' && e.shiftKey && e.target.value !== '') {
                setQuickTextmsg({
                  name: question && question.id,
                  value: e.target.value + '\n',
                }),
                  e.preventDefault();
              } else if (e.key == 'Enter' && e.target.value.trim() !== '') {
                btnClick(e);
              }
            }}
          />
        </div>
        <div>
          <Button
            disabled={!quickTextmsg.value}
            type="submit"
            aria-label="Send"
            className="border-0"
          >
            <Image
              src={
                quickTextmsg.name === (question && question.id)
                  ? sendBlueIcon
                  : sendIcon
              }
              style={{ pointerEvents: 'inherit' }}
              alt="Send"
              width={24}
              onClick={btnClick}
            />
          </Button>
        </div>
      </Form>
    </div>
  );
};

MessageInput.propTypes = {
  handleClick: PropTypes.func,
  question: PropTypes.object,
};
export default MessageInput;
