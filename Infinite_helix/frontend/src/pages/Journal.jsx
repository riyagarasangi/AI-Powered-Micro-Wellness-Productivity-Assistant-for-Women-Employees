import React, { useState, useEffect, useCallback } from 'react';
import JournalEntry from '../components/Journal/JournalEntry';
import AIResponse from '../components/Journal/AIResponse';
import EntryHistory from '../components/Journal/EntryHistory';
import { journalAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEMO_ANALYSES = [
  {
    emotion: 'sadness', confidence: 0.72, sentiment: 'negative',
    reframe: "It's okay to feel overwhelmed. You've navigated tough deadlines before — focus on one small win right now.",
    all_emotions: [
      { label: 'sadness', score: 0.72 }, { label: 'fear', score: 0.15 },
      { label: 'anger', score: 0.06 }, { label: 'neutral', score: 0.04 },
    ],
  },
  {
    emotion: 'joy', confidence: 0.89, sentiment: 'positive', reframe: null,
    all_emotions: [
      { label: 'joy', score: 0.89 }, { label: 'surprise', score: 0.05 },
      { label: 'neutral', score: 0.04 }, { label: 'sadness', score: 0.02 },
    ],
  },
  {
    emotion: 'anger', confidence: 0.78, sentiment: 'negative',
    reframe: "Frustration shows you care about quality. Take a breath, then tackle one thing at a time.",
    all_emotions: [
      { label: 'anger', score: 0.78 }, { label: 'disgust', score: 0.10 },
      { label: 'sadness', score: 0.06 }, { label: 'neutral', score: 0.04 },
    ],
  },
];

export default function Journal() {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [entries, setEntries] = useState([]);
  const { user } = useAuth();

  const fetchEntries = useCallback(async () => {
    try {
      const res = await journalAPI.list({ user_id: user?.uid || 'demo-user-001', limit: 10 });
      if (Array.isArray(res.data)) {
        setEntries(res.data);
      }
    } catch {
      // keep existing entries on failure
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (text) => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await journalAPI.create({ text, user_id: user?.uid || 'demo-user-001' });
      if (res.data) {
        setAnalysis({
          emotion: res.data.emotion,
          confidence: res.data.confidence,
          sentiment: res.data.sentiment,
          reframe: res.data.reframe,
          all_emotions: res.data.all_emotions,
          all_sentiments: res.data.all_sentiments,
        });
        fetchEntries();
        setIsAnalyzing(false);
        return;
      }
    } catch {
      // Backend unavailable — use demo data
    }

    await new Promise(r => setTimeout(r, 1200));
    setAnalysis(DEMO_ANALYSES[Math.floor(Math.random() * DEMO_ANALYSES.length)]);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-helix-text">Emotion Journal</h1>
        <p className="text-sm text-helix-muted mt-1">Express how you feel and get AI-powered emotional insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <JournalEntry onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
          {analysis && <AIResponse analysis={analysis} />}
        </div>
        <div className="lg:col-span-2">
          <EntryHistory entries={entries} />
        </div>
      </div>
    </div>
  );
}
