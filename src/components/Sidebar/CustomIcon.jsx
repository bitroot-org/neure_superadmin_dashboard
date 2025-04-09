import React from 'react';

const CustomIcon = ({ icon: Icon }) => {
  return (
    <div className="sidebar-icon-wrapper" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      color: 'white',
      position: 'relative',
      zIndex: 10
    }}>
      <Icon style={{
        fontSize: '24px',
        color: 'white',
        fill: 'white',
        stroke: 'white',
        strokeWidth: '0',
        display: 'block',
        visibility: 'visible',
        opacity: 1
      }} />
    </div>
  );
};

export default CustomIcon;
