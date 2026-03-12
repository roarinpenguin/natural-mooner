import React from 'react';

const NeumorphicCard = ({ children, className = '', title }) => {
  return (
    <div className={`bg-bg-panel/90 rounded-2xl p-6 shadow-neu-purple border border-primary/10 backdrop-blur-md ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold text-primary-soft mb-4 tracking-wide">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default NeumorphicCard;
