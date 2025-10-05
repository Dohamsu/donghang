import React from 'react';
import ReactDatePicker from 'react-datepicker';

interface TimePickerProps {
  value: string; // HH:mm 형식
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minTime?: Date;
  maxTime?: Date;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = '시간 선택',
  disabled = false,
  className = '',
  minTime,
  maxTime,
}) => {
  // HH:mm 문자열을 Date 객체로 변환
  const timeToDate = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Date 객체를 HH:mm 문자열로 변환
  const dateToTime = (date: Date | null): string => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const selectedDate = timeToDate(value);

  const handleChange = (date: Date | null) => {
    onChange(dateToTime(date));
  };

  return (
    <ReactDatePicker
      selected={selectedDate}
      onChange={handleChange}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption="시간"
      dateFormat="HH:mm"
      placeholderText={placeholder}
      disabled={disabled}
      minTime={minTime}
      maxTime={maxTime}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      calendarClassName="font-sans"
      wrapperClassName="w-full"
      showPopperArrow={false}
    />
  );
};

export default TimePicker;
