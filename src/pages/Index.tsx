import { useState, useEffect } from "react";
import { LanguageProvider } from "../contexts/LanguageContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import AppContent from "../components/AppContent";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [isDriver, setIsDriver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driverId, setDriverId] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.userRole);
        setIsAuthenticated(true);
        
        if (user.userRole === 'driver') {
          // We'll handle driver data fetching in AppContent
          setIsLoading(true);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <LanguageProvider>
      <NotificationProvider>
        <AppContent
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          userRole={userRole}
          setUserRole={setUserRole}
          isDriver={isDriver}
          setIsDriver={setIsDriver}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          driverId={driverId}
          setDriverId={setDriverId}
        />
      </NotificationProvider>
    </LanguageProvider>
  );
};

export default Index;
