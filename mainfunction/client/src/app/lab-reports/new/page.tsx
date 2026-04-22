'use client';
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createLabReport, analyzeLabReport } from '@/store/slices/labReportsSlice';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCloudUploadAlt, FaFlask, FaMagic, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

import PricingModal from '@/components/PricingModal';

export default function NewLabReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { loading } = useSelector((state: RootState) => state.labReports);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [testType, setTestType] = useState('');
    const [notes, setNotes] = useState('');
    const [fileUrl, setFileUrl] = useState(''); // Base64 string
    const [analyzing, setAnalyzing] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [limitMessage, setLimitMessage] = useState('');
    const loadingMessages = [
        "Analyzing diagnostic data...",
        "Extracting laboratory metrics...",
        "Summarizing clinical findings...",
        "Securing diagnostic record...",
        "Finalizing clinical report..."
    ];

    const [aiResponse, setAiResponse] = useState<any>(null);

    // Dynamic results builder
    const [results, setResults] = useState<{ key: string, value: string }[]>([{ key: '', value: '' }]);

    const handleAddResult = () => {
        setResults([...results, { key: '', value: '' }]);
    };

    const handleResultChange = (index: number, field: 'key' | 'value', value: string) => {
        const newResults = [...results];
        newResults[index][field] = value;
        setResults(newResults);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading || analyzing) {
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
            }, 2000);
        } else {
            setLoadingMessageIndex(0);
        }
        return () => clearInterval(interval);
    }, [loading, analyzing]);

    const handleAnalyze = async () => {
        if (!fileUrl) return;
        setAnalyzing(true);
        setAiResponse(null);
        try {
            const resultAction = await dispatch(analyzeLabReport({ image: fileUrl }));
            if (analyzeLabReport.fulfilled.match(resultAction)) {
                const data = resultAction.payload;
                setAiResponse(data);

                if (data.labReport?.reportDate) {
                    setDate(new Date(data.labReport.reportDate).toISOString().split('T')[0]);
                }

                let type = "General Lab Report";
                if (data.tests && data.tests.length > 0) {
                    type = data.tests[0].testCategory || data.tests[0].testName || type;
                }
                setTestType(type);

                if (data.tests && data.tests.length > 0) {
                    const newResults = data.tests.map((test: any) => ({
                        key: test.testName,
                        value: `${test.resultValue} ${test.unit || ''}`.trim()
                    }));
                    setResults(newResults);
                }

                if (data.summary) {
                    const summaryText = `Total Tests: ${data.summary.totalTests}, Abnormal: ${data.summary.abnormalTests}. ${data.summary.criticalFindings ? 'CRITICAL FINDINGS DETECTED.' : ''}`;
                    setNotes(prev => prev ? `${prev}\n\nAI Analysis: ${summaryText}` : `AI Analysis: ${summaryText}`);
                }
            } else {
                const payload = resultAction.payload as any;
                if (payload?.isLimitReached) {
                    setLimitMessage(payload.message);
                    setShowPricingModal(true);
                } else {
                    alert(payload?.message || "Failed to analyze report.");
                }
            }
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Failed to analyze report. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !fileUrl) {
            if (!fileUrl) alert("Please upload a lab report image.");
            return;
        }

        try {
            const resultAction = await dispatch(createLabReport({
                userId: user.id,
                reportDate: date,
                testType: testType,
                notes: notes,
                fileUrl: fileUrl,
                parsedResults: aiResponse || { results: results.filter(r => r.key) }
            }));

            if (createLabReport.fulfilled.match(resultAction)) {
                router.push('/lab-reports');
            } else {
                alert("Failed to save report. Please try again.");
            }
        } catch (error) {
            console.error("Save failed", error);
            alert("An error occurred while saving.");
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <PricingModal
                    isOpen={showPricingModal}
                    onClose={() => setShowPricingModal(false)}
                    message={limitMessage}
                />

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center text-tertiary/40 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group mr-5"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <p className="text-tertiary text-[11px] font-bold uppercase tracking-[0.1em] opacity-80 mb-1">
                                Clinical Archive • Diagnostic Upload
                            </p>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
                                Add Lab <span className="text-primary">Report</span>
                            </h1>
                        </div>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-ambient border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110"></div>

                    {/* Loading Overlay */}
                    {(loading || analyzing) && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                            <div className="flex flex-col items-center max-w-sm w-full mx-4">
                                <div className="relative w-20 h-20 mb-8">
                                    <div className="absolute inset-0 border-4 border-primary/10 rounded-xl"></div>
                                    <div className="absolute inset-0 border-4 border-primary rounded-xl border-t-transparent animate-spin"></div>
                                    <FaMagic className="absolute inset-0 m-auto text-primary text-2xl animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-[#2c3436] mb-2 tracking-tight">Processing Analysis</h3>
                                <p className="text-tertiary/60 font-medium text-center animate-pulse transition-all duration-500">
                                    {loadingMessages[loadingMessageIndex]}
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={`space-y-8 relative z-10 transition-all duration-300 ${(loading || analyzing) ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>

                        {/* File Upload & Analysis */}
                        <div className="bg-surface-container-low p-8 rounded-xl border-2 border-dashed border-gray-100 hover:border-primary/20 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-grow">
                                    <label className="block text-[10px] font-black text-tertiary/40 uppercase tracking-[0.2em] mb-4">Diagnostic Source</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="w-full text-xs text-tertiary/60 file:mr-6 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-primary file:text-white hover:file:bg-primary/90 transition file:cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAnalyze}
                                    disabled={!fileUrl || analyzing}
                                    className={`flex items-center justify-center space-x-3 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${!fileUrl || analyzing
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-primary to-tertiary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5'
                                        }`}
                                >
                                    <FaMagic className="text-base" />
                                    <span>AI Analysis</span>
                                </button>
                            </div>
                            
                            {fileUrl && (
                                <div className="mt-8 flex items-center p-4 bg-white rounded-xl border border-gray-100">
                                    {fileUrl.startsWith('data:image') ? (
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
                                                <img src={fileUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-extrabold text-[#2c3436]">Visual Capture Ready</p>
                                                <p className="text-[10px] text-tertiary/40 font-bold uppercase tracking-widest mt-0.5">High resolution input detected</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-3 text-primary">
                                            <FaCloudUploadAlt className="text-xl" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Document format selected</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-tertiary/40 uppercase tracking-widest mb-3">Consultation Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-5 py-4 bg-surface-container-low border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-[#2c3436]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-tertiary/40 uppercase tracking-widest mb-3">Diagnostic Category</label>
                                <input
                                    type="text"
                                    value={testType}
                                    onChange={(e) => setTestType(e.target.value)}
                                    placeholder={fileUrl ? "Identifying..." : "e.g. Lipid Profile, CBC"}
                                    className="w-full px-5 py-4 bg-surface-container-low border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-[#2c3436]"
                                />
                            </div>
                        </div>

                        {/* Dynamic Results Section */}
                        <div className="p-8 bg-surface-container-low rounded-xl border border-gray-50">
                            <div className="flex justify-between items-center mb-6">
                                <label className="text-[10px] font-black text-tertiary/40 uppercase tracking-widest">Laboratory Metrics</label>
                                <button type="button" onClick={handleAddResult} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-primary/70 transition-colors">+ Add Parameter</button>
                            </div>
                            <div className="space-y-4">
                                {results.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Test Parameter"
                                            value={item.key}
                                            onChange={(e) => handleResultChange(index, 'key', e.target.value)}
                                            className="px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm font-bold text-[#2c3436] placeholder:text-tertiary/20"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Value (e.g. 14.2 g/dL)"
                                            value={item.value}
                                            onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                                            className="px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm font-bold text-[#2c3436] placeholder:text-tertiary/20"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-tertiary/40 uppercase tracking-widest mb-3">Clinical Annotations</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Additional clinician comments or patient observations..."
                                className="w-full px-5 py-4 bg-surface-container-low border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 h-32 resize-none transition-all font-medium text-tertiary/70 placeholder:text-tertiary/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || analyzing}
                            className="btn-primary !rounded-xl w-full py-5 !text-xs shadow-xl shadow-primary/20 hover:-translate-y-0.5"
                        >
                            {loading ? 'ARCHIVING RECORD...' : 'SAVE TO CLINICAL ARCHIVE'}
                        </button>
                    </form>

                    {/* AI Analysis Response Section */}
                    {aiResponse && (
                        <div className={`mt-10 pt-10 border-t border-gray-50 transition-all duration-300 ${(loading || analyzing) ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                            <h3 className="text-[11px] font-black text-[#2c3436] uppercase tracking-[0.2em] mb-6 flex items-center">
                                <div className="w-8 h-8 rounded-lg bg-tertiary/5 flex items-center justify-center mr-3 text-tertiary">
                                    <FaMagic className="text-sm" />
                                </div>
                                Clinical Intelligence Output
                            </h3>
                            <div className="bg-surface-container-low p-6 rounded-xl overflow-x-auto text-[10px] font-mono text-tertiary/60 border border-gray-50 shadow-inner">
                                <pre>{JSON.stringify(aiResponse, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
