/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Form, Button, Image } from 'react-bootstrap';
import { DragToReorderList } from '../DragToReorderList';
import Trash from '../../../../assets/images/trash-default.svg';
import plusIcon from '../../../../assets/images/blue/plus.svg';

export const MultiChoise = ({ handleChange }) => {
  const [list, setList] = useState([]);

  const handleAdd = () => {
    setList([...list, `Option ${list.length + 1}`]);
  };
  const updateList = (listData) => {
    setList(listData);
  };

  // const handleDelete = id => {
  //   const newList = list.filter(item => item.id !== id);

  //   setList(newList);
  // };
  const onChange = (event, i) => {
    const { value } = event.target;
    list[i] = value;

    setList(list);
    handleChange({ response: list });
  };

  return (
    <div>
      <hr />
      <Form.Label>Answer options</Form.Label>
      {list.map((item, index) => (
        <>
          <Form.Group className="d-flex mb-2">
            <DragToReorderList
              updateList={updateList}
              items={list}
              index={index}
            />
            <Form.Check
              className="my-auto mr-12"
              type="checkbox"
              name="question"
            />
            <Form.Control
              className="mr-12"
              type="text"
              placeholder="Option"
              onChange={(e) => onChange(e, index)}
            />
            <img src={Trash} alt="trash" className="trash_icon" />
          </Form.Group>
          {/* <Form.Group className="d-flex mb-2">
            <Form.Check
              className="my-auto mr-12"
              type="checkbox"
              name="question"
            />
            <Form.Control
              className="mr-12"
              type="text"
              placeholder="Option 123"
              value="Option 123"
            />
            <img
              src={Trash}
              aria-hidden="true"
              alt="trash"
              className="trash_icon"
              onClick={() => handleDelete(item.id)}
            />
          </Form.Group> */}
        </>
      ))}
      <Button className="addquestioon__btn" onClick={handleAdd} aria-label='Add New Section'>
        <Image src={plusIcon} alt="Delete" width={18} />
        <div>Add New Section</div>
      </Button>
    </div>
  );
};
