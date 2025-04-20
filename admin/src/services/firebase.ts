import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  serverTimestamp,
  increment,
  setDoc,
  writeBatch
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9kqPC-j0wD0eOcQCnWWK1FJ3wv7p8cl8",
  authDomain: "trivia-game-4c1f5.firebaseapp.com",
  projectId: "trivia-game-4c1f5",
  storageBucket: "trivia-game-4c1f5.firebasestorage.app",
  messagingSenderId: "654944900413",
  appId: "1:654944900413:web:3be7e79749e0d922626154"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Interfaces
export interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  packId: string;
  isFlagged: boolean;
  timesUsed: number;
  successRate: number;
  createdAt: Date;
  defaultAnswers?: string[];
  imageURL?: string;
}

interface Pack {
  id?: string;
  name: string;
  description: string;
  isPremium: boolean;
  price: number;
  questionsCount?: number;
  imageURL: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateQuestionData extends Omit<Question, 'id' | 'timesUsed' | 'successRate' | 'createdAt'> {
  imageURL?: string;
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

// Dashboard Statistics
export async function getDashboardStats() {
  const roomsRef = collection(db, 'rooms');
  const usersRef = collection(db, 'users');
  const questionsRef = collection(db, 'questions');

  const [roomsSnapshot, usersSnapshot, questionsSnapshot] = await Promise.all([
    getDocs(roomsRef),
    getDocs(usersRef),
    getDocs(questionsRef)
  ]);

  const activeGames = roomsSnapshot.docs.filter(doc => doc.data().status !== 'ended').length;
  const activePlayers = usersSnapshot.docs.filter(doc => !doc.data().isGuest).length;
  const totalQuestions = questionsSnapshot.size;

  return {
    totalGames: roomsSnapshot.size,
    activeGames,
    activePlayers,
    questionsCreated: totalQuestions,
    averageScore: 75, // This would need to be calculated from actual game data
    mostPopularCategory: 'Science' // This would need to be calculated from actual game data
  };
}

// Questions Management
export async function getQuestions() {
  const questionsRef = collection(db, 'questions');
  const snapshot = await getDocs(questionsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getQuestionById(id: string): Promise<Question> {
  const questionRef = doc(db, 'questions', id);
  const questionDoc = await getDoc(questionRef);
  if (!questionDoc.exists()) {
    throw new Error('Question not found');
  }
  return {
    id: questionDoc.id,
    ...questionDoc.data()
  } as Question;
}

export async function createQuestion(questionData: CreateQuestionData): Promise<string> {
  try {
    // Get the pack to get current questionCount
    const packRef = doc(db, 'packs', questionData.packId);
    const packDoc = await getDoc(packRef);
    
    if (!packDoc.exists()) {
      throw new Error('Pack not found');
    }

    const pack = packDoc.data();
    const currentCount = pack.questionsCount || 0;
    const nextCount = currentCount + 1;
    
    // Format the question ID: packId_XXX (e.g., sports_001)
    const questionId = `${questionData.packId}_${String(nextCount).padStart(3, '0')}`;
    
    // Create the question document
    const questionRef = doc(db, 'questions', questionId);
    await setDoc(questionRef, {
      ...questionData,
      timesUsed: 0,
      successRate: 0,
      createdAt: serverTimestamp(),
      defaultAnswers: questionData.defaultAnswers || [],
      imageURL: questionData.imageURL || ''
    });
    
    // Update the pack's questionsCount
    await updateDoc(packRef, {
      questionsCount: nextCount,
      updatedAt: serverTimestamp()
    });
    
    return questionId;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
}

export async function updateQuestion(id: string, questionData: UpdateQuestionData): Promise<void> {
  const questionRef = doc(db, 'questions', id);
  
  // Get the current question to check if packId has changed
  const currentQuestion = await getQuestionById(id);
  
  await updateDoc(questionRef, {
    ...questionData,
    updatedAt: serverTimestamp()
  });
  
  // If packId has changed, update both old and new pack counts
  if (questionData.packId && questionData.packId !== currentQuestion.packId) {
    // Decrement the old pack's count
    if (currentQuestion.packId) {
      await updatePackQuestionsCount(currentQuestion.packId, false);
    }
    // Increment the new pack's count
    await updatePackQuestionsCount(questionData.packId, true);
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  const questionRef = doc(db, 'questions', id);
  
  // Get the question to know which pack to update
  const question = await getQuestionById(id);
  
  await deleteDoc(questionRef);
  
  // Update the pack's questionsCount
  if (question.packId) {
    await updatePackQuestionsCount(question.packId, false);
  }
}

// Category Management
export const getCategories = async () => {
  const categoriesRef = collection(db, 'categories');
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const createCategory = async (categoryData: {
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  packsCount: number;
}) => {
  const categoriesRef = collection(db, 'categories');
  const docRef = await addDoc(categoriesRef, {
    ...categoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateCategory = async (
  categoryId: string,
  categoryData: {
    name?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
    packsCount?: number;
  }
) => {
  const categoryRef = doc(db, 'categories', categoryId);
  await updateDoc(categoryRef, {
    ...categoryData,
    updatedAt: serverTimestamp()
  });
};

export const deleteCategory = async (categoryId: string) => {
  const categoryRef = doc(db, 'categories', categoryId);
  await deleteDoc(categoryRef);
};

// Packs Management
export async function getPacks() {
  const packsRef = collection(db, 'packs');
  const snapshot = await getDocs(packsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getPackById(id: string) {
  const packRef = doc(db, 'packs', id);
  const packDoc = await getDoc(packRef);
  if (!packDoc.exists()) {
    throw new Error('Pack not found');
  }
  return {
    id: packDoc.id,
    ...packDoc.data()
  };
}

export async function createPack(packData: {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  price: number;
  imageURL: string;
  isActive: boolean;
}) {
  // Validate that id is a valid document ID (no spaces, special chars except - and _)
  if (!/^[a-zA-Z0-9-_]+$/.test(packData.id)) {
    throw new Error('Pack ID can only contain letters, numbers, hyphens, and underscores');
  }

  const packRef = doc(db, 'packs', packData.id);

  // Check if pack with this ID already exists
  const existingPack = await getDoc(packRef);
  if (existingPack.exists()) {
    throw new Error('A pack with this ID already exists');
  }

  // Create pack with the specified ID
  await setDoc(packRef, {
    ...packData,
    id: packData.id, // Store ID as a field
    questionsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return packData.id;
}

export async function updatePack(id: string, packData: {
  name?: string;
  description?: string;
  isPremium?: boolean;
  price?: number;
  imageURL?: string;
  isActive?: boolean;
  questionsCount?: number;
}) {
  const packRef = doc(db, 'packs', id);
  await updateDoc(packRef, {
    ...packData,
    updatedAt: serverTimestamp()
  });
}

export async function deletePack(id: string) {
  // First get all questions for this pack
  const questionsRef = collection(db, 'questions');
  const q = query(questionsRef, where('packId', '==', id));
  const questionsSnapshot = await getDocs(q);
  
  // Delete all questions in a batch
  const batch = writeBatch(db);
  questionsSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // Delete the pack itself
  const packRef = doc(db, 'packs', id);
  batch.delete(packRef);
  
  // Commit the batch
  await batch.commit();
}

// Update pack's questionsCount when a question is added or removed
export async function updatePackQuestionsCount(packId: string, shouldIncrement: boolean = true) {
  const packRef = doc(db, 'packs', packId);
  await updateDoc(packRef, {
    questionsCount: shouldIncrement ? increment(1) : increment(-1),
    updatedAt: serverTimestamp()
  });
}

// User Statistics
export async function getUserStats(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  return userDoc.data().stats || {
    gamesPlayed: 0,
    totalScore: 0,
    wins: 0
  };
}

// Real-time Updates
export function subscribeToActiveGames(callback: (games: any[]) => void) {
  const roomsRef = collection(db, 'rooms');
  const q = query(roomsRef, where('status', '!=', 'ended'));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const games = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(games);
  });
}

// Admin user management
export const setupAdminUser = async (userId: string, email: string) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    email,
    isAdmin: true,
    displayName: 'Admin User',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}; 