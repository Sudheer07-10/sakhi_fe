import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useLocation } from 'wouter';
import { JourneyData, JourneyStage, JOURNEY_STORAGE_KEY } from '../lib/journey';
import { useAuth } from './AuthContext';

interface JourneyContextType {
    journey: JourneyData | null;
    setJourney: (stage: JourneyStage, date?: string, date_type?: string) => void;
    clearJourney: () => void;
    showSelector: boolean;
    setShowSelector: (show: boolean) => void;
    openSelector: (stage?: JourneyStage) => void;
    initialStage: JourneyStage | null;
    isLoading: boolean;
    dismissSelector: () => void;
    /** When true, show the auth modal - user tried to open personalization without being logged in */
    showAuthForJourney: boolean;
    setShowAuthForJourney: (show: boolean) => void;
    /** The stage the user intended to select before being prompted to sign in */
    pendingStage: JourneyStage | null;
    setPendingStage: (stage: JourneyStage | null) => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider = ({ children }: { children: ReactNode }) => {
    const [journey, setJourneyState] = useState<JourneyData | null>(null);
    const [showSelector, setShowSelector] = useState(false);
    const [initialStage, setInitialStage] = useState<JourneyStage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasDismissed, setHasDismissed] = useState(false);
    const [showAuthForJourney, setShowAuthForJourney] = useState(false);
    const [pendingStage, setPendingStage] = useState<JourneyStage | null>(null);
    const [location] = useLocation();
    const timerRef = useRef<NodeJS.Timeout>();
    const prevLocation = useRef(location);

    const { isLoggedIn, userId } = useAuth();

    useEffect(() => {
        // Load from local storage on mount
        try {
            const stored = localStorage.getItem(JOURNEY_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.stage === 'PLANNING' || parsed.stage === 'TTC') {
                    parsed.stage = 'CONCEPTION_PREP';
                    localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(parsed));
                }
                setJourneyState(parsed);
            } else {
                // Check if this is a newly registered user (e.g. from Google Auth redirect)
                const isNewUser = localStorage.getItem("is_new_user") === "true";
                const isSakhiPage = window.location.pathname.startsWith('/sakhi');

                if (isNewUser && !isSakhiPage) {
                    // Show selector immediately for new users
                    setShowSelector(true);
                    localStorage.removeItem("is_new_user");
                } else {
                    // No journey found — show selector after 2 minutes for ALL users
                    timerRef.current = setTimeout(() => {
                        setShowSelector(true);
                    }, 120000);
                }
            }
        } catch (e) {
            console.error('Failed to load journey from local storage', e);
        } finally {
            setIsLoading(false);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // When user logs in: sync journey (push local → backend, or pull backend → local)
    useEffect(() => {
        if (!isLoggedIn || !userId) return;

        if (journey) {
            // User has a local journey — push it to backend
            import('../utils/api').then(({ saveUserJourney }) => {
                let dateType = 'UNKNOWN';
                if (journey.stage === 'CONCEPTION_PREP') dateType = 'CYCLE_START';
                if (journey.stage === 'PREGNANT') dateType = 'LMP';
                if (journey.stage === 'PARENT') dateType = 'BIRTH_DATE';
                saveUserJourney({ user_id: userId, stage: journey.stage, date: journey.date, date_type: dateType })
                    .catch(() => {/* silent */ });
            });
        } else {
            // No local journey — try to fetch from backend (re-login scenario)
            import('../utils/api').then(({ fetchUserJourney }) => {
                fetchUserJourney(userId).then((serverJourney) => {
                    if (serverJourney && serverJourney.stage) {
                        let stage = serverJourney.stage;
                        if (stage === 'PLANNING' || stage === 'TTC') {
                            stage = 'CONCEPTION_PREP';
                        }
                        if (['CONCEPTION_PREP', 'PREGNANT', 'PARENT'].includes(stage)) {
                            const restoredData: JourneyData = {
                                stage: stage as JourneyStage,
                                date: serverJourney.date,
                                date_type: serverJourney.date_type,
                                lastUpdated: Date.now(),
                            };
                            setJourneyState(restoredData);
                            localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(restoredData));
                            if (timerRef.current) clearTimeout(timerRef.current);
                            console.log('✅ Journey restored from backend:', stage, serverJourney.date_type);
                        }
                    }
                }).catch(() => {/* silent — server may not have this endpoint yet */ });
            });
        }
    }, [isLoggedIn, userId]);    // only runs on auth state change

    // When user logs out, clear their journey from local state
    useEffect(() => {
        if (!isLoggedIn) {
            setJourneyState(null);
            localStorage.removeItem(JOURNEY_STORAGE_KEY);
            setShowSelector(false);
            setInitialStage(null);
        }
    }, [isLoggedIn]);

    // Effect to handle reminders on page navigation — for ALL users (creates urgency)
    useEffect(() => {
        if (prevLocation.current !== location) {
            const allowedPaths = ['/', '/knowledge-hub', '/sakhi', '/tools'];
            if (hasDismissed && !journey && allowedPaths.includes(location)) {
                setShowSelector(true);
                setHasDismissed(false);
            }
            prevLocation.current = location;
        }
    }, [location, hasDismissed, journey]);

    const setJourney = (stage: JourneyStage, date?: string, date_type?: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        // Auto-determine date type if not provided
        let determinedType = date_type;
        if (!determinedType && date) {
            if (stage === 'CONCEPTION_PREP') determinedType = 'CYCLE_START';
            if (stage === 'PARENT') determinedType = 'BIRTH_DATE';
            if (stage === 'PREGNANT') {
                // If date is in the future, it's likely a Due Date
                const isFuture = new Date(date) > new Date();
                determinedType = isFuture ? 'DUE_DATE' : 'LMP';
            }
        }

        const newData: JourneyData = {
            stage,
            date,
            date_type: determinedType,
            lastUpdated: Date.now(),
        };
        setJourneyState(newData);
        localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(newData));
        setShowSelector(false);
        setInitialStage(null);

        // Sync to backend — use userId from AuthContext (not legacy localStorage key)
        if (userId) {
            import('../utils/api').then(({ saveUserJourney }) => {
                saveUserJourney({ 
                    user_id: userId, 
                    stage, 
                    date, 
                    date_type: determinedType || 'UNKNOWN' 
                }).catch(err => console.error('Failed to sync journey to backend', err));
            });
        }

        import('../lib/analytics').then(({ trackEvent }) => {
            trackEvent('journey_selected', {
                stage,
                has_date: !!date,
                date_type: determinedType,
                timestamp: new Date().toISOString()
            });
        });
    };

    const clearJourney = () => {
        setJourneyState(null);
        localStorage.removeItem(JOURNEY_STORAGE_KEY);
        setShowSelector(false);
        setInitialStage(null);

        if (userId) {
            import('../utils/api').then(({ deleteUserJourney }) => {
                deleteUserJourney(userId).catch(err => console.error('Failed to delete journey from backend', err));
            });
        }
    };

    /**
     * Open the journey selector directly.
     * The auth gate happens at selection time (inside JourneySelector),
     * not here — so the popup is visible to all users for urgency.
     */
    const openSelector = (stage?: JourneyStage) => {
        if (stage) setInitialStage(stage);
        else setInitialStage(null);
        setShowSelector(true);
    };

    const dismissSelector = () => {
        setShowSelector(false);
        if (!journey) {
            setHasDismissed(true);
        }
    };

    return (
        <JourneyContext.Provider value={{
            journey,
            setJourney,
            clearJourney,
            showSelector,
            setShowSelector,
            openSelector,
            initialStage,
            isLoading,
            dismissSelector,
            showAuthForJourney,
            setShowAuthForJourney,
            pendingStage,
            setPendingStage,
        }}>
            {children}
        </JourneyContext.Provider>
    );
};

export const useJourney = () => {
    const context = useContext(JourneyContext);
    if (context === undefined) {
        throw new Error('useJourney must be used within a JourneyProvider');
    }
    return context;
};
