import React, { useState } from 'react';
import { Image, Toast } from 'react-bootstrap';
import doneCircleIcon from '../assets/images/done-circle.svg';

const CustomToast = () => {
  const [toastVisisble, setToastVisible] = useState(true);
  return (
    <Toast
      className="custom-toast"
      show={toastVisisble}
      onClose={() => setToastVisible(!toastVisisble)}
    >
      <Toast.Header />
      <Toast.Body>
        <Image src={doneCircleIcon} alt="Done" />
        <div className="ms-4">
          <div className="fw-bold">Done</div>
          <div className="mt-1 text-bismark">Screen recording started</div>
        </div>
      </Toast.Body>
    </Toast>
  );
};

export default CustomToast;
