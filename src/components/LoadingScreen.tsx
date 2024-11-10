import React from 'react';
import { Dumbbell } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Dumbbell className="h-12 w-12 text-purple-600 mx-auto animate-bounce" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading...</h2>
      </div>
    </div>
  );
} 