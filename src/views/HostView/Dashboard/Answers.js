import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Form } from 'react-bootstrap';
import MessageInput from '../../../common/messageInput';
import { DragToReorderList } from '../../HostView/Modal/DragToReorderList';

const Answers = ({
  type,
  answers,
  role,
  setQuestionData,
  QuestionData,
  onSaveQuestion,
  setList,
  list,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    const finalMapVal =
      answers && answers.map(data => data.input_data_type == 4);
    if (
      answers &&
      answers.length >= 0 &&
      finalMapVal &&
      finalMapVal.length > 0 &&
      role == 'PARTICIPANT'
    ) {
      setList(answers);
    }
  }, [selectedOptions, answers]);

  const handleCheckboxChange = (value, type) => {
    if (selectedOptions.includes(value)) {
      const index = selectedOptions.indexOf(value);
      selectedOptions.splice(index, 1);
    } else {
      selectedOptions.push(value);
    }
    setQuestionData({ response_id: selectedOptions, type: type });
    setSelectedOptions(selectedOptions);
  };
  const updateList = listData => {
    setList(listData);
  };

  const hanldeRankOrderChange = (event, i, type) => {
    const { id } = event.target;
    const finalIdsVal =
      list &&
      list.map(obj => {
        if (obj.id == id) {
          obj.name = event.target.value;
        }
        return obj;
      });
    const idx = [i];
    list[idx] = id;

    setList(finalIdsVal);
    setQuestionData({ type: type });
  };

  if (type == 4) {
    return (
      <>
        {(role === 'HOST' || role === 'ADMIN') && (
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
        )}
        {role == 'PARTICIPANT' && (
          <ListGroup className="quick-answer-list">
            <Form>
              {list &&
                list.length &&
                list.map((answer, index) => (
                  <>
                    <Form.Group className="d-flex mb-2 align-items-center">
                      <div className="my-auto mr-12">
                        <span>{index + 1}.</span>
                      </div>
                      <Form.Control
                        id={answer.id}
                        className="mr-12"
                        defaultValue={answer.name}
                        type="text"
                        placeholder="Option 123"
                        onChange={e => hanldeRankOrderChange(e, index, type)}
                      />
                      <DragToReorderList
                        updateList={updateList}
                        items={list}
                        index={index}
                      />
                    </Form.Group>
                  </>
                ))}
            </Form>
          </ListGroup>
        )}
        {role == 'MODERATOR' && (
          <ListGroup className="quick-answer-list">
            {answers.map((answer, index) => (
              <ListGroupItem key={index}>
                <div className="fw-bold break-word text-left">
                  {answer.name}
                </div>
                <div>{answer.value}</div>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
        {role == 'PARTICIPANT' && (
          <ListGroup className="quick-answer-list">
            <Form>
              {answers.map((answer, index) => (
                <>
                  <Form.Group className="d-flex mb-2 align-items-center">
                    <div className="my-auto mr-12">
                      <span>{index + 1}.</span>
                    </div>
                    <Form.Control
                      id={answer.id}
                      className="mr-12"
                      defaultValue={answer.name}
                      type="text"
                      placeholder="Option 123"
                      onChange={e => hanldeRankOrderChange(e, index, type)}
                    />
                    <DragToReorderList
                      updateList={updateList}
                      items={list}
                      index={index}
                    />
                  </Form.Group>
                </>
              ))}
            </Form>
          </ListGroup>
        )}
        {role == 'MODERATOR' && (
          <ListGroup className="quick-answer-list">
            {answers.map((answer, index) => (
              <ListGroupItem key={index}>
                <div className="fw-bold text-left">
                  {answer.name}
                  {'  '}
                  Option 1
                </div>
                <div
                  className="text-gray-middle text-right"
                  style={{ marginLeft: '.375rem' }}
                >
                  0% rank it #1 (0)
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
        {role == 'OBSERVER' && (
          <ListGroup className="quick-answer-list">
            {answers.map((answer, index) => (
              <ListGroupItem key={index}>
                <div className="fw-bold text-left">
                  {answer.name}
                  {'  '}
                  Option 1
                </div>
                <div
                  className="text-gray-middle text-right"
                  style={{ marginLeft: '.375rem' }}
                >
                  0% rank it #1 (0)
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
      </>
    );
  }

  if (type == 2) {
    return (
      <>
        {(role === 'HOST' || role === 'ADMIN') && (
          <ListGroup className="quick-answer-list">
            {answers.map((answer, index) => (
              <ListGroupItem key={index}>
                <div className="fw-bold text-left">{answer.name}:</div>
                <div
                  className="text-gray-middle break-word text-right"
                  style={{ marginLeft: '.375rem' }}
                >
                  {answer.value}
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}

        {role == 'PARTICIPANT' && (
          <ListGroup className="quick-answer-list">
            <Form>
              {QuestionData.map((answer, index) => (
                <>
                  <Form.Check>
                    <Form.Check.Input
                      aria-label="multi_choice"
                      id="daata"
                      name="multi_choice"
                      value={answer.id}
                      onChange={e => {
                        handleCheckboxChange(e.target.value, type);
                      }}
                    />
                    <Form.Check.Label htmlFor="daata" className="w-100">
                      {answer.name}
                    </Form.Check.Label>
                  </Form.Check>
                </>
              ))}
            </Form>
          </ListGroup>
        )}
        {role == 'MODERATOR' && (
          <ListGroup className="quick-answer-list">
            {answers.map((answer, index) => (
              <ListGroupItem key={index}>
                <div className="fw-bold text-left">Lorem ipsum</div>
                <div
                  className="text-gray-middle text-right"
                  style={{ marginLeft: '.375rem' }}
                >
                  0%(0)
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
        {role == 'OBSERVER' && (
          <ListGroup className="quick-answer-list">
            {answers.map((answer, index) => (
              <ListGroupItem key={index}>
                <div className="fw-bold text-left">Lorem ipsum</div>
                <div
                  className="text-gray-middle text-right"
                  style={{ marginLeft: '.375rem' }}
                >
                  0%(0)
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
      </>
    );
  }
  if (type == 1) {
    return (
      <>
        {(role === 'HOST' || role === 'ADMIN') && (
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
        )}
        {role == 'PARTICIPANT' && (
          <ListGroup className="quick-answer-list">
            <Form>
              {QuestionData.map((answer, index) => (
                <>
                  <Form.Check>
                    <Form.Check.Input
                      id={`${answer.id}-${index}`}
                      type="radio"
                      aria-label="one_choice_answer"
                      name="one_choice"
                      onChange={e => {
                        setQuestionData({
                          response_id: [e.target.id],
                          type: type,
                        });
                      }}
                    />
                    <Form.Check.Label
                      htmlFor={`${answer.id}-${index}`}
                      className="w-100"
                    >
                      {answer.name}
                    </Form.Check.Label>
                  </Form.Check>
                </>
              ))}
            </Form>
          </ListGroup>
        )}
      </>
    );
  }
  return (
    <>
      <ListGroup className="quick-answer-list">
        <Form>
          {answers.map((answer, index) => (
            <>
              <Form.Check>
                <Form.Check.Input
                  id={`${answer.id}`}
                  type="radio"
                  aria-label="one_choice_id"
                  name="one_choice"
                  onChange={e => {
                    setQuestionData({
                      [e.target.name]: e.target.id,
                    });
                  }}
                />
                <Form.Check.Label htmlFor={`${answer.id}`} className="w-100">
                  {answer.name}
                </Form.Check.Label>
              </Form.Check>
            </>
          ))}
        </Form>
      </ListGroup>
      {role !== 'MODERATOR' && role !== 'OBSERVER' && (
        <MessageInput
          setQuestionData={setQuestionData}
          type={type}
          onSaveQuestion={onSaveQuestion}
        />
      )}
    </>
  );
};

Answers.propTypes = {
  type: PropTypes.string,
  answers: PropTypes.object,
  QuestionData: PropTypes.object,
  setQuestionData: PropTypes.object,
  onSaveQuestion: PropTypes.func,
  role: PropTypes.string,
  list: PropTypes.object,
  setList: PropTypes.object,
};

export default Answers;
