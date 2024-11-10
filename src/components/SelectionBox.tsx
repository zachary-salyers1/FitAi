import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SelectionBoxProps {
  selected: boolean;
  value: string;
  label: string;
  description: string;
  onClick: () => void;
}

export function SelectionBox({ 
  selected, 
  value, 
  label, 
  description, 
  onClick 
}: SelectionBoxProps) {
  return (
    <div
      onClick={onClick}
      className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
        selected
          ? 'border-purple-600 bg-purple-50'
          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
      }`}
    >
      {selected && (
        <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-purple-600" />
      )}
      <h3 className="font-semibold text-gray-900">{label}</h3>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </div>
  );
} 