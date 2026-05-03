// src/Context/auth/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "../../lib/supabaseClient";
import { RealtimeProvider } from '../realtime/RealtimeProvider';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  // ── Auto Guest Testing Hook ──
  // A helper method for the developer to quickly test the checkout flow
  // without building a full login UI.
  const loginGuest = async () => {
    const guestEmail = "guest_tester@WooSho.local";
    const guestPass = "supa_strong_password_123!";

    // Attempt Login
    let { data, error } = await supabase.auth.signInWithPassword({
      email: guestEmail,
      password: guestPass
    });

    // If user doesn't exist, register them silently.
    if (error && error.message.includes("Invalid login credentials")) {
      const res = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPass
      });
      return res;
    }

    return { data, error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading, // exposes global auth loading state
      signIn,
      signUp,
      signOut,
      loginGuest
    }}>
      <RealtimeProvider user={user}>
        {!loading && children}
      </RealtimeProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
