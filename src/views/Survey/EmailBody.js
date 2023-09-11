import React from 'react';
import { Image } from 'react-bootstrap';
import emailIcon from '../../assets/images/email.svg';
import TextContent from './TextContent';

const EmailBody = data => (
  <>
    <div className="email-body p-3">
      <div className="email-body__header">
        <Image src={emailIcon} alt="Email" width={24} className="me-1" />
        <div className="fs-18 fw-bold ms-2">Send Email Action</div>
      </div>
      <div className="email-body__content">
        <ul>
          <li>
            <TextContent data={data.data.textInstructions} />
          </li>
          {/* <li>To: [{data.data.to}]</li> */}
          <li>From: {data.data.fromName}</li>
          <li>Subject: {data.data.subject}</li>
        </ul>
      </div>
    </div>
  </>
);

export default EmailBody;
