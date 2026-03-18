import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { dashboardAPI, hydrationAPI, nudgeAPI } from '../services/api';
import { showNudgeNotification, requestPermission } from '../services/notifications';

const WellnessContext = createContext(null);

const INITIAL_METRICS = {
  screenTime: { total: 0, goal: 8, breakdown: { coding: 0, meetings: 0, browsing: 0, email: 0 } },
  focusSessions: [],
  breaks: { taken: 0, suggested: 6, lastBreak: '--:--', avgDuration: 0 },
  hydration: { glasses: 0, goal: 8, history: [false, false, false, false, false, false, false, false] },
  score: 0,
  mood: 'neutral',
  streakDays: 0,
  activity: {},
};

export function WellnessProvider({ children }) {
  const [todayMetrics, setTodayMetrics] = useState(INITIAL_METRICS);
  const [nudges, setNudges] = useState([]);
  const [trackerStatus, setTrackerStatus] = useState('connecting');
  const pollRef = useRef(null);
  const permissionAsked = useRef(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await dashboardAPI.getToday();
      const d = res.data;
      const glasses = d.hydration?.glasses || 0;
      setTodayMetrics({
        screenTime: d.screenTime || INITIAL_METRICS.screenTime,
        focusSessions: d.focusSessions || [],
        breaks: d.breaks || INITIAL_METRICS.breaks,
        hydration: {
          glasses,
          goal: d.hydration?.goal || 8,
          history: Array.from({ length: 8 }, (_, i) => i < glasses),
        },
        score: d.score || 0,
        mood: d.mood || 'neutral',
        streakDays: d.streakDays || 0,
        activity: d.activity || {},
      });
      setTrackerStatus('connected');
    } catch {
      setTrackerStatus('offline');
    }
  }, []);

  const refreshMetrics = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const addHydration = useCallback(async () => {
    try {
      await hydrationAPI.log();
    } catch {
      // offline fallback
    }
    setTodayMetrics(prev => {
      const newGlasses = Math.min(prev.hydration.glasses + 1, prev.hydration.goal);
      return {
        ...prev,
        hydration: {
          ...prev.hydration,
          glasses: newGlasses,
          history: Array.from({ length: 8 }, (_, i) => i < newGlasses),
        },
      };
    });
  }, []);

  const dismissNudge = useCallback(async (id) => {
    setNudges(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n));
    try {
      await nudgeAPI.dismiss(id);
    } catch {
      // best-effort
    }
  }, []);

  const generateNudge = useCallback(async (context = {}) => {
    try {
      const res = await nudgeAPI.generate(context);
      if (res.status === 200 && res.data?.type) {
        const newNudge = {
          ...res.data,
          id: res.data.id || Date.now(),
          time: 'just now',
          dismissed: false,
        };
        setNudges(prev => [newNudge, ...prev]);
        showNudgeNotification(newNudge);
      }
    } catch {
      // no nudge needed
    }
  }, []);

  useEffect(() => {
    if (!permissionAsked.current) {
      permissionAsked.current = true;
      requestPermission();
    }

    fetchDashboard();
    pollRef.current = setInterval(fetchDashboard, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchDashboard]);

  useEffect(() => {
    const nudgeInterval = setInterval(() => {
      const activity = todayMetrics.activity || {};
      generateNudge({
        continuous_work_minutes: activity.continuous_work_minutes || 0,
        typing_intensity: activity.typing_intensity || 0,
        glasses_today: todayMetrics.hydration?.glasses || 0,
        hour_of_day: new Date().getHours(),
      });
    }, 120000);
    return () => clearInterval(nudgeInterval);
  }, [generateNudge, todayMetrics]);

  const value = {
    todayMetrics,
    nudges,
    trackerStatus,
    refreshMetrics,
    dismissNudge,
    addHydration,
    generateNudge,
  };

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useWellness() {
  return useContext(WellnessContext);
}
