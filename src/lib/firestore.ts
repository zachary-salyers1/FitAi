import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  activityLevel: string;
  workoutDaysPerWeek: string;
  healthConditions: string;
  dietaryRestrictions: string;
  updatedAt: any;
}

export interface WorkoutPlan {
  id: string;
  plan: string;
  preferences: {
    fitnessLevel: string;
    goals: string;
    timeAvailable: string;
    equipment: string;
    customEquipment: string[];
  };
  createdAt: any;
}

export const saveUserProfile = async (userId: string, profile: Omit<UserProfile, 'updatedAt'>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...profile,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as UserProfile : null;
};

export const saveWorkoutPlan = async (userId: string, workoutPlan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => {
  const workoutRef = doc(collection(db, 'users', userId, 'workouts'));
  await setDoc(workoutRef, {
    ...workoutPlan,
    createdAt: serverTimestamp()
  });
  return workoutRef.id;
};

export const getRecentWorkouts = async (userId: string, limitCount: number = 5): Promise<WorkoutPlan[]> => {
  const workoutsRef = collection(db, 'users', userId, 'workouts');
  const q = query(
    workoutsRef, 
    orderBy('createdAt', 'desc'), 
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as WorkoutPlan[];
}; 