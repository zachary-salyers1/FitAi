import React from 'react';
import { ArrowRight, Brain, Activity, Utensils } from 'lucide-react';

interface HeroProps {
  onStartJourney: () => void;
}

export default function Hero({ onStartJourney }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
              Your Personal
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                AI Fitness Coach
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Transform your fitness journey with personalized AI-powered workout and nutrition plans tailored to your unique goals and preferences.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button 
                onClick={onStartJourney}
                className="px-8 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-full hover:bg-purple-50 transition-colors">
                Learn More
              </button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto lg:mx-0">
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <p className="mt-2 font-medium">AI-Powered</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <p className="mt-2 font-medium">Personalized</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-purple-600" />
                </div>
                <p className="mt-2 font-medium">Nutrition</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&q=80&w=1000" 
              alt="Fitness Training" 
              className="w-full h-[600px] object-cover rounded-3xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}