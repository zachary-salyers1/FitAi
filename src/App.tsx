import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WorkoutPlanner from './components/WorkoutPlanner';
import ProfileSetup from './components/ProfileSetup';
import AuthScreen from './components/AuthScreen';
import LoadingScreen from './components/LoadingScreen';
import { getUserProfile } from './lib/firestore';

function AppContent() {
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const handleShowAuth = () => setShowAuth(true);
    window.addEventListener('showAuth', handleShowAuth);
    return () => window.removeEventListener('showAuth', handleShowAuth);
  }, []);

  useEffect(() => {
    if (user) {
      setShowAuth(false);
      loadUserProfile();
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileComplete = async (profile) => {
    setUserProfile(profile);
  };

  if (loading || profileLoading) {
    return <LoadingScreen />;
  }

  // Show auth screen when showAuth is true
  if (showAuth) {
    return <AuthScreen />;
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <Hero />
      </div>
    );
  }

  // Show profile setup for authenticated users without a profile
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <ProfileSetup onProfileComplete={handleProfileComplete} />
      </div>
    );
  }

  // Show workout planner for authenticated users with a profile
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <WorkoutPlanner userProfile={userProfile} onProfileUpdate={setUserProfile} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}