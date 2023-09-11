/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Form, ListGroup, Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { OneChoise } from './QuestionOptionSection/OneChoise';
import { MultiChoise } from './QuestionOptionSection/MultiChoise';
import { RankOrder } from './QuestionOptionSection/RankOrder';
import tickIcon from '../../../assets/images/blue/check.svg';
import AddNoteModal from '../Dashboard/AddNoteModal';

export const AddQuestion = ({ setEditQuestionModal }) => (
  <div>
    <Form.Check>
      <Form.Check.Input
        onChange={() => setEditQuestionModal(1)}
        name="question"
        aria-label="One Choice"
        id="checkbox-audio-1"
        type="radio"
      />
      <Form.Check.Label htmlFor="checkbox-audio-1">One Choice</Form.Check.Label>
    </Form.Check>
    <Form.Check>
      <Form.Check.Input
        onChange={() => setEditQuestionModal(2)}
        name="question"
        aria-label="Multiple Choice"
        id="checkbox-audio-2"
        type="radio"
      />
      <Form.Check.Label htmlFor="checkbox-audio-2">
        Multiple Choice
      </Form.Check.Label>
    </Form.Check>
    <Form.Check>
      <Form.Check.Input
        onChange={() => setEditQuestionModal(3)}
        name="question"
        aria-label="Quick Answer"
        id="checkbox-audio-3"
        type="radio"
      />
      <Form.Check.Label htmlFor="checkbox-audio-3">
        Quick Answer
      </Form.Check.Label>
    </Form.Check>
    <Form.Check>
      <Form.Check.Input
        onChange={() => setEditQuestionModal(4)}
        name="question"
        aria-label="Rank Order"
        id="checkbox-audio-4"
        type="radio"
      />
      <Form.Check.Label htmlFor="checkbox-audio-4">Rank Order</Form.Check.Label>
    </Form.Check>
  </div>
);

AddQuestion.propTypes = {
  setEditQuestionModal: PropTypes.func,
};

export const AddQuestionDetail = ({
  questionType,
  handleChange,
  questionLabel,
  isEdit,
  questions,
  setEditContent,
  editContent,
  setEditQuestionModal,
}) => {
  const [queType, setQueType] = useState('');
  const [questionTitleError, setQuestionTitleError] = useState(false);
  const handleQuestionType = type => {
    setQueType(type);
  };

  useEffect(() => {
    if (questionType) {
      handleChange({ type: questionType });
      setQueType(questionType);
    }
  }, [questionType]);

  useEffect(() => {
    if (isEdit) {
      setEditContent(questionLabel);
    }
  }, []);

  const onChange = e => {
    const { value } = e.target;
    handleChange({ label: value });
  };

  const handleEditorChange = data => {
    if (data === '') {
      setQuestionTitleError(true);
    } else {
      handleChange({ label: data });
      setQuestionTitleError(false);
      setEditContent(data);
    }
  };
  return (
    <Form>
      <Form.Label>The question</Form.Label>
      <div style={{ marginBottom: '15px' }}>
        <AddNoteModal
          isEdit={isEdit}
          onChange={handleEditorChange}
          setEditContent={setEditContent}
          value={questionLabel || editContent}
          questionLabelKey={questionType}
        />
        {questionTitleError && (
          <span className="is-invalid-text mt-2" style={{ color: 'red' }}>
            Please Enter Any Text
          </span>
        )}
      </div>
      <>
        {!isEdit && (
          <Form.Group className="form-group">
            <Form.Select
              className="bg-transparent"
              name="type"
              onChange={e => {
                setEditContent('');
                setEditQuestionModal(Number(e.target.value));
                handleQuestionType(e.target.value);
                onChange(e);
              }}
              value={queType}
            >
              <option value="">select </option>
              <option value="1">One choice</option>
              <option value="2">Multiple Choice</option>
              <option value="3">Quick Answer</option>
              <option value="4">Rank Order</option>
            </Form.Select>
          </Form.Group>
        )}
        {queType == '1' ? (
          <OneChoise
            questions={questions}
            questionType={questionType}
            isEdit={isEdit}
            handleChange={handleChange}
            setEditContent={setEditContent}
          />
        ) : queType == '2' ? (
          <MultiChoise
            questions={questions}
            questionType={questionType}
            isEdit={isEdit}
            setEditContent={setEditContent}
            handleChange={handleChange}
          />
        ) : queType == '4' ? (
          <RankOrder
            questions={questions}
            questionType={questionType}
            isEdit={isEdit}
            setEditContent={setEditContent}
            handleChange={handleChange}
          />
        ) : (
          ''
        )}
      </>
    </Form>
  );
};
AddQuestionDetail.propTypes = {
  questionType: PropTypes.number,
  handleChange: PropTypes.func,
  editContent: PropTypes.string,
  setEditContent: PropTypes.func,
  setEditQuestionModal: PropTypes.func,
  questionLabel: PropTypes.string,
  isEdit: PropTypes.bool,
  questions: PropTypes.array,
};

export const SelectQuestionTemplateModal = ({ list, changeQueBank }) => {
  const [activeTemplate, setActiveTemplate] = useState(list[0] || {});

  useEffect(() => {
    changeQueBank(activeTemplate);
  }, [activeTemplate]);

  return (
    <>
      <ListGroup className="select-template-list">
        {list &&
          list.map((obj, index) => (
            <ListGroup.Item
              key={index}
              onClick={() => setActiveTemplate(obj)}
              className={classNames({
                'text-blue': activeTemplate.id == obj.id,
              })}
            >
              {obj.label}{' '}
              {activeTemplate == index && (
                <Image
                  className="ms-auto"
                  src={tickIcon}
                  width={24}
                  height={24}
                  alt="tick-icon"
                />
              )}
            </ListGroup.Item>
          ))}
      </ListGroup>
    </>
  );
};

SelectQuestionTemplateModal.propTypes = {
  list: PropTypes.func,
  changeQueBank: PropTypes.func,
};
