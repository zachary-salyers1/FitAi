import React from 'react';
import { Info, Calendar, Dumbbell, Shield, LineChart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface WorkoutPlanProps {
  plan: string;
  error?: string;
}

interface Section {
  title: string;
  content: string;
  icon: React.ReactNode;
}

export default function WorkoutPlan({ plan, error }: WorkoutPlanProps) {
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const getIconForSection = (title: string) => {
    switch (title.toLowerCase()) {
      case 'information summary':
        return <Info />;
      case 'weekly workout schedule':
        return <Calendar />;
      case 'exercise descriptions':
        return <Dumbbell />;
      case 'safety advice':
        return <Shield />;
      case 'progress tracking suggestions':
        return <LineChart />;
      default:
        return <Info />;
    }
  };

  const sections = plan.split(/(?=# )/).filter(Boolean).map(section => {
    const [title, ...content] = section.split('\n');
    return {
      title: title.replace('# ', ''),
      content: content.join('\n').trim(),
      icon: getIconForSection(title.replace('# ', ''))
    };
  });

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-2xl font-bold text-purple-900">Your Personalized Workout Plan</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-md overflow-hidden border border-purple-100 ${
              section.title.toLowerCase() === 'weekly workout schedule' ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="bg-purple-50 px-6 py-4 flex items-center gap-3 border-b border-purple-100">
              <div className="text-purple-600">
                {section.icon}
              </div>
              <h4 className="text-lg font-semibold text-purple-900">
                {section.title}
              </h4>
            </div>
            
            <div className="p-6">
              <div className="prose prose-purple max-w-none">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}