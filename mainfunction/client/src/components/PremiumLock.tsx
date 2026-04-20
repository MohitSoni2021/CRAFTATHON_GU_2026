import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaLock, FaStar } from 'react-icons/fa';
import Link from 'next/link';

interface PremiumLockProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function PremiumLock({ children, title = "Premium Feature", description = "Unlock this feature with LifeDoc Premium" }: PremiumLockProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const isPremium = user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active';

    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            {/* Blurred Content Background */}
            <div className="absolute inset-0 filter blur-md opacity-50 overflow-hidden pointer-events-none select-none">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 bg-white/60 backdrop-blur-sm text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white">
                    <FaLock className="text-3xl text-amber-600" />
                </div>

                <h3 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                    {title} <FaStar className="text-amber-500 text-lg" />
                </h3>
                <p className="text-gray-600 max-w-md mb-8 text-lg">
                    {description}. Upgrade now to access unlimited insights, extensive reports, and more.
                </p>

                <Link
                    href="/pricing"
                    className="px-8 py-3 bg-gray-900 hover:bg-black text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
                >
                    Unlock Premium
                </Link>
            </div>
        </div>
    );
}
