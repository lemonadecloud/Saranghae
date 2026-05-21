'use client'

import { useLocalStorage } from './useLocalStorage'

export interface StudyStats {
  flashcardSessions: number
  flashcardCards: number
  quizSessions: number
  quizQuestions: number
  quizCorrect: number
  bestStreak: number
}

const INITIAL: StudyStats = {
  flashcardSessions: 0,
  flashcardCards: 0,
  quizSessions: 0,
  quizQuestions: 0,
  quizCorrect: 0,
  bestStreak: 0,
}

export function useStudyStats() {
  const [stats, setStats] = useLocalStorage<StudyStats>('kpk_stats', INITIAL)

  const recordFlashcard = (cards: number) =>
    setStats((prev) => ({
      ...prev,
      flashcardSessions: prev.flashcardSessions + 1,
      flashcardCards: prev.flashcardCards + cards,
    }))

  const recordQuiz = (questions: number, correct: number, streak: number) =>
    setStats((prev) => ({
      ...prev,
      quizSessions: prev.quizSessions + 1,
      quizQuestions: prev.quizQuestions + questions,
      quizCorrect: prev.quizCorrect + correct,
      bestStreak: Math.max(prev.bestStreak, streak),
    }))

  return { stats, recordFlashcard, recordQuiz }
}
