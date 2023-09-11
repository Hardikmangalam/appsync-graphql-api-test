/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { DragToReorderList } from '../DragToReorderList';
// import Trash from '../../../../assets/images/trash-default.svg';
// import plusIcon from '../../../../assets/images/blue/plus.svg';

export const RankOrder = ({
  data,
  pagedata,
  handleOptionChange,
  from,
  // handleOptionChange,
  // erorrs,
  // payload,
  // errors,
}) => {
  const [list, setList] = useState([]);
  // const handleAdd = () => {
  //   setList([...list, `option ${list.length + 1}`]);
  // };

  useEffect(() => {
    if (list && list.length > 0) {
      setList(list);
    } else if (data && data.optionsValue && data.optionsValue.length > 0) {
      setList(data && data.optionsValue);
    }
  }, [data]);

  const updateList = listData => {
    handleOptionChange({ listData, data, pagedata });
    setList(listData);
  };

  // const handleDelete = (id) => {
  //   const newList = list.filter((item) => item.id !== id);

  //   setList(newList);
  // };
  // const onChange = (event, i) => {
  //   console.log('event, i', event, i);
  //   const { value } = event.target;
  //   console.log('value', value);
  //   list[i] = value;
  //   console.log('list', list);
  //   setList(list);
  //   // handleOptionChange({ response: list });
  //   handleOptionChange(data, pagedata, i, list);
  // };

  useEffect(() => {
    // handleOptionChange({ response: list });
    if (from === 'preview') {
      handleOptionChange(data, pagedata, list);
    }
  }, [list]);
  return (
    <div>
      {/* <hr /> */}
      <Form className="registration-options">
        <Form.Label>{data && data.label}</Form.Label>
        {list.map((item, index) => (
          <>
            <Form.Group className="d-flex mb-2">
              <DragToReorderList
                updateList={updateList}
                items={list}
                index={index}
              />
              {/* <div className="my-auto mr-12 w-20">
                <span>{item.id}.</span>
              </div> */}
              <Form.Control
                className="mr-12"
                type="text"
                value={item}
                placeholder="Option 123"
                readOnly
                // onChange={e => onChange(e, index)}
              />
              {/* <img
                src={Trash}
                alt="trash"
                className="trash_icon"
                aria-hidden="true"
              /> */}
            </Form.Group>
          </>
        ))}
        {/* <Button className="addquestioon__btn" onClick={handleAdd}>
        <Image src={plusIcon} alt="Delete" width={18} />
        <div>Add New Section</div>
      </Button> */}
      </Form>
    </div>
  );
};
