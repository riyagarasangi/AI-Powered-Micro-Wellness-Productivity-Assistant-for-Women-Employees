import React, { useState, useEffect } from 'react';
import { HiOutlineVideoCamera, HiOutlineUsers, HiOutlinePhone, HiOutlineExternalLink } from 'react-icons/hi';
import { calendarAPI } from '../../services/api';

const TYPE_ICON = { teams: HiOutlineVideoCamera, video: HiOutlineVideoCamera, 'in-person': HiOutlineUsers, phone: HiOutlinePhone };

function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
}

function getDuration(start, end) {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 ? mins % 60 + 'm' : ''}`.trim();
  return `${mins} min`;
}

export default function MeetingTimeline() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calendarAPI.getMeetings()
      .then(res => setMeetings(res.data))
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-helix-muted mb-4">Today's Meetings</h3>
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-helix-accent border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-helix-muted">Loading meetings...</span>
        </div>
      </div>
    );
  }

  if (!meetings.length) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-helix-muted mb-4">Today's Meetings</h3>
        <div className="text-center py-12">
          <p className="text-helix-muted text-sm">No meetings scheduled for today</p>
          <p className="text-helix-muted/60 text-xs mt-1">Enjoy your focus time!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-medium text-helix-muted mb-4">Today's Meetings</h3>
      <div className="space-y-1">
        {meetings.map((meeting, i) => {
          const Icon = TYPE_ICON[meeting.type] || HiOutlineVideoCamera;
          const isUpcoming = meeting.status === 'upcoming';

          return (
            <div key={meeting.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${
                  isUpcoming ? 'border-helix-accent bg-helix-accent/30' : 'border-helix-muted/40 bg-helix-muted/20'
                }`} />
                {i < meetings.length - 1 && <div className="w-px flex-1 bg-helix-border my-1" />}
              </div>

              <div className={`flex-1 p-3 rounded-xl mb-2 transition-all ${
                isUpcoming
                  ? 'bg-helix-accent/5 border border-helix-accent/20 hover:border-helix-accent/40'
                  : 'bg-helix-bg/30 border border-helix-border/20 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isUpcoming ? 'text-helix-text' : 'text-helix-muted'}`}>
                      {meeting.title}
                    </span>
                    {meeting.is_teams && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                        Teams
                      </span>
                    )}
                  </div>
                  {meeting.join_url && isUpcoming && (
                    <a
                      href={meeting.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors"
                    >
                      <HiOutlineExternalLink className="w-3 h-3" />
                      Join
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-helix-muted">
                  <span>{formatTime(meeting.start)}</span>
                  <span>·</span>
                  <span>{getDuration(meeting.start, meeting.end)}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{meeting.attendees}</span>
                  </div>
                  {meeting.organizer && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-[120px]">{meeting.organizer}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
