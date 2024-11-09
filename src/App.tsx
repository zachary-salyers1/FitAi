import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WorkoutPlanner from './components/WorkoutPlanner';
import ProfileSetup from './components/ProfileSetup';

function App() {
  const [showWorkoutPlanner, setShowWorkoutPlanner] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const handleStartJourney = () => {
    setShowWorkoutPlanner(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileComplete = (profile) => {
    setUserProfile(profile);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {!showWorkoutPlanner && (
        <Hero onStartJourney={handleStartJourney} />
      )}
      {showWorkoutPlanner && !userProfile && (
        <ProfileSetup onProfileComplete={handleProfileComplete} />
      )}
      {showWorkoutPlanner && userProfile && (
        <WorkoutPlanner userProfile={userProfile} />
      )}
    </div>
  );
}

export default App;