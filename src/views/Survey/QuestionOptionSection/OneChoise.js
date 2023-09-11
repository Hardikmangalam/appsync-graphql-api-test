import React, { useState } from 'react';
import { Form, Button, Image } from 'react-bootstrap';
import Trash from '../../../../assets/images/trash-default.svg';
import plusIcon from '../../../../assets/images/blue/plus.svg';

import { DragToReorderList } from '../DragToReorderList';

export const OneChoise = ({ handleChange }) => {
  const [list, setList] = useState([]);
  const updateList = listData => {
    setList(listData);
  };

  const handleAdd = () => {
    setList([...list, `option ${list.length + 1}`]);
  };

  // const handleDelete = (id) => {
  //   const newList = list.filter((item) => item.id !== id);

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
              type="radio"
              name="question"
            />
            <Form.Control
              className="mr-12"
              type="text"
              placeholder="Option"
              onChange={e => onChange(e, index)}
            />
            <img
              src={Trash}
              alt="trash"
              className="trash_icon"
              // aria-hidden="true"
            />
          </Form.Group>
        </>
      ))}

      <Button
        className="addquestioon__btn"
        onClick={handleAdd}
        aria-label="Add New One"
      >
        <Image src={plusIcon} alt="Delete" width={18} />
        <div>Add New Section</div>
      </Button>
    </div>
  );
};
