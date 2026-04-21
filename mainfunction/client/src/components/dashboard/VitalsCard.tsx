import { IconType } from 'react-icons';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

interface VitalsCardProps {
    title: string;
    value: string | number;
    unit: string;
    icon: IconType;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    colorClass: string; // e.g., "text-primary bg-primary/5"
}

const VitalsCard = ({ title, value, unit, icon: Icon, trend, trendValue, colorClass }: VitalsCardProps) => {
    return (
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-xl ${colorClass}`}>
                    <Icon className="text-2xl" />
                </div>
                {trend && (
                    <div className={`flex items-center text-[10px] font-black px-3 py-1.5 rounded-lg tracking-widest uppercase ${trend === 'up' ? 'text-[#a83836] bg-[#a83836]/5' :
                            trend === 'down' ? 'text-primary bg-primary/5' : 'text-[#635888]/60 bg-surface-container-low'
                        }`}>
                        {trend === 'up' && <FaArrowUp className="mr-1.5" />}
                        {trend === 'down' && <FaArrowDown className="mr-1.5" />}
                        {trend === 'stable' && <FaMinus className="mr-1.5" />}
                        {trendValue || ''}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[11px] text-[#635888]/60 font-black uppercase tracking-[0.15em] mb-2">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-jakarta font-bold text-[#2c3436]">
                        {value}
                    </p>
                    <span className="text-xs text-[#635888]/50 font-bold tracking-widest uppercase">{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default VitalsCard;
