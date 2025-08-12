import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification from '../components/ui/Notification';

interface NotificationData {
    id: string;
    type: 'success' | 'error';
    message: string;
}

interface NotificationContextType {
    showNotification: (type: 'success' | 'error', message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        const notification: NotificationData = { id, type, message };
        
        setNotifications(prev => [...prev, notification]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        type={notification.type}
                        message={notification.message}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
