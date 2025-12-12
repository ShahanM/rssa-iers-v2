import { useEffect, useRef } from "react";


export function useDidUpdateEffect(callback: () => void, dependencies: React.DependencyList) {
	const isMounted = useRef(false);

	useEffect(() => {
		if (isMounted.current) {
			callback();
		} else {
			isMounted.current = true;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
		// This is intentional to avoid running the effect on the initial render
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);
}