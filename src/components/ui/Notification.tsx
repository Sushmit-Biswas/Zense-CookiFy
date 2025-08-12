import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from './Icons';

interface NotificationProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
    duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
    type, 
    message, 
    onClose, 
    duration = 5000 
}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';

    return (
        <div className={`fixed top-20 right-4 z-50 max-w-sm w-full ${bgColor} border rounded-xl p-4 shadow-lg animate-slide-in-right`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {type === 'success' ? (
                        <CheckCircle2 className={`w-6 h-6 ${iconColor}`} />
                    ) : (
                        <AlertCircle className={`w-6 h-6 ${iconColor}`} />
                    )}
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-medium ${textColor}`}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Notification;
