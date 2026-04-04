'use client';

import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface OnboardingTourProps {
    isNewUser: boolean;
    userId: string;
}

export default function OnboardingTour({ isNewUser, userId }: OnboardingTourProps) {
    const [run, setRun] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // Check if THIS specific user has seen the tour
        const cacheKey = `hasSeenOnboarding_${userId}`;
        const hasSeenTour = localStorage.getItem(cacheKey);

        // Only run if they haven't seen it AND they effectively have no data (new user context)
        // This prevents existing users from seeing it just because they cleared cache
        if (!hasSeenTour && isNewUser) {
            setRun(true);
        }
    }, [isNewUser, userId]);

    // TTS Helper
    const speak = (text: React.ReactNode) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel partially spoken words
            if (typeof text === 'string') {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.pitch = 1;
                utterance.rate = 1;
                window.speechSynthesis.speak(utterance);
            }
        }
    };

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, step } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem('hasSeenOnboarding', 'true');
            window.speechSynthesis.cancel();
        } else if (type === 'step:after' || type === 'tour:start') {
            // Speak the content of the *next* step (or current if start)
            // Joyride fires 'step:after' when leaving a step. We want to speak when *entering* a step.
            // Actually, 'step:before' is better, or just use the index.
            // But simpler: checking 'step:after' means we are done with one.
            // Better approach for simple TTS: Use effect or specific event types.
            // Let's try relying on 'step:after' index + 1 logic or 'tour:start'.
        }
    };

    // Better TTS Hook
    const handleStepChange = (data: CallBackProps) => {
        const { status, index, action, type, step } = data;

        if (type === 'step:after' && action === 'next') {
            // We are moving to next step. The `step` object here is the *previous* one.
            // Accessing the *next* step content is tricky without state.
            // Alternative: use a layout effect on the step index? 
        }

        // Simplified: Just speak whenever a step is effectively shown
        if ([STATUS.RUNNING].includes(status as any) && (type === 'step:after' || type === 'tour:start')) {
            const nextIndex = type === 'tour:start' ? 0 : index + (action === 'prev' ? -1 : 1);
            if (steps[nextIndex]) {
                speak(steps[nextIndex].content);
            }
        }

        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
        if (finishedStatuses.includes(status)) {
            setRun(false);
            const cacheKey = `hasSeenOnboarding_${userId}`;
            localStorage.setItem(cacheKey, 'true');
            window.speechSynthesis.cancel();
        }
    };

    const steps: Step[] = [
        {
            target: 'body',
            placement: 'center',
            title: 'Welcome to LifeDoc! 👋',
            content: 'Let us take you through a quick tour of your new Health Companion. We will explain what each feature does.',
            disableBeacon: true,
        },
        {
            target: '#sidebar-nav-ai-consultation',
            title: 'AI Consultation',
            content: 'Your 24/7 Health Assistant. Speak or type your symptoms here to get instant medical analysis and advice.',
            placement: 'right',
        },
        {
            target: '#sidebar-nav-measurements',
            title: 'Vital Measurements',
            content: 'Track your daily vitals like Glucose, Blood Pressure, and Weight. View trends to stay on top of your health.',
            placement: 'right',
        },
        {
            target: '#sidebar-nav-diary',
            title: 'Health Diary',
            content: 'A private journal for your health journey. Log your daily feelings, symptoms, or diet notes here.',
            placement: 'right',
        },
        {
            target: '#sidebar-nav-medical-info',
            title: 'Medical Profile',
            content: 'Store your critical medical info: Allergies, Current Medications, and past Surgeries. Crucial for emergencies.',
            placement: 'right',
        },
        {
            target: '#sidebar-nav-lab-reports',
            title: 'Lab Reports',
            content: 'Upload photos of your blood tests or lab reports. Our AI reads them and explains the results in simple language.',
            placement: 'right',
        },
        {
            target: '#sidebar-nav-doctor-reports',
            title: 'Doctor Prescriptions',
            content: 'Keep all your doctor visits and prescriptions organized in one place for easy access.',
            placement: 'right',
        },
        {
            target: '#sidebar-nav-appointments',
            title: 'Appointments',
            content: 'Never miss a check-up. Schedule and manage your upcoming doctor appointments here.',
            placement: 'right',
        },
        {
            target: '#sidebar-nav-family-health',
            title: 'Family Health',
            content: 'Caring for others? Manage health profiles for your parents or children from this single account.',
            placement: 'right',
        },
        {
            target: '#onboarding-action-dock',
            title: 'Quick Tools',
            content: 'On every screen, use this button for Voice Typing or to trigger an SOS Emergency alert.',
            placement: 'top-start',
        }
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            callback={handleStepChange}
            styles={{
                options: {
                    primaryColor: '#2B7A78',
                    textColor: '#333',
                    zIndex: 10000,
                },
                buttonNext: {
                    backgroundColor: '#2B7A78',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '10px 20px',
                    borderRadius: '8px',
                },
                buttonBack: {
                    color: '#2B7A78',
                    marginRight: 10,
                },
                buttonSkip: {
                    color: '#718096',
                },
                tooltip: {
                    borderRadius: '16px',
                    padding: '20px',
                },
                tooltipTitle: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#17252A',
                    marginBottom: '10px',
                    textAlign: 'left',
                },
                tooltipContent: {
                    fontSize: '15px',
                    lineHeight: '1.6',
                    textAlign: 'left',
                }
            }}
        />
    );
}