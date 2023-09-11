/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import downIcon from '../../../assets/images/downArrow.svg';
import { setSecureSessionData } from '../../../graphqlOperations/encryprWrapper';
import { AutoSizer, List } from 'react-virtualized';
let scrollView = '';

const ObserverQuestions = ({
  type,
  answers,
  setQuestionData,
  QuestionData,
  onSaveQuestion,
  qAClassname,
  inBottom,
  setInBottom,
  setScrollTopHeight,
  setScrollHeight,
  setNewScrollHeight,
  scrollToBottom,
  scrollArray,
  question_id,
}) => {
  const [newMessageClicked, setNewMessageClicked] = useState(false);
  const [messageKey, setMessageKey] = useState(0);
  const [messageArray, setMessageArray] = useState([]);
  const [overscanRowCount, setOverscanRowCount] = useState(10);
  const [isScrollBottom, setIsScrollBottom] = useState(false); // State to track manual scrolling
  const textMeasurementRef = useRef(null);
  const textMeasurementUserRef = useRef(null);
  const [scrollToIndex, setScrollToIndex] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
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
      ).style.maxHeight = `calc(100% - ${qheight}px)`;
    }
  };

  useEffect(() => {
    if (!newMessageClicked) {
      if (inBottom) {
        if (!qAClassname) {
          return;
        }

        const chatElement = document.querySelector(
          `#${qAClassname + question_id}`,
        );
        if (chatElement) {
          chatElement.scrollTop = chatElement.scrollHeight;
          setScrollTopHeight(chatElement.scrollTop);
          setScrollHeight(chatElement.scrollHeight);
        }
      } else {
        if (!qAClassname) {
          return;
        }
        setNewScrollHeight(
          document.querySelector(`#${qAClassname + question_id}`).scrollHeight,
        );
      }
    }
  }, [newMessageClicked]);

  const setMessageScrollBottom = id => {
    setNewMessageClicked(true);
    const data = scrollArray.filter(e => e != id);
    scrollArray = data;
    setSecureSessionData('newMessage', JSON.stringify(data));
    setMessageArray(data);
    setInBottom(true);
    scrollView = id;
    document.querySelector(
      `#${qAClassname + id}`,
    ).scrollTop = document.querySelector(`#${qAClassname + id}`).scrollHeight;
    setMessageKey(messageKey + 1);
  };

  const scrollToRow = rowIndex => {
    setMessageScrollBottom(question_id);
    setScrollToIndex(rowIndex);
    listRef.current.scrollToRow(rowIndex);
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

  const handleScroll = ({ scrollTop, scrollHeight, clientHeight }) => {
    const isAtBottom = scrollHeight - clientHeight <= scrollTop + 1;
    if (isAtBottom) {
      setIsScrollBottom(true);
    } else if (isScrollBottom) {
      setIsScrollBottom(false);
    }
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

  if (type === 4) {
    return (
      <>
        <ListGroup className="quick-answer-list">
          {answers.map((answer, index) => (
            <ListGroupItem key={index}>
              <div className="d-flex flex-grow-1 w-100">
                <span className="text-gray-middle">{index + 1}.</span>
                <span
                  className="break-word w-80"
                  style={{ marginLeft: '.75rem' }}
                  aria-label="Observer-Option"
                >
                  {/* {answer.name} */}
                  <div dangerouslySetInnerHTML={{ __html: answer.name }} />
                </span>
              </div>
              <div className="text-right text-nowrap">
                {answer.ratio}% ({answer.userCount || 0})
              </div>
              <div>{answer.value}</div>
              {/* <div>
                {answer.ratio}% ({answer.userCount})
              </div> */}
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
              <div
                className="d-flex break-word flex-grow-1 w-75"
                style={{ marginRight: '1rem' }}
              >
                {/* {answer.name} */}
                <div dangerouslySetInnerHTML={{ __html: answer.name }} />
              </div>
              <div>
                <span className="text-nowrap text-right">
                  {answer.ratio}% ({answer.userCount || 0})
                </span>
              </div>
              <div>{answer.value}</div>
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
              <div
                className="d-flex break-word flex-grow-1 w-75"
                style={{ marginRight: '1rem' }}
              >
                {/* {answer.name}{' '} */}
                <div dangerouslySetInnerHTML={{ __html: answer.name }} />
              </div>
              <div className="text-nowrap text-right">
                {answer.ratio}% ({answer.userCount || 0})
              </div>
              <div>{answer.value}</div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </>
    );
  } else {
    return (
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
        <div key={messageKey}>
          {scrollArray.includes(question_id) ? (
            <span
              className="chat__new__message_observer"
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
  }
};

ObserverQuestions.propTypes = {
  type: PropTypes.string,
  answers: PropTypes.array,
  QuestionData: PropTypes.object,
  setQuestionData: PropTypes.object,
  onSaveQuestion: PropTypes.func,
  qAClassname: PropTypes.string,
  inBottom: PropTypes.bool,
  setInBottom: PropTypes.func,
  setScrollTopHeight: PropTypes.func,
  setScrollHeight: PropTypes.func,
  setNewScrollHeight: PropTypes.func,
  scrollToBottom: PropTypes.bool,
  question_id: PropTypes.string,
  scrollArray: PropTypes.array,
};

export default ObserverQuestions;
