'use client';

import { useEffect, useState } from 'react';
import { FaGlobe, FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';

interface LanguageSwitcherProps {
    className?: string; // Allow custom positioning/styling
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
        // Initialize Google Translate
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,gu,mr', // English, Hindi, Gujarati, Marathi
                    autoDisplay: false,
                },
                'google_translate_element'
            );
        };

        // Load the script if not already loaded
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        }

        // Check for existing cookie to set initial state
        const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
        if (match) {
            setCurrentLang(match[1]);
        }
    }, []);

    const changeLanguage = (langCode: string) => {
        // specific logic to set the google translate cookie
        // The cookie format Google expects is /sourceLang/targetLang
        const cookieValue = `/en/${langCode}`;

        // We need to set it on domain level to ensure it sticks
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=${cookieValue}; path=/;`; // Fallback

        setCurrentLang(langCode);
        setIsOpen(false);

        // Reload to apply translation
        window.location.reload();
    };

    const languages = [
        { code: 'en', label: 'English', native: 'English' },
        { code: 'hi', label: 'Hindi', native: 'हिंदी' },
        { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
        { code: 'mr', label: 'Marathi', native: 'मराठी' },
    ];

    const labels: { [key: string]: { select: string; language: string; poweredBy: string; google: string } } = {
        en: { select: 'Select Language', language: 'App Language', poweredBy: 'Powered by', google: 'Google Translate' },
        hi: { select: 'भाषा चुनें', language: 'ऐप भाषा', poweredBy: 'द्वारा संचालित', google: 'गूगल अनुवाद' },
        gu: { select: 'ભાષા પસંદ કરો', language: 'એપ્લિકેશન ભાષા', poweredBy: 'દ્વારા સંચાલિત', google: 'ગૂગલ અનુવાદ' },
        mr: { select: 'भाषा निवडा', language: 'अॅप भाषा', poweredBy: 'द्वारा संचालित', google: 'गूगल अनुवाद' },
    };

    const currentLabels = labels[currentLang] || labels.en;

    return (
        <div className={`relative flex flex-col items-end gap-4 print:hidden ${className || ''}`}>
            {/* Hidden container for the Google widget */}
            <div id="google_translate_element" className="hidden"></div>

            {isOpen && (
                <div className="absolute bottom-full right-0 bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] p-6 mb-4 border border-blue-50/50 w-80 animate-slide-up z-[100]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">{currentLabels.select}</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-200 ${currentLang === lang.code
                                    ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                                    : 'border-gray-50 hover:border-blue-100 hover:bg-blue-50/20 text-gray-600'
                                    }`}
                            >
                                <span className="text-lg font-bold mb-0.5">{lang.native}</span>
                                <span className={`text-xs uppercase tracking-widest font-semibold ${currentLang === lang.code ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {lang.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                            {currentLabels.poweredBy} <span className="font-bold text-gray-600 tracking-wide">{currentLabels.google}</span>
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-4 bg-white px-6 py-4 rounded-full shadow-lg border border-gray-100/50 hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 ${isOpen ? 'ring-4 ring-red-50' : ''}`}
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl transition-all duration-300 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-to-br from-blue-500 to-blue-700 group-hover:from-blue-600 group-hover:to-blue-800'}`}>
                    {isOpen ? <FaTimes /> : <div className="relative"><FaGlobe className="z-10" /><span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></span></div>}
                </div>
                <div className="text-left hidden sm:block pr-2 flex-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">{currentLabels.language}</p>
                    <p className="text-base font-bold text-gray-900 leading-none">
                        {languages.find(l => l.code === currentLang)?.native || 'English'}
                    </p>
                </div>
                {isOpen ? <FaChevronDown className="text-gray-300" /> : <FaChevronUp className="text-gray-300 group-hover:text-blue-500" />}
            </button>
        </div>
    );
}
