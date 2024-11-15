import React, { useState, useEffect } from 'react';
import { Dumbbell, User, Plus, History } from 'lucide-react';
import WorkoutForm from './WorkoutForm';
import WorkoutPlan from './WorkoutPlan';
import Profile from './Profile';
import { initializeOpenAI } from '../lib/openai';
import { useAuth } from '../contexts/AuthContext';
import { saveWorkoutPlan, getRecentWorkouts } from '../lib/firestore';
import PlanTracker from './PlanTracker';

interface WorkoutPlannerProps {
  userProfile: any;
  onProfileUpdate: (profile: any) => void;
}

export default function WorkoutPlanner({ userProfile, onProfileUpdate }: WorkoutPlannerProps) {
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();
  const [apiKeyError, setApiKeyError] = useState<string>('');
  const [formData, setFormData] = useState({
    fitnessLevel: 'beginner',
    goals: '',
    timeAvailable: '30',
    equipment: 'minimal',
    customEquipment: [] as string[]
  });
  const [workoutPlan, setWorkoutPlan] = useState({
    plan: '',
    loading: false
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setApiKeyError('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
      return;
    }
    try {
      initializeOpenAI(apiKey);
      setApiKeyError('');
    } catch (error) {
      setApiKeyError('Failed to initialize OpenAI client. Please check your API key.');
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadRecentWorkouts();
    }
  }, [user]);

  const loadRecentWorkouts = async () => {
    if (!user) return;
    try {
      const workouts = await getRecentWorkouts(user.uid);
      setRecentWorkouts(workouts);
    } catch (error) {
      console.error('Failed to load recent workouts:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'customEquipment' ? e.target.value : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const generateWorkoutPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (apiKeyError) {
      setWorkoutPlan({
        plan: '',
        loading: false,
        error: apiKeyError
      });
      return;
    }

    setWorkoutPlan({ plan: '', loading: true });

    try {
      const openai = getOpenAIClient();
      const thread = await openai.beta.threads.create();
      
      const equipmentList = formData.customEquipment.length > 0 
        ? `${formData.equipment} (Additional: ${formData.customEquipment.join(', ')})`
        : formData.equipment;

      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Create a workout plan with these parameters:
          Name: ${userProfile.name}
          Age: ${userProfile.age}
          Gender: ${userProfile.gender}
          Weight: ${userProfile.weight} kg
          Height: ${userProfile.height} cm
          Activity Level: ${userProfile.activityLevel}
          Workout Days Per Week: ${userProfile.workoutDaysPerWeek}
          Health Conditions: ${userProfile.healthConditions || 'None'}
          Dietary Restrictions: ${userProfile.dietaryRestrictions || 'None'}
          
          Workout Preferences:
          Fitness Level: ${formData.fitnessLevel}
          Goals: ${formData.goals}
          Time Available: ${formData.timeAvailable} minutes
          Equipment: ${equipmentList}

          Please provide a detailed workout plan that takes into account any health conditions and dietary restrictions. Format the response in markdown with these sections:
          
          # Information Summary
          
          # Weekly Workout Schedule
          
          # Exercise Descriptions
          
          # Safety Advice
          
          # Progress Tracking Suggestions`
      });

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: 'asst_3Qj21ePIvgAi4STTbZazdrgc'
      });

      const checkCompletion = async () => {
        const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        
        if (runStatus.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(thread.id);
          const latestMessage = messages.data[0];
          const plan = latestMessage.content[0].text.value;
          
          if (user) {
            await saveWorkoutPlan(user.uid, {
              plan,
              preferences: formData
            });
            await loadRecentWorkouts();
          }

          setWorkoutPlan({
            plan,
            loading: false
          });
        } else if (runStatus.status === 'failed') {
          setWorkoutPlan({
            plan: '',
            loading: false,
            error: 'Failed to generate workout plan. Please try again.'
          });
        } else {
          setTimeout(checkCompletion, 1000);
        }
      };

      checkCompletion();
    } catch (error) {
      setWorkoutPlan({
        plan: '',
        loading: false,
        error: 'An error occurred while generating your workout plan.'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Dumbbell className="h-8 w-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-900 ml-3">
              Welcome, {userProfile.name}!
            </h2>
          </div>
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <User className="h-5 w-5" />
            Edit Profile
          </button>
        </div>

        <div className="flex space-x-1 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'generate'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Generate Plan
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'track'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Track Workouts
          </button>
        </div>

        {activeTab === 'generate' ? (
          <>
            {apiKeyError && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                {apiKeyError}
              </div>
            )}

            <WorkoutForm
              formData={formData}
              onSubmit={generateWorkoutPlan}
              onChange={handleInputChange}
              isLoading={workoutPlan.loading}
            />

            {recentWorkouts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Workouts</h3>
                <div className="space-y-4">
                  {recentWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-4 border border-purple-100 rounded-lg hover:bg-purple-50 cursor-pointer"
                      onClick={() => setWorkoutPlan({ plan: workout.plan, loading: false })}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {new Date(workout.createdAt?.toDate()).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-purple-600">
                          {workout.preferences.goals}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <WorkoutPlan
              plan={workoutPlan.plan}
              error={workoutPlan.error}
            />
          </>
        ) : (
          <PlanTracker userId={user?.uid} />
        )}
      </div>

      {showProfile && (
        <Profile 
          initialData={userProfile}
          onClose={() => setShowProfile(false)}
          onSave={(updatedProfile) => {
            onProfileUpdate(updatedProfile);
            setShowProfile(false);
          }}
        />
      )}
    </div>
  );
}