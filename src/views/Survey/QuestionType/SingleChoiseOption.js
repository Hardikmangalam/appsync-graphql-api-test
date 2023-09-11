/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import 'moment-timezone';

const SingleChoiseOption = ({
  data,
  pagedata,
  handleOptionChange,
  onChange,
  from,
  erorrs,
  payload,
  errors,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

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
      if (data.questionType === 'meeting_dates' && option) {
        const optionValue =
          option && option.not_available
            ? option.not_available
            : `${moment(option.start_date_time).format('L')}${', '}${moment(
                option.start_date_time,
              ).format('LT')}${'-'}${moment(option.end_date_time).format(
                'LT',
              )} ${moment.tz.zone(timeZone).abbr(timeZoneOffset)}`;

        handleOptionChange(data, pagedata, index, option.id, optionValue);
      } else {
        handleOptionChange(data, pagedata, index);
      }
    }
  };

  const timeZone = moment.tz.guess();
  const time = new Date();
  const timeZoneOffset = time.getTimezoneOffset();
  return (
    <div key={data.page_id}>
      <Form className="registration-options">
        <Form.Label>
          {data.label} {data.isRequire && '*'}
        </Form.Label>
        {data.optionsValue &&
          data.optionsValue.length > 0 &&
          data.optionsValue.map((option, index) => (
            <Form.Check
              key={data.id}
              className={
                from === 'logic' && classNames({ 'is-invalid': errors })
              }
            >
              {data &&
              data.questionType === 'meeting_dates' &&
              option.not_available ? (
                <Form.Check.Input
                  id={`${from}-not_available`}
                  type="radio"
                  name="not_available"
                  aria-label={`${from}-not_available`}
                  checked={
                    data.is_checked &&
                    data.is_checked.includes(index.toString())
                  }
                  onChange={e => handleOnChange(e, index, option)}
                />
              ) : (
                <>
                  <Form.Check.Input
                    id={`${from}-${data.id}-${index}`}
                    type="radio"
                    name={`input_${data.page_id}_${data.id}`}
                    aria-label={`${from}-${data.id}-${index}`}
                    checked={
                      from === 'logic'
                        ? selectedOptions &&
                          selectedOptions.includes(index.toString())
                        : data.is_checked &&
                          data.is_checked.includes(index.toString())
                    }
                    onChange={e => handleOnChange(e, index, option)}
                  />
                </>
              )}

              {data && data.questionType === 'meeting_dates' ? (
                <Form.Check.Label
                  htmlFor={`${
                    option.not_available
                      ? `${from}-not_available`
                      : `${from}-${data.id}-${index}`
                  }`}
                  className="w-100"
                >
                  {option.not_available
                    ? option.not_available
                    : `${moment(option.start_date_time).format(
                        'L',
                      )}${', '}${moment(option.start_date_time).format(
                        'LT',
                      )}${'-'}${moment(option.end_date_time).format(
                        'LT',
                      )} ${moment.tz.zone(timeZone).abbr(timeZoneOffset)}
                    `}
                </Form.Check.Label>
              ) : (
                <Form.Check.Label
                  htmlFor={`${from}-${data.id}-${index}`}
                  className="w-100"
                >
                  {option}
                </Form.Check.Label>
              )}
            </Form.Check>
          ))}
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
    </div>
  );
};

SingleChoiseOption.propTypes = {
  data: PropTypes.object,
  pagedata: PropTypes.object,
  handleOptionChange: PropTypes.func,
  onChange: PropTypes.func,
  from: PropTypes.string,
  erorrs: PropTypes.object,
  payload: PropTypes.object,
  errors: PropTypes.object,
};

export default SingleChoiseOption;
