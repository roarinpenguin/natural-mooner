import React from 'react';

const NeumorphicInput = ({ value, onChange, placeholder, type = 'text', className = '', multiline = false, rows = 4 }) => {
  const baseClasses = `
    w-full bg-bg-dark/90 rounded-xl px-4 py-3 text-text-main outline-none transition-all
    shadow-neu-purple-in border border-primary/5 focus:border-primary/30 focus:shadow-neu-purple-in
    placeholder-text-muted/50
    ${className}
  `;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={baseClasses}
        rows={rows}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={baseClasses}
    />
  );
};

export default NeumorphicInput;
