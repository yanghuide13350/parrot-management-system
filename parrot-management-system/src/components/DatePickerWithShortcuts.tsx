import React from 'react';
import { DatePicker, Space, Button } from 'antd';
import type { DatePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';

interface DatePickerWithShortcutsProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  value?: dayjs.Dayjs | null;
  onChange?: (date: dayjs.Dayjs | null, dateString: string) => void;
}

const DatePickerWithShortcuts: React.FC<DatePickerWithShortcutsProps> = ({
  value,
  onChange,
  ...props
}) => {
  const handleShortcutClick = (months: number) => {
    const date = dayjs().subtract(months, 'months');
    onChange?.(date, date.format('YYYY-MM-DD'));
  };

  const handleTodayClick = () => {
    const date = dayjs();
    onChange?.(date, date.format('YYYY-MM-DD'));
  };

  const handleDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    if (onChange) {
      onChange(date, Array.isArray(dateString) ? dateString[0] : dateString);
    }
  };

  // 禁用未来日期
  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  return (
    <div>
      <DatePicker
        {...props}
        value={value}
        onChange={handleDateChange}
        disabledDate={disabledDate}
        style={{ width: '100%' }}
      />
      <div style={{ marginTop: 8 }}>
        <Space size="small" wrap>
          <Button size="small" onClick={handleTodayClick}>
            今天
          </Button>
          <Button size="small" onClick={() => handleShortcutClick(1)}>
            1个月
          </Button>
          <Button size="small" onClick={() => handleShortcutClick(2)}>
            2个月
          </Button>
          <Button size="small" onClick={() => handleShortcutClick(3)}>
            3个月
          </Button>
          <Button size="small" onClick={() => handleShortcutClick(6)}>
            6个月
          </Button>
          <Button size="small" onClick={() => handleShortcutClick(12)}>
            1年
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default DatePickerWithShortcuts;