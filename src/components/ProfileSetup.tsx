import React, { useState } from 'react';
import { User, Scale, Ruler, Calendar, CheckCircle2 } from 'lucide-react';

interface ProfileSetupProps {
  onProfileComplete: (profile: any) => void;
}

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { value: 'light', label: 'Lightly Active', description: '1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', description: '3-5 days/week' },
  { value: 'very', label: 'Very Active', description: '6-7 days/week' },
  { value: 'extra', label: 'Extra Active', description: 'Very active + physical job' }
];

const workoutDays = [
  { value: '2', label: '2 Days', description: 'Twice a week' },
  { value: '3', label: '3 Days', description: 'Three times a week' },
  { value: '4', label: '4 Days', description: 'Four times a week' },
  { value: '5', label: '5 Days', description: 'Five times a week' },
  { value: '6', label: '6 Days', description: 'Six times a week' }
];

export default function ProfileSetup({ onProfileComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    workoutDaysPerWeek: '',
    healthConditions: '',
    dietaryRestrictions: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleBoxSelection = (field: string, value: string) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileComplete(profile);
  };

  const SelectionBox = ({ 
    selected, 
    value, 
    label, 
    description, 
    onClick 
  }: { 
    selected: boolean; 
    value: string; 
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center mb-8">
          <User className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900 ml-3">Profile Setup</h2>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1/3 h-2 rounded-full ${
                  i <= step ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            Step {step} of 3
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleInputChange}
                  required
                  min="16"
                  max="100"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['male', 'female', 'other'].map((gender) => (
                    <SelectionBox
                      key={gender}
                      selected={profile.gender === gender}
                      value={gender}
                      label={gender.charAt(0).toUpperCase() + gender.slice(1)}
                      description=""
                      onClick={() => handleBoxSelection('gender', gender)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={profile.weight}
                  onChange={handleInputChange}
                  required
                  min="30"
                  max="300"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={profile.height}
                  onChange={handleInputChange}
                  required
                  min="100"
                  max="250"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activityLevels.map((level) => (
                    <SelectionBox
                      key={level.value}
                      selected={profile.activityLevel === level.value}
                      value={level.value}
                      label={level.label}
                      description={level.description}
                      onClick={() => handleBoxSelection('activityLevel', level.value)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Workout Days per Week
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workoutDays.map((day) => (
                    <SelectionBox
                      key={day.value}
                      selected={profile.workoutDaysPerWeek === day.value}
                      value={day.value}
                      label={day.label}
                      description={day.description}
                      onClick={() => handleBoxSelection('workoutDaysPerWeek', day.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Conditions
                </label>
                <textarea
                  name="healthConditions"
                  value={profile.healthConditions}
                  onChange={handleInputChange}
                  placeholder="List any health conditions or injuries..."
                  rows={3}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <textarea
                  name="dietaryRestrictions"
                  value={profile.dietaryRestrictions}
                  onChange={handleInputChange}
                  placeholder="List any dietary restrictions or preferences..."
                  rows={3}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ml-auto"
              >
                Complete Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}