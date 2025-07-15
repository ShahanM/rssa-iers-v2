import { atom, selector } from 'recoil';
import { EmotionMovieDetails } from '../types/movies';

export const emotionMovieMapState = atom<Map<string, EmotionMovieDetails>>({
	key: 'emotionMovieMapState',
	default: new Map(),
});

export const activeEmotionMovieIdState = atom<string | undefined>({
	key: 'activeEmotionMovieIdState',
	default: undefined,
});

export const selectedEmotionMovieIdState = atom<string | undefined>({
	key: 'selectedEmotionMovieIdState',
	default: undefined,
});

export const activeEmotionMovieSelector = selector<EmotionMovieDetails | undefined>({
	key: 'activeEmotionMovieSelector',
	get: ({ get }) => {
		const movies = get(emotionMovieMapState);
		const activeId = get(activeEmotionMovieIdState);
		if (activeId) {
			return movies.get(activeId);
		}
		return undefined;
	}
});
