import React, { useState, useEffect } from 'react';
import { Plus, Calendar, BarChart, Trash2, Edit2, Dumbbell, CheckCircle } from 'lucide-react';
import { getActiveWorkouts, addWorkoutToTracker, getRecentWorkouts, updateWorkoutProgress } from '../lib/firestore';
import AddPlanModal from './AddPlanModal';
import { format, startOfWeek, addDays, isSameDay, parseISO, subDays } from 'date-fns';

interface TrackedWorkout {
  id: string;
  name: string;
  description: string;
  schedule: string[];
  workoutsByDay: Record<string, {
    name: string;
    exercises: {
      name: string;
      sets: number;
      reps: number;
      weight?: number;
      notes?: string;
    }[];
  }>;
  progress: {
    date: string;
    completed: boolean;
    exercises: {
      name: string;
      sets: {
        reps: number;
        weight: number;
      }[];
    }[];
  }[];
  createdAt: any;
}

interface WorkoutTrackerProps {
  userId: string | undefined;
}

export default function PlanTracker({ userId }: WorkoutTrackerProps) {
  const [trackedWorkouts, setTrackedWorkouts] = useState<TrackedWorkout[]>([]);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<TrackedWorkout | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadWorkouts();
    }
  }, [userId]);

  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDates(dates);
  }, [selectedDate]);

  const loadWorkouts = async () => {
    try {
      const [tracked, generated] = await Promise.all([
        getActiveWorkouts(userId!),
        getRecentWorkouts(userId!, 10)
      ]);
      setTrackedWorkouts(tracked);
      setGeneratedWorkouts(generated);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = () => {
    setShowAddWorkout(true);
  };

  const handleCompleteWorkout = async (workout: TrackedWorkout, exerciseProgress: any[]) => {
    if (!userId) return;
    
    try {
      const dayName = format(selectedDate, 'EEEE');
      const dayWorkout = workout.workoutsByDay[dayName];
      
      if (!dayWorkout) {
        console.error('No workout found for this day');
        return;
      }

      const progress = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        completed: true,
        exercises: dayWorkout.exercises.map((exercise, index) => {
          const sets = Array.from({ length: exercise.sets }).map((_, setIndex) => {
            const inputReps = document.querySelector<HTMLInputElement>(
              `[data-workout="${workout.id}"][data-exercise="${index}"][data-set="${setIndex}"][data-type="reps"]`
            );
            const inputWeight = document.querySelector<HTMLInputElement>(
              `[data-workout="${workout.id}"][data-exercise="${index}"][data-set="${setIndex}"][data-type="weight"]`
            );
            
            return {
              reps: parseInt(inputReps?.value || '0'),
              weight: parseInt(inputWeight?.value || '0')
            };
          });

          return {
            name: exercise.name,
            sets
          };
        })
      };

      await updateWorkoutProgress(userId, workout.id, progress);
      loadWorkouts();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const getWorkoutsForDate = (date: Date, workout: TrackedWorkout) => {
    const dayName = format(date, 'EEEE');
    if (!workout.schedule.includes(dayName)) return null;
    
    if (!workout.workoutsByDay || !workout.workoutsByDay[dayName]) {
      console.warn(`No workout found for ${dayName} in workout ${workout.name}`);
      return null;
    }
    
    return {
      ...workout,
      exercises: workout.workoutsByDay[dayName].exercises
    };
  };

  const getExerciseHistory = (workout: TrackedWorkout, exerciseName: string) => {
    return workout.progress
      .filter(p => p.exercises.some(e => e.name === exerciseName))
      .map(p => ({
        date: p.date,
        sets: p.exercises.find(e => e.name === exerciseName)?.sets || []
      }))
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  };

  const getExerciseStats = (history: any[]) => {
    if (history.length === 0) return null;

    const allSets = history.flatMap(day => day.sets);
    const maxWeight = Math.max(...allSets.map(set => set.weight));
    const maxReps = Math.max(...allSets.map(set => set.reps));
    const totalVolume = allSets.reduce((sum, set) => sum + (set.reps * set.weight), 0);

    return {
      maxWeight,
      maxReps,
      totalVolume,
      workoutCount: history.length
    };
  };

  const renderExercise = (workout: TrackedWorkout, exercise: any, index: number) => (
    <div key={index} className="bg-white rounded-xl p-4 border border-purple-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h6 className="font-medium text-purple-900">{exercise.name}</h6>
          {exercise.notes && (
            <p className="text-sm text-gray-600 mt-1">{exercise.notes}</p>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <span className="px-2 py-1 bg-purple-50 rounded-lg text-purple-700">
            {exercise.sets} sets
          </span>
          <span className="px-2 py-1 bg-purple-50 rounded-lg text-purple-700">
            {exercise.reps} reps
          </span>
          {exercise.weight !== undefined && exercise.weight > 0 && (
            <span className="px-2 py-1 bg-purple-50 rounded-lg text-purple-700">
              {exercise.weight} lbs
            </span>
          )}
        </div>
        <button
          onClick={() => setSelectedExercise(selectedExercise === exercise.name ? null : exercise.name)}
          className="text-sm text-purple-600 hover:text-purple-700"
        >
          View History
        </button>
      </div>

      {selectedExercise === exercise.name && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <h6 className="font-medium text-gray-900 mb-2">Exercise History</h6>
          {getExerciseHistory(workout, exercise.name).map((day, i) => (
            <div key={i} className="mb-2 p-2 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">{format(parseISO(day.date), 'MMM d, yyyy')}</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {day.sets.map((set, j) => (
                  <div key={j} className="text-sm">
                    {set.reps} reps @ {set.weight}lbs
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Exercise Stats */}
          {(() => {
            const stats = getExerciseStats(getExerciseHistory(workout, exercise.name));
            if (!stats) return null;
            
            return (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <div className="text-sm text-purple-700">Max Weight</div>
                  <div className="font-medium">{stats.maxWeight} lbs</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <div className="text-sm text-purple-700">Max Reps</div>
                  <div className="font-medium">{stats.maxReps}</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <div className="text-sm text-purple-700">Total Volume</div>
                  <div className="font-medium">{stats.totalVolume} lbs</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <div className="text-sm text-purple-700">Workouts</div>
                  <div className="font-medium">{stats.workoutCount}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="grid gap-2">
          {Array.from({ length: exercise.sets }).map((_, setIndex) => (
            <div key={setIndex} className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Set {setIndex + 1}</span>
              <input
                type="number"
                placeholder="Reps"
                className="w-20 text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                min="0"
                data-workout={workout.id}
                data-exercise={index}
                data-set={setIndex}
                data-type="reps"
                defaultValue={exercise.reps}
              />
              <input
                type="number"
                placeholder="Weight (lbs)"
                className="w-24 text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                min="0"
                data-workout={workout.id}
                data-exercise={index}
                data-set={setIndex}
                data-type="weight"
                defaultValue={exercise.weight || 0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Your Active Plans</h3>
        <button
          onClick={() => setShowAddWorkout(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Plan
        </button>
      </div>

      {/* Display Generated Plans Available for Tracking */}
      {generatedWorkouts.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Available Plans</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {generatedWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="p-4 border border-purple-100 rounded-lg bg-purple-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-purple-900">
                      {workout.preferences.goals}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Created: {workout.createdAt instanceof Date 
                        ? workout.createdAt.toLocaleDateString()
                        : new Date(workout.createdAt?.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddWorkout(true)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Track This Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Calendar View */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Weekly Schedule</h4>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date) => {
            const dayName = format(date, 'EEEE');
            const dayWorkouts = trackedWorkouts
              .map(w => ({
                workout: w,
                dayWorkout: w.workoutsByDay?.[dayName],
                exercises: getWorkoutsForDate(date, w)
              }))
              .filter(w => w.exercises !== null);
            
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-4 rounded-lg text-center ${
                  isSelected
                    ? 'bg-purple-100 border-purple-200'
                    : isToday
                    ? 'bg-purple-50 border-purple-100'
                    : 'bg-white border-gray-100'
                } border hover:bg-purple-50 transition-colors`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {format(date, 'EEE')}
                </div>
                <div className="text-lg font-semibold text-purple-900">
                  {format(date, 'd')}
                </div>
                {dayWorkouts.length > 0 && (
                  <div className="mt-2">
                    {dayWorkouts.map(({ workout, dayWorkout }) => (
                      <div
                        key={workout.id}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full mb-1"
                      >
                        {dayWorkout?.name || workout.name}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Workouts */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Workouts for {format(selectedDate, 'MMMM d, yyyy')}
        </h4>
        <div className="grid gap-4">
          {trackedWorkouts
            .map(workout => ({
              workout,
              workoutData: getWorkoutsForDate(selectedDate, workout)
            }))
            .filter(({ workoutData }) => workoutData !== null)
            .map(({ workout, workoutData }) => (
              <div key={workout.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100">
                {/* Header Section */}
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Dumbbell className="h-6 w-6 text-purple-600" />
                      <h4 className="text-lg font-semibold text-purple-900">
                        {workout.workoutsByDay[format(selectedDate, 'EEEE')]?.name || workout.name}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedWorkout(workout)}
                        className="p-2 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this plan?')) {
                            deleteTrackedWorkout(userId!, workout.id);
                            loadWorkouts();
                          }
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="p-6">
                  <div className="grid gap-4">
                    {workoutData.exercises.map((exercise, index) => 
                      renderExercise(workout, exercise, index)
                    )}

                    <button
                      onClick={() => handleCompleteWorkout(workout, [])}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Complete Workout
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {showAddWorkout && (
        <AddPlanModal
          onClose={() => setShowAddWorkout(false)}
          onAdd={loadWorkouts}
          userId={userId!}
          generatedWorkouts={generatedWorkouts}
        />
      )}
    </div>
  );
} 