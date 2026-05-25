'use client'

import { useLocalStorage } from './useLocalStorage'

export interface StudyStats {
  flashcardSessions: number
  flashcardCards: number
  quizSessions: number
  quizQuestions: number
  quizCorrect: number
  bestStreak: number
  writeSessions: number
  writeChars: number
  writeTotalScore: number
  writeBestScore: number
}

const INITIAL: StudyStats = {
  flashcardSessions: 0,
  flashcardCards: 0,
  quizSessions: 0,
  quizQuestions: 0,
  quizCorrect: 0,
  bestStreak: 0,
  writeSessions: 0,
  writeChars: 0,
  writeTotalScore: 0,
  writeBestScore: 0,
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

  const recordWrite = (chars: number, avgScore: number) =>
    setStats((prev) => ({
      ...prev,
      writeSessions: (prev.writeSessions ?? 0) + 1,
      writeChars: (prev.writeChars ?? 0) + chars,
      writeTotalScore: (prev.writeTotalScore ?? 0) + avgScore,
      writeBestScore: Math.max(prev.writeBestScore ?? 0, avgScore),
    }))

  return { stats, recordFlashcard, recordQuiz, recordWrite }
}
