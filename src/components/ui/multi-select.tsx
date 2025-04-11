// src/components/ui/multi-select.tsx
import { useState } from 'react';
import { Badge } from './badge';
import { Input } from './input';
import { X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  className = ''
}: MultiSelectProps) {
  const [inputValue, setInputValue] = useState('');

  const selectOption = (option: string) => {
    onChange([...selected, option]);
    setInputValue('');
  };

  const removeOption = (option: string) => {
    onChange(selected.filter(item => item !== option));
  };

  const filteredOptions = options.filter(
    option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selected.includes(option.value)
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-1">
        {selected.map(option => {
          const optionLabel = options.find(o => o.value === option)?.label || option;
          return (
            <Badge key={option} variant="secondary" className="flex items-center gap-1">
              {optionLabel}
              <button
                type="button"
                onClick={() => removeOption(option)}
                className="rounded-full hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
      />
      {inputValue && filteredOptions.length > 0 && (
        <div className="border rounded-md mt-1 max-h-60 overflow-auto">
          {filteredOptions.map(option => (
            <div
              key={option.value}
              className="p-2 hover:bg-muted cursor-pointer"
              onClick={() => selectOption(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}