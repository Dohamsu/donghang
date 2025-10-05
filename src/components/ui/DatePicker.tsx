import React from 'react';
import ReactDatePicker from 'react-datepicker';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholderText?: string;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  minDate,
  maxDate,
  placeholderText,
  disabled = false,
  className = '',
  dateFormat = 'yyyy-MM-dd',
}) => {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      placeholderText={placeholderText}
      disabled={disabled}
      dateFormat={dateFormat}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      calendarClassName="font-sans"
      wrapperClassName="w-full"
      showPopperArrow={false}
    />
  );
};

export default DatePicker;
