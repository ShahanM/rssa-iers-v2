import { atom } from 'recoil';
import { Movie } from '../components/moviegrid/moviegriditem/MovieGridItem.types';

export const movieSelectionState = atom<Movie | null>({
	key: 'movieSelectionState',
	default: null
});
