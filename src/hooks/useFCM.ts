import { useEffect, useState } from 'react';
import { requestNotificationPermission, getFCMToken, sendFCMToken, setupMessageListener } from '../services/fcm-service';
import { useToast } from './use-toast';
import { useNotifications } from '../contexts/NotificationContext';

interface FCMHookProps {
  driverId: number | null;
  isAuthenticated: boolean;
}

export const useFCM = ({ driverId, isAuthenticated }: FCMHookProps) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  useEffect(() => {
    const initializeFCM = async () => {
      if (!isAuthenticated || !driverId || isInitialized) return;

      try {
        // Request notification permission
        const permissionGranted = await requestNotificationPermission();
        
        if (permissionGranted) {
          // Get FCM token
          const token = await getFCMToken();
          
          if (token) {
            setFcmToken(token);
            
            // Send token to backend
            const success = await sendFCMToken(token, driverId);
            
            if (success) {
              console.log('FCM token registered successfully');
            }
          }
        }

        // Setup message listener for foreground messages
        setupMessageListener((payload) => {
          // Add notification to context
          addNotification({
            title: payload.notification?.title || 'New Notification',
            body: payload.notification?.body || 'You have a new notification',
            data: payload.data,
          });

          // Show toast notification when message is received in foreground
          toast({
            title: payload.notification?.title || 'New Notification',
            description: payload.notification?.body || 'You have a new notification',
            duration: 5000,
          });
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing FCM:', error);
      }
    };

    initializeFCM();
  }, [isAuthenticated, driverId, isInitialized, toast, addNotification]);

  return { fcmToken, isInitialized };
};