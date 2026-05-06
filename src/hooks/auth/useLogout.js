import { useCallback } from 'react';
import { useAuth } from '../../Store/useAuthStore';
import { useNavigate } from 'react-router-dom';

/**
 * useLogout — Shared hook for handling session termination across the app.
 * Ensures consistent behavior: signOut -> redirect -> toast.
 */
export function useLogout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const logout = useCallback(async (options = {}) => {
    const { redirect = true, redirectTo = '/' } = options;
    
    try {
      await signOut();
      
      if (redirect) {
        // Use window.location for a hard reset to clear all states
        window.location.href = redirectTo;
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut]);

  return logout;
}
