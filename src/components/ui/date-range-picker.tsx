import React, { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}

const presetOptions = [
  { label: 'All time', value: 'all' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
];

export function DateRangePicker({ value, onChange, placeholder = "Select date range" }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(value);
  const [preset, setPreset] = useState('all'); // Initialize with 'all'

  const handleSelect = (selectedRange: DateRange | undefined) => {
    // Only allow selection if not in 'all' preset mode
    if (preset !== 'all') {
      setRange(selectedRange);
      setPreset('custom');
    }
  };

  const handlePresetChange = (presetValue: string) => {
    setPreset(presetValue);
    if (presetValue === 'all') {
      setRange(undefined);
    } else {
      const days = parseInt(presetValue);
      const endDate = endOfDay(new Date());
      const startDate = startOfDay(subDays(endDate, days - 1));
      setRange({ from: startDate, to: endDate });
    }
  };

  const handleApply = () => {
    onChange(range);
    setIsOpen(false);
  };

  const handleClear = () => {
    setRange(undefined);
    setPreset('all');
    onChange(undefined);
    setIsOpen(false);
  };

  const formatRange = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from) return placeholder;
    if (!dateRange.to) return format(dateRange.from, 'MMM dd, yyyy');
    return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg font-paragraph hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-secondary" />
          <span className={value?.from ? 'text-foreground' : 'text-secondary'}>
            {formatRange(value)}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl" style={{ width: '320px' }}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-lg text-foreground">Select Date Range</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Preset Options */}
            <div className="mb-4">
              <Select value={preset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {presetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Calendar */}
            <div className={preset === 'all' ? 'opacity-50 pointer-events-none' : ''}>
              <DayPicker
                mode="range"
                selected={range}
                onSelect={handleSelect}
                numberOfMonths={1}
                className="font-paragraph"
                modifiersStyles={{
                  selected: {
                    backgroundColor: '#374151',
                    color: 'white',
                  },
                  range_start: {
                    backgroundColor: '#374151',
                    color: 'white',
                  },
                  range_end: {
                    backgroundColor: '#374151',
                    color: 'white',
                  },
                  range_middle: {
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                  },
                }}
              />
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleClear}
                className="px-4 py-2"
              >
                Clear
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  className="bg-primary text-white hover:bg-primary/90 px-4 py-2"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}