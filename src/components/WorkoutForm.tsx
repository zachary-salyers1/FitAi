import React, { useState } from 'react';
import { Target, Loader2, CheckCircle2, Plus, X } from 'lucide-react';

interface WorkoutFormProps {
  formData: {
    fitnessLevel: string;
    goals: string;
    timeAvailable: string;
    equipment: string;
    customEquipment?: string[];
    healthConditions?: string;
    dietaryRestrictions?: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

const fitnessLevels = [
  { value: 'beginner', label: 'Beginner', description: 'New to fitness' },
  { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise experience' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced fitness enthusiast' }
];

const timeOptions = [
  { value: '15', label: '15 Minutes', description: 'Quick workout' },
  { value: '30', label: '30 Minutes', description: 'Standard session' },
  { value: '45', label: '45 Minutes', description: 'Extended workout' },
  { value: '60', label: '60 Minutes', description: 'Full session' }
];

const equipmentOptions = [
  { value: 'minimal', label: 'Minimal', description: 'Bodyweight exercises only' },
  { value: 'basic', label: 'Basic', description: 'Dumbbells & resistance bands' },
  { value: 'full', label: 'Full Gym', description: 'Access to all equipment' }
];

export default function WorkoutForm({ formData, onSubmit, onChange, isLoading }: WorkoutFormProps) {
  const [customEquipment, setCustomEquipment] = useState<string[]>(formData.customEquipment || []);
  const [newEquipment, setNewEquipment] = useState('');

  const SelectionBox = ({ 
    selected, 
    label, 
    description, 
    onClick 
  }: { 
    selected: boolean; 
    label: string; 
    description: string; 
    onClick: () => void;
  }) => (
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
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );

  const handleBoxSelection = (field: string, value: string) => {
    const event = {
      target: {
        name: field,
        value: value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(event);
  };

  const addCustomEquipment = () => {
    if (newEquipment.trim() && !customEquipment.includes(newEquipment.trim())) {
      const updatedEquipment = [...customEquipment, newEquipment.trim()];
      setCustomEquipment(updatedEquipment);
      setNewEquipment('');
      
      const event = {
        target: {
          name: 'customEquipment',
          value: updatedEquipment
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
  };

  const removeCustomEquipment = (item: string) => {
    const updatedEquipment = customEquipment.filter(eq => eq !== item);
    setCustomEquipment(updatedEquipment);
    
    const event = {
      target: {
        name: 'customEquipment',
        value: updatedEquipment
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(event);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Fitness Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fitnessLevels.map((level) => (
            <SelectionBox
              key={level.value}
              selected={formData.fitnessLevel === level.value}
              label={level.label}
              description={level.description}
              onClick={() => handleBoxSelection('fitnessLevel', level.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Time Available
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {timeOptions.map((time) => (
            <SelectionBox
              key={time.value}
              selected={formData.timeAvailable === time.value}
              label={time.label}
              description={time.description}
              onClick={() => handleBoxSelection('timeAvailable', time.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Fitness Goals
        </label>
        <textarea
          name="goals"
          value={formData.goals}
          onChange={onChange}
          rows={3}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="E.g., Build muscle, lose weight, improve endurance..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Health Conditions
        </label>
        <textarea
          name="healthConditions"
          value={formData.healthConditions}
          onChange={onChange}
          rows={3}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="List any health conditions, injuries, or limitations..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dietary Restrictions
        </label>
        <textarea
          name="dietaryRestrictions"
          value={formData.dietaryRestrictions}
          onChange={onChange}
          rows={3}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="List any dietary restrictions or preferences..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Equipment Access
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {equipmentOptions.map((equipment) => (
            <SelectionBox
              key={equipment.value}
              selected={formData.equipment === equipment.value}
              label={equipment.label}
              description={equipment.description}
              onClick={() => handleBoxSelection('equipment', equipment.value)}
            />
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Equipment
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newEquipment}
              onChange={(e) => setNewEquipment(e.target.value)}
              placeholder="Enter equipment name..."
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={addCustomEquipment}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          {customEquipment.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customEquipment.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomEquipment(item)}
                    className="hover:text-purple-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Generating your plan...
          </>
        ) : (
          <>
            <Target className="h-5 w-5 mr-2" />
            Generate Workout Plan
          </>
        )}
      </button>
    </form>
  );
}