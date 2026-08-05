import { useQuery } from '@tanstack/react-query';

import { useStudy } from '@rssa-project/api';
import type { EmotionMovie, RecommendationRequestPayload, RecommendationResponsPayload } from '../types/iers.types';

export default function useRecommendationsFetch(studyStepId: string, contextData?: Record<string, unknown>) {
    const { studyApi } = useStudy();

    return useQuery({
        queryKey: ['recommendations', studyStepId, 'standard_emotion', contextData],
        queryFn: async () => {
            const payload = {
                step_id: studyStepId,
                context_tag: 'preference visualization recommendations',
                schema_type: 'standard_emotion', // or 'standard' depending on your registry

                ...contextData,
            } as RecommendationRequestPayload;
            console.warn('PAYLOAD', payload);
            const response = await studyApi.post<RecommendationRequestPayload, RecommendationResponsPayload>(
                'recommendations/',
                payload
            );

            if (!response) throw new Error('Failed to fetch recommendations');

            return response.items as EmotionMovie[];
        },
        enabled: !!contextData && Object.keys(contextData).length > 0,
        // retry: false,
    });
}
