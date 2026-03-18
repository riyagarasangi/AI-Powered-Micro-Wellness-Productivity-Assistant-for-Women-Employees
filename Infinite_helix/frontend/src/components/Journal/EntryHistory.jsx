import React from 'react';
import EmotionBadge from './EmotionBadge';

const DEMO_ENTRIES = [
  {
    id: 1, text: "Feeling really productive today, finished the UI refactor ahead of schedule!",
    emotion: 'joy', confidence: 0.91, sentiment: 'positive',
    timestamp: '2:30 PM', date: 'Today',
  },
  {
    id: 2, text: "The deadline pressure is getting to me. Too many meetings today.",
    emotion: 'fear', confidence: 0.73, sentiment: 'negative',
    timestamp: '11:15 AM', date: 'Today',
  },
  {
    id: 3, text: "Had a great standup. Team is really supportive.",
    emotion: 'joy', confidence: 0.88, sentiment: 'positive',
    timestamp: '9:45 AM', date: 'Today',
  },
];

function formatTimestamp(ts) {
  if (!ts) return '';
  if (ts.includes('AM') || ts.includes('PM') || ts.includes(':')) return ts;
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

function formatDate(ts) {
  if (!ts) return 'Today';
  if (['Today', 'Yesterday'].includes(ts)) return ts;
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return 'Today';
  }
}

export default function EntryHistory({ entries: propEntries }) {
  const entries = propEntries && propEntries.length > 0
    ? propEntries.map(e => ({
        ...e,
        date: formatDate(e.timestamp || e.date),
        displayTime: formatTimestamp(e.timestamp),
      }))
    : DEMO_ENTRIES;

  let currentDate = '';

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-helix-muted">Recent Entries</h3>
        <span className="text-xs text-helix-accent">{entries.length} entries</span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {entries.map((entry, idx) => {
          const showDate = entry.date !== currentDate;
          if (showDate) currentDate = entry.date;

          return (
            <React.Fragment key={entry.id || idx}>
              {showDate && (
                <p className="text-xs text-helix-muted font-medium pt-2 first:pt-0">{entry.date}</p>
              )}
              <div className="bg-helix-bg/40 rounded-xl p-4 border border-helix-border/30 hover:border-helix-accent/20 transition-colors">
                <p className="text-sm text-helix-text leading-relaxed mb-3">{entry.text}</p>
                <div className="flex items-center justify-between">
                  <EmotionBadge emotion={entry.emotion} confidence={entry.confidence} size="sm" />
                  <span className="text-xs text-helix-muted">{entry.displayTime || entry.timestamp}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {entries.length === 0 && (
          <div className="text-center py-8 text-helix-muted">
            <span className="text-2xl">📝</span>
            <p className="text-sm mt-2">No journal entries yet. Write your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
