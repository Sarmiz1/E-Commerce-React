// FIXED IMPORT
import { createContext, useContext, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { initRealtime } from "../../lib/realtime";
import { queryClient } from "../../queries/queryClient";

const RealtimeContext = createContext(null);

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ user, children }) => {
  useEffect(() => {
    if (!user?.id) return;

    const channel = initRealtime(queryClient, user.id);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <RealtimeContext.Provider value={{}}>{children}</RealtimeContext.Provider>
  );
};
