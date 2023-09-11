/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Form } from 'react-bootstrap';
import { DragToReorderList } from '../Modal/DragToReorderOption';
import downIcon from '../../../assets/images/downArrow.svg';
import { setSecureSessionData } from '../../../graphqlOperations/encryprWrapper';
import { List, AutoSizer } from 'react-virtualized';

const ParticipantQuestions = ({
  type,
  answers,
  setQuestionData,
  question_id,
  is_broadcast,
  setUpdateQue,
  updateQue,
  qAClassname,
  compKey,
  inBottom,
  setInBottom,
  scrollToBottom,
  scrollArray,
  submitted,
  updatedArray,
  left,
  top,
}) => {
  const [rangeList, setRangeList] = useState(answers || []);
  const [newMessage, setNewMessage] = useState(false);
  const [messageKey, setMessageKey] = useState(0);
  const [messageArray, setMessageArray] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({
    response_id:
      answers && answers.length
        ? answers.filter(e => e.isChecked === true).map(e => Number(e.id))
        : [],
    type,
    question_id,
  });
  const [newMessageClicked, setNewMessageClicked] = useState(false);
  const listRef = useRef(null);
  const [overscanRowCount, setOverscanRowCount] = useState(10);
  const [scrollToIndex, setScrollToIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false); // State to track manual scrolling
  const [isScrollBottom, setIsScrollBottom] = useState(false); // State to track manual scrolling
  const textMeasurementRef = useRef(null);
  const textMeasurementUserRef = useRef(null);

  useEffect(() => {
    let Ids = [];
    answers && answers.length
      ? answers
          .filter(e => e.isChecked == true)
          .map(e => Ids.push(Number(e.id)))
      : [];

    setSelectedOptions({ response_id: Ids, type, question_id });
  }, [answers]);

  useEffect(() => {
    setNewMessage(false);
    setInBottom(true);
  }, [scrollToBottom]);

  useEffect(() => {
    getDynamicStyle();
  }, []);

  const getDynamicStyle = () => {
    var qheightEle = document.getElementById(
      `question-card-title-${question_id}`,
    );
    if (qheightEle !== null) {
      const qheight = qheightEle.clientHeight;
      document.getElementById(
        `question-card-quickAns-${question_id}`,
      ).style.maxHeight = `calc(100% - ${qheight + 12}px)`;
    }
  };

  useEffect(() => {
    if (type == 4) {
      if (
        rangeList &&
        Array.isArray(rangeList) &&
        rangeList.length &&
        answers &&
        Array.isArray(answers) &&
        answers.length
      ) {
        let obj = null;
        let newData = rangeList.map(ele => {
          obj = answers.find(ans => ans.id == ele.id);
          return {
            ...ele,
            ratio: obj.ratio,
            userCount: obj.userCount,
          };
        });
        setRangeList(newData);
      }
    }
  }, [type, answers]);

  const handleCheckboxChange = (value, type) => {
    var selOptions = selectedOptions;
    if (selOptions.response_id.includes(Number(value))) {
      const index = selOptions.response_id.indexOf(Number(value));

      selOptions.response_id.splice(index, 1);

      selOptions = {
        ...selOptions,
        response_id: selOptions.response_id,
      };
    } else {
      selOptions.response_id.push(Number(value));
    }
    if (selOptions.response_id.length == 0) {
      setUpdateQue(
        updateQue.filter(
          obj => obj.question_id.toString() !== question_id.toString(),
        ),
      );
    } else {
      const data = updateQue.filter(
        obj => obj.question_id.toString() !== question_id.toString(),
      );
      setUpdateQue(updateQue => [
        ...data,
        { question_id, type, response_id: selOptions.response_id },
      ]);
    }

    setQuestionData({
      response_id: selOptions.response_id,
      type,
      question_id,
    });
    setSelectedOptions({ response_id: selOptions.response_id });
  };
  const updateList = listData => {
    setRangeList(listData);
    const rangeData = listData.map(({ id }) => Number(id));
    const data = updateQue.filter(
      obj => obj.question_id.toString() !== question_id.toString(),
    );
    setUpdateQue(updateQue => [
      ...data,
      { question_id, type, response_id: rangeData },
    ]);
    setSelectedOptions({ response_id: rangeData, question_id });
    setQuestionData({ response_id: rangeData, type, question_id });
  };

  const setMessageScrollBottom = id => {
    setNewMessageClicked(true);
    const data = scrollArray.filter(e => e != id);
    scrollArray = data;
    setSecureSessionData('newMessage', JSON.stringify(data));
    setMessageArray(data);
    setInBottom(true);
    setMessageKey(messageKey + 1);
  };

  const handleChangeAnswer = id => {
    answers = answers.map(el => {
      if (el.id === id) {
        const obj = {
          ...el,
          isChecked: true,
        };

        const data = updateQue.filter(
          obj => obj.question_id.toString() !== question_id.toString(),
        );

        setUpdateQue([
          ...data,
          {
            question_id,
            type,
            response_id: [Number(id)],
          },
        ]);
        return obj;
      }
      return el;
    });
  };

  const scrollToRow = rowIndex => {
    setMessageScrollBottom(question_id);
    setScrollToIndex(rowIndex);
    listRef.current.scrollToRow(rowIndex);
  };

  const measureTextWidth = (message, user_id) => {
    if (!textMeasurementRef.current) return 25;
    const usrDv = textMeasurementUserRef.current;
    usrDv.textContent = user_id ? `${user_id}:` : '';

    const hiddenDiv = textMeasurementRef.current;
    hiddenDiv.textContent = message && message.trim();
    const height = hiddenDiv.offsetHeight;
    return height;
  };

  const getRowHeight = index => {
    const { message, user_id } = answers[index];
    let rHieght = measureTextWidth(message, user_id);

    if (!textMeasurementRef.current) return 0;

    const usrDv = textMeasurementUserRef.current;
    usrDv.textContent = user_id ? `${user_id}:` : '';
    const hiddenDiv = textMeasurementRef.current;
    hiddenDiv.textContent = message && message.trim();
    rHieght = hiddenDiv.offsetHeight;
    hiddenDiv.textContent = '';
    return rHieght + 10; // Use a fixed height for each line (adjust as needed)
  };

  const rowRenderer = ({ index, key, style }) => {
    const { message, user_id, question_id } = answers[index];

    return (
      <div key={key} style={style}>
        <div className="fw-bold d-flex w-100">
          <div
            className="d-flex"
            style={{ minWidth: 'max-content', marginRight: '6px' }}
          >
            {user_id ? `${user_id}:` : ''}{' '}
          </div>
          <div
            style={{ whiteSpace: 'pre-wrap', paddingRight: '8px' }}
            className={`text-bismark chat_div_${question_id} content break-word`}
          >
            {message && message.includes('\n') ? (
              <>
                {message &&
                  message
                    .trim()
                    .split(/\r\n|\r|\n/)
                    .map(e => (
                      <div key={e} className="break-word">
                        {e}
                        <br />
                      </div>
                    ))}
              </>
            ) : (
              <>{message}</>
            )}
          </div>
        </div>
      </div>
      // </div>
    );
  };

  const handleScroll = ({ scrollTop, scrollHeight, clientHeight }) => {
    const isAtBottom = scrollHeight - clientHeight <= scrollTop + 1;
    if (isAtBottom) {
      setIsScrollBottom(true);
    } else if (isScrollBottom) {
      setIsScrollBottom(false);
    }
  };

  useEffect(() => {
    if (type === 3) {
      if (answers && answers.length > 0 && isScrollBottom) {
        scrollToRow(answers.length);
      }
      if (answers && answers.length > 0 && inBottom) {
        setIsScrollBottom(true);
        setInBottom(false);
        scrollToRow(answers.length);
      }
    }
  }, [answers, isScrollBottom, inBottom]);

  return type == 4 ? (
    <>
      <ListGroup
        key={question_id}
        className="quick-answer-list"
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <Form key={compKey} style={{ width: '100%' }}>
          <DragToReorderList
            updateList={updateList}
            submitted={!updatedArray.includes(question_id)}
            updatedArray={updatedArray}
            rangeList={rangeList}
            left={left}
            top={top}
          />
        </Form>
      </ListGroup>
    </>
  ) : type == 2 ? (
    <div>
      <ListGroup className="quick-answer-list">
        <Form>
          {answers.map((answer, index) => (
            <Form.Check
              key={answer.id}
              className={`participant_flex ${!updatedArray.includes(
                answer.question_id,
              ) &&
                submitted &&
                'que-opacity'}`}
            >
              <Form.Check.Input
                defaultChecked={answer.isChecked}
                id={answer.id}
                name="multi_choice"
                aria-label="multi_choice_part"
                value={answer.id}
                onChange={e => {
                  handleCheckboxChange(e.target.value, type);
                }}
              />
              <Form.Check.Label htmlFor={answer.id} className="w-100">
                {/* {answer.name} */}
                <div dangerouslySetInnerHTML={{ __html: answer.name }} />
              </Form.Check.Label>

              {is_broadcast && (
                <div className="participant_ratio">
                  {answer.ratio}% ({answer.userCount})
                </div>
              )}
            </Form.Check>
          ))}
        </Form>
      </ListGroup>
    </div>
  ) : type == 1 ? (
    <>
      <ListGroup className="quick-answer-list">
        <Form>
          {answers.map((answer, index) => (
            <Form.Check
              key={answer.id}
              className={`participant_flex ${!updatedArray.includes(
                answer.question_id,
              ) &&
                submitted &&
                'que-opacity'}`}
            >
              <Form.Check.Input
                defaultChecked={answer.isChecked}
                id={answer.id}
                type="radio"
                aria-label="one_choice_part"
                name="one_choice"
                onChange={e => {
                  handleChangeAnswer(answer.id);
                  setSelectedOptions({
                    response_id: [Number(e.target.id)],
                    question_id,
                  });

                  setQuestionData({
                    response_id: [Number(e.target.id)],
                    type: type,
                    question_id,
                  });
                }}
              />
              <Form.Check.Label htmlFor={answer.id} className="w-75 ms-1'">
                {/* {answer.name} */}
                <div dangerouslySetInnerHTML={{ __html: answer.name }} />
              </Form.Check.Label>
              {is_broadcast && (
                <div className="participant_ratio">
                  {answer.ratio}% ({answer.userCount})
                </div>
              )}
            </Form.Check>
          ))}
        </Form>
      </ListGroup>
    </>
  ) : (
    <>
      <AutoSizer>
        {({ width, height }) => (
          <>
            <div
              style={{
                position: 'absolute',
                visibility: 'hidden',
                bottom: '0px',
                right: '20px',
                left: '12px',
                width: `calc(100% - 29px)`,
              }}
            >
              <div className="fw-bold d-flex w-100">
                <div
                  ref={textMeasurementUserRef}
                  className="d-flex"
                  style={{ minWidth: 'max-content', marginRight: '6px' }}
                ></div>
                <div
                  style={{ whiteSpace: 'pre-wrap', paddingRight: '8px' }}
                  ref={textMeasurementRef}
                  className={`break-word`}
                ></div>
              </div>
            </div>
            <List
              ref={listRef}
              height={height}
              overscanRowCount={overscanRowCount}
              rowCount={answers.length}
              rowHeight={({ index }) => getRowHeight(index, width)}
              rowRenderer={rowRenderer}
              width={width + 10}
              onScroll={handleScroll}
            />
          </>
        )}
      </AutoSizer>
      <div>
        {scrollArray.includes(question_id) ? (
          <span
            className="chat__new__message_participant"
            onClick={() => scrollToRow(answers.length)}
          >
            <img src={downIcon} alt="down" />
            <strong className="m-3">New Message</strong>
          </span>
        ) : (
          ''
        )}
      </div>
    </>
  );
};

ParticipantQuestions.propTypes = {
  left: PropTypes.number,
  top: PropTypes.number,
  type: PropTypes.number,
  answers: PropTypes.array,
  QuestionData: PropTypes.array,
  setQuestionData: PropTypes.func,
  onSaveQuestion: PropTypes.func,
  question_id: PropTypes.string,
  compKey: PropTypes.number,
  is_broadcast: PropTypes.bool,
  setUpdateQue: PropTypes.func,
  updateQue: PropTypes.array,
  qAClassname: PropTypes.string,
  onZoomDrag: PropTypes.func,
  onZoomStop: PropTypes.func,
  setIsMoveable: PropTypes.func,
  inBottom: PropTypes.bool,
  setInBottom: PropTypes.func,
  scrollToBottom: PropTypes.bool,
  scrollArray: PropTypes.array,
  submitted: PropTypes.bool,
  updatedArray: PropTypes.array,
};

export default ParticipantQuestions;
