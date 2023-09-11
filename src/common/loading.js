import React from 'react';
import { Image, ProgressBar } from 'react-bootstrap';
import logo from '../assets/images/logo.svg';

const Loading = () => (
  <div className="loading">
    <Image src={logo} alt="Logo" />
    <div className="custom-progressbar">
      <ProgressBar now={25} />
    </div>
  </div>
);
export default Loading;
