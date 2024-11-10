import React, { useState } from 'react';
import { User, Scale, Ruler, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile } from '../lib/firestore';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    workoutDaysPerWeek: '3',
    healthConditions: '',
    dietaryRestrictions: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBoxSelection = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('User not authenticated');
      await saveUserProfile(user.uid, formData);
      onProfileComplete(formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                  value={formData.name}
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
                  value={formData.age}
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
                      selected={formData.gender === gender}
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
                  Activity Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activityLevels.map((level) => (
                    <SelectionBox
                      key={level.value}
                      selected={formData.activityLevel === level.value}
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
                  Preferred Workout Days
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workoutDays.map((day) => (
                    <SelectionBox
                      key={day.value}
                      selected={formData.workoutDaysPerWeek === day.value}
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
                  value={formData.healthConditions}
                  onChange={handleInputChange}
                  placeholder="List any health conditions or injuries that might affect your workout (or type 'None')"
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
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  placeholder="List any dietary restrictions or preferences (or type 'None')"
                  rows={3}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 text-purple-600 hover:text-purple-700 transition-colors"
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
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ml-auto flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  'Complete Profile'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}