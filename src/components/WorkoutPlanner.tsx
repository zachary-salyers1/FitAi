import React, { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';
import WorkoutForm from './WorkoutForm';
import WorkoutPlan from './WorkoutPlan';
import { initializeOpenAI, getOpenAIClient } from '../lib/openai';

interface WorkoutPlanState {
  plan: string;
  loading: boolean;
  error?: string;
}

interface UserProfile {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  activityLevel: string;
  workoutDaysPerWeek: string;
  healthConditions: string;
  dietaryRestrictions: string;
}

interface WorkoutPlannerProps {
  userProfile: UserProfile;
}

export default function WorkoutPlanner({ userProfile }: WorkoutPlannerProps) {
  const [apiKeyError, setApiKeyError] = useState<string>('');
  const [formData, setFormData] = useState({
    fitnessLevel: 'beginner',
    goals: '',
    timeAvailable: '30',
    equipment: 'minimal',
    customEquipment: [] as string[]
  });
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanState>({
    plan: '',
    loading: false
  });

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

          Please provide a detailed workout plan that takes into account any health conditions and dietary restrictions. Structure the response with these sections:
          ### Information Summary
          ### Weekly Workout Schedule
          ### Exercise Descriptions
          ### Safety Advice
          ### Progress Tracking Suggestions`
      });

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: 'asst_3Qj21ePIvgAi4STTbZazdrgc'
      });

      const checkCompletion = async () => {
        const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        
        if (runStatus.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(thread.id);
          const latestMessage = messages.data[0];
          setWorkoutPlan({
            plan: latestMessage.content[0].text.value,
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
        <div className="flex items-center mb-8">
          <Dumbbell className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900 ml-3">
            Welcome, {userProfile.name}!
          </h2>
        </div>

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

        <WorkoutPlan
          plan={workoutPlan.plan}
          error={workoutPlan.error}
        />
      </div>
    </div>
  );
}