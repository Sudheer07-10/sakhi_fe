import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useJourney } from '../contexts/JourneyContext';
import { JourneyStage, JOURNEY_LABELS } from '../lib/journey';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export function JourneySelector() {
    const [, setLocation] = useLocation();
    const {
        showSelector, setShowSelector, setJourney, clearJourney, initialStage, dismissSelector,
        showAuthForJourney, setShowAuthForJourney,
        pendingStage, setPendingStage,
    } = useJourney();
    const { isLoggedIn } = useAuth();
    const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);
    const [date, setDate] = useState('');
    const [dateType, setDateType] = useState<'LMP' | 'DUE_DATE'>('LMP');

    // Sync initial stage from context when modal opens
    React.useEffect(() => {
        if (showSelector) {
            setSelectedStage(initialStage);
        }
    }, [showSelector, initialStage]);

    const handleStageSelect = (stage: JourneyStage) => {
        if (!isLoggedIn) {
            // Gate: remember which stage they clicked, then prompt sign-in
            setPendingStage(stage);
            setShowAuthForJourney(true);
            return;
        }
        setSelectedStage(stage);
        setDate('');
        if (stage === 'PREGNANT') setDateType('LMP');
    };

    const handleSave = () => {
        if (selectedStage) {
            setJourney(selectedStage, date || undefined, selectedStage === 'PREGNANT' ? dateType : undefined);
            
            // Redirect to home page dashboard
            setLocation('/');
            
            // Scroll to the dashboard element
            setTimeout(() => {
                const el = document.getElementById("journey-dashboard");
                if (el) {
                    const yOffset = -80; 
                    const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 300);
        }
    };

    /** After user signs in via the auth gate, close auth modal and auto-select the pending stage */
    const handleAuthSuccess = () => {
        setShowAuthForJourney(false);
        if (pendingStage) {
            // Auto-continue with the stage they clicked before signing in
            setSelectedStage(pendingStage);
            setDate('');
            setPendingStage(null);  // clear from context
        }
    };

    const getIcon = (stage: JourneyStage) => {
        switch (stage) {
            case 'CONCEPTION_PREP': return <img src="/thinking of parenthood.png" alt="Planning & Trying" className="w-12 h-12 object-contain" />;
            case 'PREGNANT': return <img src="/Pregnancy.png" alt="Pregnant" className="w-12 h-12 object-contain" />;
            case 'PARENT': return <img src="/Post-delivery.png" alt="Parent" className="w-12 h-12 object-contain" />;
        }
    };

    return (
        <>
            {/* ── Auth Gate Modal ── */}
            {/* Shown when a non-logged-in user tries to use personalization */}
            <AuthModal
                open={showAuthForJourney}
                onClose={() => setShowAuthForJourney(false)}
                onAuthSuccess={handleAuthSuccess}
                defaultTab="register"
            />

            {/* ── Journey Selector Modal ── */}
            <Dialog open={showSelector} onOpenChange={(open) => open ? setShowSelector(true) : dismissSelector()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg sm:text-xl font-bold text-gray-800 pr-6">
                            Current Stage of your Journey?
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            We'll personalize your experience based on this.
                        </DialogDescription>
                    </DialogHeader>

                    {!selectedStage ? (
                        <div className="flex flex-col gap-3 py-4">
                            {(Object.keys(JOURNEY_LABELS) as JourneyStage[]).map((stage) => (
                                <Card
                                    key={stage}
                                    className="cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 bg-white hover:bg-primary/[0.03] group"
                                    onClick={() => handleStageSelect(stage)}
                                >
                                    <CardContent className="flex flex-row items-center p-4 gap-4">
                                        <div className="bg-primary/5 p-3 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ring-1 ring-primary/10">
                                            {getIcon(stage)}
                                        </div>
                                        <div className="flex-1 space-y-1 text-left">
                                            <h3 className="font-bold text-lg text-gray-800 leading-tight">{JOURNEY_LABELS[stage]}</h3>
                                            <p className="text-sm text-gray-500">
                                                {stage === 'CONCEPTION_PREP' ? 'Actively preparing' :
                                                 stage === 'PREGNANT' ? 'Expecting a baby' : 'Raising a child'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedStage(null)}>
                                    ← Back
                                </Button>
                                <h3 className="font-semibold">{JOURNEY_LABELS[selectedStage]}</h3>
                            </div>

                            <div className="space-y-4">
                                {selectedStage === 'PREGNANT' && (
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-2">
                                        <button
                                            onClick={() => setDateType('LMP')}
                                            className={`py-2 text-xs font-bold rounded-lg transition-all ${dateType === 'LMP' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Last Period (LMP)
                                        </button>
                                        <button
                                            onClick={() => setDateType('DUE_DATE')}
                                            className={`py-2 text-xs font-bold rounded-lg transition-all ${dateType === 'DUE_DATE' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Due Date
                                        </button>
                                    </div>
                                )}

                                <Label>
                                    {selectedStage === 'CONCEPTION_PREP'
                                        ? 'When did you start planning or trying? (Optional)'
                                        : selectedStage === 'PREGNANT'
                                            ? dateType === 'LMP' ? 'First Day of Last Period' : 'Estimated Due Date'
                                            : 'Baby\'s Date of Birth'}
                                </Label>
                                <div>
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>                                <div className="flex flex-col gap-2">
                                    <Button 
                                        onClick={handleSave} 
                                        className="w-full bg-primary hover:bg-primary/90"
                                        disabled={!date && selectedStage !== 'CONCEPTION_PREP'}
                                    >
                                        Confirm & Personalize
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            clearJourney();
                                            setShowSelector(false);
                                        }}
                                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        Remove Personalization
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

export function JourneyStickyHeader() {
    const { journey, setShowSelector } = useJourney();

    if (!journey) return null;

    return (
        <div className="bg-white/80 backdrop-blur-md border-b border-primary/10 sticky top-0 z-40 px-4 py-2 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-600">Your Journey:</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold text-xs">
                    {JOURNEY_LABELS[journey.stage]}
                </span>
                {journey.date && (
                    <span className="text-gray-500 text-xs hidden sm:inline">
                        • {journey.stage === 'PREGNANT' ? 'Due: ' : journey.stage === 'CONCEPTION_PREP' ? 'Since: ' : 'Since: '} {new Date(journey.date).toLocaleDateString()}
                    </span>
                )}
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setShowSelector(true)}
            >
                Change
            </Button>
        </div>
    );
}
