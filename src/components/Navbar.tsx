import React from 'react';
import { Dumbbell, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Dumbbell className="h-8 w-8 text-purple-600" />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              FitAI
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors">Pricing</a>
            <a href="#about" className="text-gray-700 hover:text-purple-600 transition-colors">About</a>
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            ) : (
              <button className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors">
                Get Started
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-purple-600">Features</a>
            <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-purple-600">Pricing</a>
            <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-purple-600">About</a>
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600 flex items-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            ) : (
              <button className="w-full text-left px-3 py-2 bg-purple-600 text-white rounded-md">
                Get Started
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}