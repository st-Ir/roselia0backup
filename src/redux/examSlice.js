import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	answers: {},
	score: 0,
	finalScore: 0,
	examStage: 'confirmation',
	currentQuestionIndex: 0,
	timeLeft: 3600,
	passed: false,
	hasPassed: false,
	previousScore: null,
	previousAttempts: 0,
	isSubmitting: false,
	displayedQuestions: [],
	shuffledQuestions: []
}

const examSlice = createSlice({
	name: 'exam',
	initialState,
	reducers: {
		setAnswers: (state, action) => {
			state.answers = action.payload
		},
		updateAnswer: (state, action) => {
			const { index, answer } = action.payload
			state.answers[index] = answer
		},
		setScore: (state, action) => {
			state.score = action.payload
		},
		setFinalScore: (state, action) => {
			state.finalScore = action.payload
		},
		setExamStage: (state, action) => {
			state.examStage = action.payload
		},
		setCurrentQuestionIndex: (state, action) => {
			state.currentQuestionIndex = action.payload
		},
		setTimeLeft: (state, action) => {
			state.timeLeft = action.payload
		},
		setPassed: (state, action) => {
			state.passed = action.payload
		},
		setHasPassed: (state, action) => {
			state.hasPassed = action.payload
		},
		setPreviousScore: (state, action) => {
			state.previousScore = action.payload
		},
		setPreviousAttempts: (state, action) => {
			state.previousAttempts = action.payload
		},
		setIsSubmitting: (state, action) => {
			state.isSubmitting = action.payload
		},
		setDisplayedQuestions: (state, action) => {
			state.displayedQuestions = action.payload
		},
		setShuffledQuestions: (state, action) => {
			state.shuffledQuestions = action.payload
		}
	}
})

export const {
	setAnswers,
	updateAnswer,
	setScore,
	setFinalScore,
	setExamStage,
	setCurrentQuestionIndex,
	setTimeLeft,
	setPassed,
	setHasPassed,
	setPreviousScore,
	setPreviousAttempts,
	setIsSubmitting,
	setDisplayedQuestions,
	setShuffledQuestions
} = examSlice.actions

export default examSlice.reducer