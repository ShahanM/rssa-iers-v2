import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Participant } from 'rssa-api';

interface ParticipantContextType {
    participant: Participant | null;
    setParticipant: (participant: Participant | null) => void;
    isLoading: boolean;
}

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

export const ParticipantProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();

    const { data: participant, isLoading } = useQuery<Participant | null>({
        queryKey: ['participant'],
        queryFn: () => null, // Initial state is null, data will be set manually or hydrated
        staleTime: Infinity, // Data doesn't go stale automatically
        gcTime: Infinity, // Keep in cache
    });

    const setParticipant = (newParticipant: Participant | null) => {
        queryClient.setQueryData(['participant'], newParticipant);
    };

    return (
        <ParticipantContext.Provider value={{ participant: participant || null, setParticipant, isLoading }}>
            {children}
        </ParticipantContext.Provider>
    );
};

export const useParticipant = () => {
    const context = useContext(ParticipantContext);
    if (context === undefined) {
        throw new Error('useParticipant must be used within a ParticipantProvider');
    }
    return context;
};
