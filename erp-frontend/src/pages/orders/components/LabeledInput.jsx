import React from 'react';

/**
 * LabeledInput - Reusable component for label + input field
 * 
 * @param {string} label - Label text
 * @param {boolean} required - Whether field is required (shows red asterisk)
 * @param {string} name - Input name attribute
 * @param {string} type - Input type (text, number, date, email, etc.)
 * @param {any} value - Input value
 * @param {string} defaultValue - Default value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Whether input is disabled
 * @param {boolean} required - Whether field is required
 * @param {number} min - Minimum value (for number inputs)
 * @param {number} max - Maximum value (for number inputs)
 * @param {number|string} step - Step value (for number inputs)
 * @param {number} rows - Number of rows (for textarea)
 * @param {string} className - Additional CSS classes
 * @param {object} inputProps - Additional input props
 */
const LabeledInput = ({
  label,
  required = false,
  name,
  type = 'text',
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled = false,
  min,
  max,
  step,
  rows,
  className = '',
  inputProps = {},
  ...rest
}) => {
  const baseInputClasses = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500";
  
  const isTextarea = type === 'textarea';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {isTextarea ? (
        <textarea
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows || 3}
          required={required}
          className={`${baseInputClasses} resize-none`}
          {...inputProps}
          {...rest}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          className={baseInputClasses}
          {...inputProps}
          {...rest}
        />
      )}
    </div>
  );
};

export default LabeledInput;

