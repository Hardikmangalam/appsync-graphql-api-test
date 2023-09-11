import React from 'react';
import { Form, Button, Image } from 'react-bootstrap';
import Trash from '../../../../assets/images/trash-default.svg';
import plusIcon from '../../../../assets/images/blue/plus.svg';

export const QuestionPreview = () => (
  <div>
    <Form.Label>The question</Form.Label>
    <Form.Control type="text" placeholder="The Question" className="mb-3" />
    <Form.Group className="form-group">
      <Form.Select
        className="bg-transparent"
        // onChange={e => handleQuestionType(e.target.value)}
      >
        <option value="">select </option>
        <option value="onechoice">One choice</option>
        <option value="multichoice">Multiple Choice</option>
        <option value="quickanswer">Quick Answer</option>
        <option value="rankorder">Rank Order</option>
      </Form.Select>
    </Form.Group>
    <hr />
    <Form.Label>Answer options</Form.Label>
    <Form.Group className="d-flex mb-2 align-items-center">
      <Form.Check className="my-auto mr-12" type="radio" name="question" />
      <Form.Control
        className="mr-12"
        type="text"
        placeholder="Option"
        value="Option"
      />
      <img src={Trash} alt="trash" />
    </Form.Group>
    <Form.Group className="d-flex mb-2 align-items-center">
      <Form.Check className="my-auto mr-12" type="radio" name="question" />
      <Form.Control
        className="mr-12"
        type="text"
        placeholder="Option"
        value="Option"
      />
      <img src={Trash} alt="trash" />
    </Form.Group>

    <Button className="p-0 text-blue mt-3" aria-label="Add New Option">
      <Image src={plusIcon} alt="Add New Option" width={20} className="me-2" />
      Add New Option
    </Button>
  </div>
);
