import React, { useState } from 'react';
import { X } from 'lucide-react';
import { addWorkoutToTracker } from '../lib/firestore';

interface AddPlanModalProps {
  onClose: () => void;
  onAdd: () => void;
  userId: string;
  generatedWorkouts: any[];
}

interface WorkoutDay {
  name: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
  }[];
}

export default function AddPlanModal({ onClose, onAdd, userId, generatedWorkouts }: AddPlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [planName, setPlanName] = useState('');
  const [schedule, setSchedule] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const weekdays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const toggleDay = (day: string) => {
    setSchedule(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const parseWorkoutSchedule = (plan: string): Record<string, WorkoutDay> => {
    const schedule: Record<string, WorkoutDay> = {};
    const lines = plan.split('\n');
    let currentDay: string | null = null;
    let exercises: any[] = [];

    for (const line of lines) {
      // Match day headers like "Monday: Upper Body Strength" or "Monday - Upper Body Strength"
      const dayMatch = line.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[:\s-]\s*(.*)/i);
      
      if (dayMatch) {
        // If we were processing a previous day, save it
        if (currentDay && exercises.length > 0) {
          schedule[currentDay] = {
            name: exercises[0].name.split(':')[0],
            exercises: exercises
          };
        }
        
        currentDay = dayMatch[1];
        exercises = [];
        continue;
      }

      // Parse exercises under the current day
      if (currentDay && line.trim().startsWith('- ')) {
        const exerciseText = line.replace('- ', '').trim();
        const [name, description] = exerciseText.split(':').map(s => s.trim());
        
        const repsMatch = description?.match(/(\d+)[-\s]?reps/i);
        const setsMatch = description?.match(/(\d+)[-\s]?sets/i);
        
        exercises.push({
          name,
          sets: setsMatch ? parseInt(setsMatch[1]) : 3,
          reps: repsMatch ? parseInt(repsMatch[1]) : 12,
          weight: 0,
          notes: description || ''
        });
      }
    }

    // Save the last day
    if (currentDay && exercises.length > 0) {
      schedule[currentDay] = {
        name: exercises[0].name.split(':')[0],
        exercises: exercises
      };
    }

    return schedule;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !planName) return;

    setLoading(true);
    try {
      const selectedWorkout = generatedWorkouts.find(w => w.id === selectedPlan);
      if (!selectedWorkout) return;

      const workoutSchedule = parseWorkoutSchedule(selectedWorkout.plan);
      const daysWithWorkouts = Object.keys(workoutSchedule);

      await addWorkoutToTracker(userId, {
        name: planName,
        description: selectedWorkout.preferences.goals,
        schedule: daysWithWorkouts,
        workoutsByDay: workoutSchedule,
        exercises: [], // This will be empty as exercises are now organized by day
        progress: []
      });

      onAdd();
      onClose();
    } catch (error) {
      console.error('Failed to add workout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add Plan to Track</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="e.g., Full Body Strength"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Generated Plan
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            >
              <option value="">Select a plan...</option>
              {generatedWorkouts.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.preferences.goals} ({plan.createdAt instanceof Date 
                    ? plan.createdAt.toLocaleDateString()
                    : new Date(plan.createdAt?.seconds * 1000).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {weekdays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    schedule.includes(day)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 