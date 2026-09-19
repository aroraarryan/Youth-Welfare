'use client';

import { useEffect, useRef, useState } from 'react';

export interface SearchableSelectOption {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (id: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

// Type-to-filter dropdown for long option lists (700+ Nyay Panchayats) where a
// plain <select> forces scrolling through an alphabetical wall of names.
export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className = '',
  inputClassName = 'border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white w-full disabled:opacity-50',
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = query
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        type="text"
        disabled={disabled}
        value={open ? query : (selected?.name ?? '')}
        placeholder={placeholder}
        onFocus={() => { setOpen(true); setQuery(''); }}
        onChange={(e) => setQuery(e.target.value)}
        className={inputClassName}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg">
          <div
            className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
            onMouseDown={() => { onChange(''); setOpen(false); setQuery(''); }}
          >
            {placeholder}
          </div>
          {filtered.map((o) => (
            <div
              key={o.id}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => { onChange(o.id); setOpen(false); setQuery(''); }}
            >
              {o.name}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-1.5 text-sm text-gray-400">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}
