import React from 'react';

const NeumorphicButton = ({ children, onClick, active, className = '', icon: Icon, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
        ${active 
          ? 'shadow-neu-purple-in text-primary-soft bg-bg-elevated/80' 
          : 'shadow-neu-purple text-text-muted hover:text-text-main hover:-translate-y-0.5 bg-bg-panel/80'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed hover:transform-none' : 'active:shadow-neu-purple-in active:translate-y-0'}
        ${className}
      `}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export default NeumorphicButton;
