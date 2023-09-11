import React, { useEffect } from 'react';
import constant from '../../enum/constant';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';

const { API_URL } = constant;
const InviteICS = () => {
  const { id } = useParams();
  useEffect(() => {
    if (id && id !== '') {
      const anchor = document.createElement('a');
      anchor.href = `${API_URL}/surveyAnswers/invite?meetingId=${id}`;
      // anchor.download = 'your-file-name.pdf'; // Specify the suggested filename
      anchor.addEventListener('click', () => {
        setTimeout(function() {
          window.close();
        }, 2000);
      });

      anchor.click();
    }
  }, [id]);

  return <></>;
};

export default InviteICS;
