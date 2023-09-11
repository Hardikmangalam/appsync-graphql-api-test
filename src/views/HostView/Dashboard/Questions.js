import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import MessageInput from '../../../common/messageInput';

const Questions = ({ type, answers }) => {
  if (type == 4) {
    return (
      <>
        <ListGroup>
          {answers.map((answer, index) => (
            <ListGroupItem key={index}>
              <div>
                <span className="text-gray-middle">{index + 1}.</span>
                <span
                  className="fw-bold break-word"
                  style={{ marginLeft: '.75rem' }}
                >
                  {answer.name}
                </span>
              </div>
              <div>{answer.value}</div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </>
    );
  }

  if (type == 2) {
    return (
      <>
        <ListGroup className="quick-answer-list">
          {answers.map((answer, index) => (
            <ListGroupItem key={index}>
              <div className="fw-bold text-left">{answer.name}:</div>
              <div
                className="text-gray-middle text-right"
                style={{ marginLeft: '.375rem' }}
              >
                {answer.value}
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </>
    );
  }
  if (type == 1) {
    return (
      <>
        <ListGroup className="quick-answer-list">
          {answers.map((answer, index) => (
            <ListGroupItem key={index}>
              <div className="fw-bold text-left">{answer.name} </div>
              <div
                className="text-gray-middle text-right"
                style={{ marginLeft: '.375rem' }}
              >
                {answer.value}
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </>
    );
  }
  return (
    <>
      <ListGroup>
        {answers.map((answer, index) => (
          <ListGroupItem key={index}>
            <span className="fw-bold">{answer.name}</span>{' '}
            <span>{answer.value}</span>
          </ListGroupItem>
        ))}
      </ListGroup>
      <MessageInput />
    </>
  );
};

Questions.propTypes = {
  type: PropTypes.number,
  answers: PropTypes.array,
};

export default Questions;
