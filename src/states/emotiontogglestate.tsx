import { atom } from 'recoil';


export type EmotionStatusValue = 'ignore' | 'low' | 'high' | 'diversify';

export const initialEmotionMap = new Map<string, EmotionStatusValue>([
	['anger', 'ignore'],
	['anticipation', 'ignore'],
	['disgust', 'ignore'],
	['fear', 'ignore'],
	['joy', 'ignore'],
	['sadness', 'ignore'],
	['surprise', 'ignore'],
	['trust', 'ignore']
]);

export const emotionState = atom<Map<string, EmotionStatusValue>>({
	key: 'emotionMapState',
	default: initialEmotionMap
});