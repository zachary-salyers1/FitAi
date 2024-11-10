import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WorkoutPlanner from './components/WorkoutPlanner';
import ProfileSetup from './components/ProfileSetup';
import AuthScreen from './components/AuthScreen';
import LoadingScreen from './components/LoadingScreen';

function AppContent() {
  const { user, loading } = useAuth();
  const [showWorkoutPlanner, setShowWorkoutPlanner] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const handleStartJourney = () => {
    setShowWorkoutPlanner(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileComplete = (profile) => {
    setUserProfile(profile);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;