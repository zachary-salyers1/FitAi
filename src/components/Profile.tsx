import React, { useState, useEffect } from 'react';
import { User, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, saveUserProfile } from '../lib/firestore';
import { SelectionBox } from './SelectionBox';

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

export default function Profile({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
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

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      await saveUserProfile(user.uid, profile);
      onClose();
    } catch (err: any) {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900 ml-3">Your Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
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
              Preferred Workout Days
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Conditions
            </label>
            <textarea
              name="healthConditions"
              value={profile.healthConditions}
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
              value={profile.dietaryRestrictions}
              onChange={handleInputChange}
              placeholder="List any dietary restrictions or preferences (or type 'None')"
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 