

export const STRINGS = {
	WINDOW_TOO_SMALL: `<p>This study requires your browser to be at least 
					<strong><underline>1200 pixels wide</underline></strong>. 
					Please resize your browser window or use a device with a 
					larger screen.</p>`,
	STUDY_ERROR: `<p>There was an error loading the study. 
					Please try again later.</p><p>If the problem persists, 
					please contact the study administrator.</p>`,
}

export const RETRY_DELAYS_MS = [1000, 3000, 5000, 10000, 20000];


export const emotionsDict = {
	'Joy': 'ignore',
	'Trust': 'ignore',
	'Fear': 'ignore',
	'Surprise': 'ignore',
	'Sadness': 'ignore',
	'Disgust': 'ignore',
	'Anger': 'ignore',
	'Anticipation': 'ignore'
}

export const studyConditions = {
	1: {
		recType: 'topN',
		emoTogglesEnabled: true,
		emoVizEnabled: true,
		defaultEmoWeightLabel: 'Ignore',
	},
	2: {
		recType: 'topN',
		emoTogglesEnabled: true,
		emoVizEnabled: false,
		defaultEmoWeightLabel: 'Ignore',
	},
	3: {
		recType: 'topN',
		emoTogglesEnabled: false,
		emoVizEnabled: true,
		defaultEmoWeightLabel: 'Ignore',
	},
	4: {
		recType: 'topN',
		emoTogglesEnabled: false,
		emoVizEnabled: false,
		defaultEmoWeightLabel: 'Ignore',
	},
	5: {
		recType: 'diverseN',
		emoTogglesEnabled: true,
		emoVizEnabled: true,
		defaultEmoWeightLabel: 'Diversify'
	},
	6: {
		recType: 'diverseN',
		emoTogglesEnabled: true,
		emoVizEnabled: false,
		defaultEmoWeightLabel: 'Diversify'
	},
	7: {
		recType: 'diverseN',
		emoTogglesEnabled: false,
		emoVizEnabled: true,
		defaultEmoWeightLabel: 'Diversify'
	},
	8: {
		recType: 'diverseN',
		emoTogglesEnabled: false,
		emoVizEnabled: false,
		defaultEmoWeightLabel: 'Diversify'
	}
}

export const ageGroups = {
	0: '18 - 24 years old',
	1: '25 - 29 years old',
	2: '30 - 34 years old',
	3: '35 - 39 years old',
	4: '40 - 44 years old',
	5: '45 - 49 years old',
	6: '50 - 54 years old',
	7: '55+',
	8: 'Prefer not to say'
}

export const genderCats = {
	0: 'Woman',
	1: 'Man',
	2: 'Non-binary',
	3: 'Prefer not to disclose',
	4: 'Prefer to self-describe'
}

export const educationGroups = {
	0: 'Some high school',
	1: 'High school',
	2: 'Some college',
	3: 'Trade, technical or vocational training',
	4: 'Associate\'s degree',
	5: 'Bachelor\'s degree',
	6: 'Master\'s degree',
	7: 'Professional degree',
	8: 'Doctorate',
	9: 'Prefer not to say'
}