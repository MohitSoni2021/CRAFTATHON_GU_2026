'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
    highContrast: boolean;
    largeText: boolean;
    toggleHighContrast: () => void;
    toggleLargeText: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);

    const toggleHighContrast = () => setHighContrast(prev => !prev);
    const toggleLargeText = () => setLargeText(prev => !prev);

    // Apply classes to body
    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }

        if (largeText) {
            document.body.classList.add('large-text');
        } else {
            document.body.classList.remove('large-text');
        }
    }, [highContrast, largeText]);

    return (
        <AccessibilityContext.Provider value={{ highContrast, largeText, toggleHighContrast, toggleLargeText }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
