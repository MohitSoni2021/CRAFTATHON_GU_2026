import { IconType } from 'react-icons';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

interface VitalsCardProps {
    title: string;
    value: string | number;
    unit: string;
    icon: IconType;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    colorClass: string; // e.g., "text-teal-600 bg-teal-50"
}

const VitalsCard = ({ title, value, unit, icon: Icon, trend, trendValue, colorClass }: VitalsCardProps) => {
    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="text-xl" />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-red-500 bg-red-50' :
                            trend === 'down' ? 'text-green-500 bg-green-50' : 'text-gray-500 bg-gray-50'
                        }`}>
                        {trend === 'up' && <FaArrowUp className="mr-1" />}
                        {trend === 'down' && <FaArrowDown className="mr-1" />}
                        {trend === 'stable' && <FaMinus className="mr-1" />}
                        {trendValue || ''}
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{title}</p>
                <div className="flex items-baseline">
                    <p className="text-3xl font-extrabold text-gray-900 mr-2">
                        {value}
                    </p>
                    <span className="text-sm text-gray-400 font-medium">{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default VitalsCard;
