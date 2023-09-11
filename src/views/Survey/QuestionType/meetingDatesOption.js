/* eslint-disable no-prototype-builtins */
/* eslint-disable array-callback-return */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/prop-types */
/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import 'moment-timezone';
import { getTimeZoneFormat } from '../common/timezone';
// import classNames from 'classnames';

const MeetingDatesOption = ({
  data,
  from,
  onChange,
  payload,
  handleOptionChange,
  pagedata,
  erorrs,
  errors,
  setMeetingDateId,
  setMeetingId,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [dataAvailable, setDataAvailable] = useState({});
  const count = 0;

  useEffect(() => {
    if (data && data.length > 0) {
      setDataAvailable(data[data && data.length - 1]);
    }
  }, [data]);

  useEffect(() => {
    if (payload && payload.length > 0) {
      setSelectedOptions(payload);
      onChange({ contentOptions: payload });
    }
  }, [payload]);

  const handleOnChange = (e, index, option) => {
    if (from === 'logic') {
      onChange({ contentOptions: [index.toString()] });
      if (e.target.checked) {
        setSelectedOptions([index.toString()]);
      }
    }
    if (from === 'preview') {
      if (
        data.questionType !== 'free_input' &&
        data.questionType === 'meeting_dates' &&
        option
      ) {
        let optionValue;
        setMeetingDateId(option && option.id);
        setMeetingId(option && option.id);
        if (option && option.not_available) {
          optionValue = option.not_available;
        } else if (option && option.start_date_time) {
          optionValue = `${option && option.start_date_time},${option &&
            option.end_date_time}`;
          // optionValue = `${getTimeZoneFormat(
          //   option && option.start_date_time,
          //   option && option.end_date_time,
          // ).trim()}`;
        } else {
          optionValue = option;
        }
        handleOptionChange(data, pagedata, index, option.id, optionValue);
      } else {
        handleOptionChange(data, pagedata, index);
      }
    }
  };
  return (
    <>
      <Form className="registration-options">
        <Form.Label>
          {data && data.label} {data && data.isRequire && '*'}
        </Form.Label>
        {from === 'logic' ? (
          <Form.Check>
            <Form.Check.Input
              id={`${from}-not_available`}
              type="radio"
              aria-label={dataAvailable && dataAvailable.not_available}
              name="meeting_dates"
              checked={
                from === 'logic' &&
                selectedOptions &&
                selectedOptions[0] &&
                selectedOptions[0].toString()
              }
              onChange={e =>
                handleOnChange(e, dataAvailable && dataAvailable.id)
              }
            />
            <Form.Check.Label
              htmlFor={`${dataAvailable &&
                dataAvailable.not_available &&
                `${from}-not_available`}`}
              className="w-100"
            >
              {dataAvailable && dataAvailable.not_available}
            </Form.Check.Label>
          </Form.Check>
        ) : (
          <>
            {data &&
              data.updatedOptionValue &&
              data.updatedOptionValue.length > 0 &&
              data.updatedOptionValue.map((option, index) => {
                const obj =
                  (data &&
                    data.meetingDateCustom &&
                    data.meetingDateCustom.length > 0 &&
                    data.meetingDateCustom.find(ele => {
                      ele && ele.id === option && option.id && ele.id !== 0;
                    })) ||
                  {};
                return (
                  <>
                    {(obj.hasOwnProperty('text') ||
                      (option && option.start_date_time !== undefined) ||
                      (option && option.end_date_time !== undefined)) && (
                      <Form.Check>
                        <Form.Check.Input
                          id={`m-${option.id}-${index}`}
                          type="radio"
                          name="meeting_dates"
                          aria-label="meeting_dates"
                          checked={
                            option.is_checked &&
                            option.is_checked.includes(index.toString())
                          }
                          onChange={e => {
                            handleOnChange(e, index, option);
                          }}
                        />
                        <Form.Check.Label
                          htmlFor={`m-${option.id}-${index}`}
                          className="w-100 d-flex"
                        >
                          <span>
                            <b>
                              {option && option.displayMsg
                                ? `${option.displayMsg} `
                                : ''}
                            </b>
                            {getTimeZoneFormat(
                              option && option.start_date_time,
                              option && option.end_date_time,
                            )}{' '}
                          </span>
                        </Form.Check.Label>
                      </Form.Check>
                    )}
                    {typeof option !== 'object' && (
                      <Form.Check>
                        <Form.Check.Input
                          id={`check-${from}-${data.id}-${index}`}
                          type="radio"
                          name="meeting_dates"
                          aria-label={option}
                          checked={
                            data.is_checked &&
                            data.is_checked.includes(index.toString())
                          }
                          onChange={e => handleOnChange(e, index, option)}
                        />
                        <Form.Check.Label
                          htmlFor={`check-${from}-${data.id}-${index}`}
                          className="w-100 dfdf"
                        >
                          {option}
                        </Form.Check.Label>
                      </Form.Check>
                    )}
                  </>
                );
              })}

            {data &&
              data.updatedOptionValue &&
              data.updatedOptionValue.length > 0 &&
              data.updatedOptionValue.map((option, index) => {
                const obj1 =
                  (data &&
                    data.meetingDateCustom &&
                    data.meetingDateCustom.length > 0 &&
                    data.meetingDateCustom.find(ele => ele.id === 0)) ||
                  {};
                return (
                  <>
                    {obj1.hasOwnProperty('text') && count === index && (
                      <Form.Check>
                        <Form.Check.Input
                          id={`m-${obj1.id}-${index}`}
                          type="radio"
                          name="meeting_dates"
                          aria-label={obj1.text}
                          checked={
                            obj1.is_checked &&
                            obj1.is_checked.includes(index.toString())
                          }
                          onChange={e => handleOnChange(e, index, obj1)}
                        />
                        <Form.Check.Label
                          htmlFor={`m-${obj1.id}-${index}`}
                          className="w-100"
                        >
                          <span>{obj1.text}</span>
                        </Form.Check.Label>
                      </Form.Check>
                    )}
                  </>
                );
              })}
          </>
        )}
        {from === 'logic' && errors && errors.options && (
          <Form.Control.Feedback type="invalid" className="is-invalid-text">
            {errors.options}
          </Form.Control.Feedback>
        )}
        {data && data.has_error && erorrs && (
          <Form.Control.Feedback type="invalid" className="is-invalid-text">
            {erorrs && erorrs.options}
          </Form.Control.Feedback>
        )}
      </Form>
    </>
  );
};

MeetingDatesOption.propTypes = {
  data: PropTypes.object,
  from: PropTypes.string,
  onChange: PropTypes.func,
  payload: PropTypes.object,
  errors: PropTypes.object,
  setMeetingId: PropTypes.func,
};

export default MeetingDatesOption;
