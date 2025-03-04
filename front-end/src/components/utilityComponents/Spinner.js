import React from 'react';
import { MutatingDots } from 'react-loader-spinner';

export default function Spinner() {
  const wrapperStyle = {
    position: 'fixed',
    top: '10%',
    left: '50%',
    margin: '-50px 0 0 -50px',
  };

  return (
    <MutatingDots
      visible={true}
      height="100"
      width="100"
      color="#4fa94d"
      secondaryColor="#4fa94d"
      radius="12.5"
      ariaLabel="mutating-dots-loading"
      wrapperStyle={wrapperStyle}
      wrapperClass=""
    />
  );
}
