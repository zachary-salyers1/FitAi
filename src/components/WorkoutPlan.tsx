import React from 'react';
import { Info, Calendar, Dumbbell, Shield, LineChart } from 'lucide-react';

interface WorkoutPlanProps {
  plan: string;
  error?: string;
}

interface Section {
  title: string;
  content: string[];
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

  const parsePlan = (planText: string): Section[] => {
    const sections: Section[] = [];
    let currentTitle = '';
    let currentContent: string[] = [];

    const lines = planText.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('###')) {
        if (currentTitle && currentContent.length > 0) {
          sections.push({
            title: currentTitle,
            content: currentContent,
            icon: getIconForSection(currentTitle)
          });
        }
        currentTitle = line.replace('###', '').trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Add the last section
    if (currentTitle && currentContent.length > 0) {
      sections.push({
        title: currentTitle,
        content: currentContent,
        icon: getIconForSection(currentTitle)
      });
    }

    return sections;
  };

  const getIconForSection = (title: string): React.ReactNode => {
    switch (title.toLowerCase()) {
      case 'information summary':
        return <Info className="h-6 w-6" />;
      case 'weekly workout schedule':
        return <Calendar className="h-6 w-6" />;
      case 'exercise descriptions':
        return <Dumbbell className="h-6 w-6" />;
      case 'safety advice':
        return <Shield className="h-6 w-6" />;
      case 'progress tracking suggestions':
        return <LineChart className="h-6 w-6" />;
      default:
        return <Info className="h-6 w-6" />;
    }
  };

  const sections = parsePlan(plan);

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
                {section.content.map((line, lineIndex) => {
                  if (line.startsWith('-')) {
                    return (
                      <li key={lineIndex} className="text-gray-700">
                        {line.replace('-', '').trim()}
                      </li>
                    );
                  }
                  if (line.startsWith('**')) {
                    return (
                      <h5 key={lineIndex} className="font-semibold text-gray-900 mt-4 first:mt-0">
                        {line.replace(/\*\*/g, '')}
                      </h5>
                    );
                  }
                  return (
                    <p key={lineIndex} className="text-gray-700">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}