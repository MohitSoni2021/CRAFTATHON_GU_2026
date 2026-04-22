'use client';

import { useEffect, useState } from 'react';
import { FaGlobe, FaTimes, FaChevronUp, FaChevronDown, FaCheck } from 'react-icons/fa';

interface LanguageSwitcherProps {
    className?: string;
}

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: any;
    }
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');

    useEffect(() => {
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,gu,mr',
                    autoDisplay: false,
                },
                'google_translate_element'
            );
        };

        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        }

        const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
        if (match) {
            setCurrentLang(match[1]);
        }
    }, []);

    const changeLanguage = (langCode: string) => {
        const cookieValue = `/en/${langCode}`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=${cookieValue}; path=/;`;
        setCurrentLang(langCode);
        setIsOpen(false);
        window.location.reload();
    };

    const languages = [
        { code: 'en', label: 'English', native: 'English' },
        { code: 'hi', label: 'Hindi', native: 'हिंदी' },
        { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
        { code: 'mr', label: 'Marathi', native: 'मराठी' },
    ];

    const labels: { [key: string]: { select: string; language: string; poweredBy: string; google: string } } = {
        en: { select: 'Select Identity Language', language: 'Interface Language', poweredBy: 'Optimized by', google: 'Clinical NLP' },
        hi: { select: 'भाषा चुनें', language: 'ऐप भाषा', poweredBy: 'द्वारा संचालित', google: 'गूगल अनुवाद' },
        gu: { select: 'ભાષા પસંદ કરો', language: 'એપ્લિકેશન ભાષા', poweredBy: 'દ્વારા સંચાલિત', google: 'ગૂગલ અનુવાદ' },
        mr: { select: 'भाषा निवडा', language: 'अॅप भाषा', poweredBy: 'द्वारा संचालित', google: 'गूगल अनुवाद' },
    };

    const currentLabels = labels[currentLang] || labels.en;

    return (
        <div className={`relative flex flex-col items-end gap-4 print:hidden ${className || ''}`}>
            <div id="google_translate_element" className="hidden"></div>

            {isOpen && (
                <div className="absolute bottom-full right-0 bg-white rounded-xl shadow-2xl p-6 mb-4 border border-outline-variant w-80 animate-in slide-in-from-bottom-5 duration-300 z-[100]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-extrabold text-gray-900 tracking-widest uppercase">{currentLabels.select}</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-primary p-2 hover:bg-surface-container-low rounded-xl transition-colors"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${currentLang === lang.code
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-outline-variant hover:border-primary/20 hover:bg-surface-container-low text-gray-600'
                                    }`}
                            >
                                <div className="text-left">
                                    <span className="block text-sm font-black mb-0.5">{lang.native}</span>
                                    <span className={`text-[10px] uppercase tracking-widest font-bold ${currentLang === lang.code ? 'text-primary/60' : 'text-gray-400'}`}>
                                        {lang.label}
                                    </span>
                                </div>
                                {currentLang === lang.code && <FaCheck size={12} />}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-outline-variant">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center">
                            {currentLabels.poweredBy} <span className="text-primary">{currentLabels.google}</span>
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-4 bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant hover:border-primary/20 transition-all hover:scale-[1.02] active:scale-95 ${isOpen ? 'ring-2 ring-primary/20' : ''}`}
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg transition-all duration-500 ${isOpen ? 'bg-primary rotate-90 shadow-lg shadow-primary/20' : 'bg-gray-900 group-hover:bg-primary'}`}>
                    {isOpen ? <FaTimes /> : <FaGlobe />}
                </div>
                <div className="text-left hidden sm:block pr-2">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">{currentLabels.language}</p>
                    <p className="text-sm font-extrabold text-gray-900 leading-none">
                        {languages.find(l => l.code === currentLang)?.native || 'English'}
                    </p>
                </div>
                <div className="text-gray-300">
                    {isOpen ? <FaChevronDown size={10} /> : <FaChevronUp size={10} className="group-hover:text-primary transition-colors" />}
                </div>
            </button>
        </div>
    );
}
