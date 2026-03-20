import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineDownload, HiOutlineRefresh } from 'react-icons/hi';
import { reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import WellnessScorecard from '../components/Reports/WellnessScorecard';
import WorkHoursChart from '../components/Reports/WorkHoursChart';
import EmotionChart from '../components/Reports/EmotionChart';
import StressHeatmap from '../components/Reports/StressHeatmap';
import SelfCareMetrics from '../components/Reports/SelfCareMetrics';
import WeeklyInsight from '../components/Reports/WeeklyInsight';

export default function Reports() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportsAPI.getWeekly();
      setReport(res.data);
    } catch {
      setError('Unable to load your wellness report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const downloadReport = useCallback(() => {
    if (!report) return;
    setDownloading(true);
    const userName = user?.displayName || 'User';

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to download your report.');
        setDownloading(false);
        return;
      }
      printWindow.document.write(generatePrintHTML(report, userName));
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setDownloading(false);
        }, 600);
      };
    } catch {
      setDownloading(false);
    }
  }, [report, user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
        <div className="h-8 w-48 bg-helix-card/60 rounded-lg animate-pulse" />
        <div className="glass-card p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="w-36 h-36 rounded-full bg-helix-card/60 animate-pulse" />
            <div className="flex-1 w-full space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-20 bg-helix-card/60 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card h-72 animate-pulse" />
          <div className="glass-card h-72 animate-pulse" />
        </div>
        <div className="glass-card h-56 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto animate-slide-up">
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">{'\u{1F614}'}</p>
          <p className="text-helix-text font-medium mb-2">Couldn't load your report</p>
          <p className="text-sm text-helix-muted mb-6">{error}</p>
          <button
            onClick={fetchReport}
            className="px-5 py-2.5 rounded-xl bg-helix-accent/20 text-helix-accent text-sm font-medium hover:bg-helix-accent/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-helix-text">
            Your Wellness Report
          </h1>
          <p className="text-sm text-helix-muted mt-1">{report.period?.label}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReport}
            className="glass-card p-2.5 text-helix-muted hover:text-helix-text transition-colors"
            title="Refresh report"
          >
            <HiOutlineRefresh className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={downloadReport}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-helix-accent to-helix-pink text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-helix-accent/20"
          >
            <HiOutlineDownload className="w-4 h-4" />
            {downloading ? 'Preparing...' : 'Download Report'}
          </button>
        </div>
      </div>

      {/* Wellness Scorecard */}
      <WellnessScorecard
        score={report.wellness_score}
        summary={report.summary}
        dailyScores={report.daily_scores}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkHoursChart data={report.work_hours} />
        <EmotionChart distribution={report.emotion_distribution} />
      </div>

      {/* Stress Heatmap */}
      <StressHeatmap heatmap={report.stress_heatmap} />

      {/* Self-Care */}
      <SelfCareMetrics selfCare={report.self_care} />

      {/* Insights + Recommendations + Cycle + Affirmation */}
      <WeeklyInsight
        insights={report.insights}
        recommendations={report.recommendations}
        affirmation={report.affirmation}
        cycleInsights={report.cycle_insights}
      />
    </div>
  );
}


/* ── PDF / Print HTML Generator ─────────────────────────────────────────── */

function generatePrintHTML(report, userName) {
  const s = report.summary;
  const sc = report.wellness_score;
  const selfCare = report.self_care;

  const dailyBars = (report.daily_scores || [])
    .map(
      (d) =>
        `<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
          <span style="width:32px;text-align:right;font-size:13px;color:#64748b">${d.day}</span>
          <div style="flex:1;height:22px;background:#f1f5f9;border-radius:11px;overflow:hidden">
            <div style="height:100%;width:${d.score}%;background:linear-gradient(90deg,#a78bfa,#f472b6);border-radius:11px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px">
              <span style="font-size:11px;color:white;font-weight:600">${d.score}</span>
            </div>
          </div>
        </div>`
    )
    .join('');

  const progressBar = (pct, color) =>
    `<div style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden">
       <div style="height:100%;width:${Math.min(pct, 100)}%;background:${color};border-radius:4px"></div>
     </div>`;

  const selfCareRows = [
    { label: 'Hydration', val: `${selfCare.hydration.avg_ml}/${selfCare.hydration.goal_ml} ml`, pct: selfCare.hydration.completion_pct, color: '#38bdf8' },
    { label: 'Breaks', val: `${selfCare.breaks.total} taken`, pct: selfCare.breaks.compliance_pct, color: '#34d399' },
    { label: 'Stretches', val: `${selfCare.stretches.done}/${selfCare.stretches.suggested}`, pct: selfCare.stretches.compliance_pct, color: '#a78bfa' },
    { label: 'Eye Rest', val: `${selfCare.eye_rest.done}/${selfCare.eye_rest.suggested}`, pct: selfCare.eye_rest.compliance_pct, color: '#f472b6' },
  ]
    .map(
      (r) =>
        `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
          <span style="width:80px;font-size:13px;color:#475569">${r.label}</span>
          ${progressBar(r.pct, r.color)}
          <span style="width:44px;text-align:right;font-size:13px;font-weight:600;color:#1e293b">${r.pct}%</span>
          <span style="width:90px;font-size:11px;color:#94a3b8">${r.val}</span>
        </div>`
    )
    .join('');

  const insightIcons = { achievement: '\u2B50', improvement: '\u{1F4C8}', positive: '\u2705', tip: '\u{1F4A1}' };
  const insightHTML = (report.insights || [])
    .map(
      (ins) =>
        `<div style="background:#f8fafc;border-left:3px solid #a78bfa;padding:14px 16px;border-radius:0 10px 10px 0;margin-bottom:10px">
          <div style="font-size:14px;font-weight:600;color:#1e293b">${insightIcons[ins.type] || '\u{1F4A1}'} ${ins.title}</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;line-height:1.6">${ins.detail}</div>
        </div>`
    )
    .join('');

  const recsHTML = (report.recommendations || [])
    .map(
      (rec, i) =>
        `<div style="display:flex;gap:12px;margin-bottom:12px">
          <div style="width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#ede9fe,#fce7f3);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span style="font-size:12px;font-weight:700;color:#7c3aed">${i + 1}</span>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px">${rec.category}</div>
            <div style="font-size:13px;color:#334155;margin-top:2px;line-height:1.5">${rec.tip}</div>
          </div>
        </div>`
    )
    .join('');

  const emotionColors = { joy: '#34d399', neutral: '#38bdf8', sadness: '#a78bfa', surprise: '#fbbf24', anger: '#f87171', fear: '#f472b6' };
  const emotionHTML = Object.entries(report.emotion_distribution || {})
    .sort((a, b) => b[1] - a[1])
    .map(
      ([emo, pct]) =>
        `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:10px;height:10px;border-radius:50%;background:${emotionColors[emo] || '#94a3b8'}"></div>
          <span style="width:70px;font-size:12px;color:#475569;text-transform:capitalize">${emo}</span>
          <div style="flex:1;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${emotionColors[emo] || '#94a3b8'};border-radius:3px"></div>
          </div>
          <span style="font-size:12px;font-weight:600;color:#1e293b;width:32px;text-align:right">${pct}%</span>
        </div>`
    )
    .join('');

  const cycleHTML = report.cycle_insights?.enabled
    ? `<div style="margin-top:32px">
        <h2 style="font-family:'Playfair Display',serif;font-size:18px;color:#1e293b;margin-bottom:14px">\u{1F319} Cycle-Aware Insights</h2>
        <div style="display:flex;gap:12px;margin-bottom:14px">
          ${Object.entries(report.cycle_insights.phase_scores || {})
            .map(
              ([phase, score]) =>
                `<div style="flex:1;text-align:center;padding:12px;border-radius:10px;background:${phase === report.cycle_insights.current_phase ? '#f5f3ff' : '#f8fafc'};border:1px solid ${phase === report.cycle_insights.current_phase ? '#c4b5fd' : '#e2e8f0'}">
                  <div style="font-size:20px;font-weight:700;color:#1e293b">${score}</div>
                  <div style="font-size:11px;color:#64748b;text-transform:capitalize;margin-top:2px">${phase}</div>
                </div>`
            )
            .join('')}
        </div>
        <div style="background:#faf5ff;padding:14px 16px;border-radius:10px;font-size:13px;color:#4c1d95;line-height:1.6">${report.cycle_insights.tip}</div>
      </div>`
    : '';

  const heatmapColors = ['#dcfce7', '#bbf7d0', '#fef3c7', '#fde68a', '#fbcfe8', '#f9a8d4', '#fca5a5'];
  const heatmapHTML = report.stress_heatmap
    ? `<div style="margin-top:32px">
        <h2 style="font-family:'Playfair Display',serif;font-size:18px;color:#1e293b;margin-bottom:14px">Stress Patterns</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <tr>
            <td></td>
            ${report.stress_heatmap.hours.map((h) => `<td style="text-align:center;padding:4px;color:#94a3b8;font-size:10px">${h}</td>`).join('')}
          </tr>
          ${report.stress_heatmap.days
            .map(
              (day, di) =>
                `<tr>
                  <td style="text-align:right;padding-right:8px;color:#64748b;font-size:11px">${day}</td>
                  ${report.stress_heatmap.data[di]
                    .map(
                      (v) =>
                        `<td style="padding:3px"><div style="height:28px;border-radius:6px;background:${heatmapColors[Math.min(v - 1, 6)] || heatmapColors[0]};display:flex;align-items:center;justify-content:center"><span style="font-size:10px;color:#475569">${v}</span></div></td>`
                    )
                    .join('')}
                </tr>`
            )
            .join('')}
        </table>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Wellness Report \u2013 ${report.period?.label || 'This Week'}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', -apple-system, sans-serif; color: #1e293b; max-width: 780px; margin: 0 auto; padding: 40px 32px; background: white; }
  @media print {
    body { padding: 16px; }
    .no-print { display: none !important; }
    @page { margin: 0.7cm; size: A4; }
  }
  h1 { font-family: 'Playfair Display', serif; }
  .header { text-align: center; padding-bottom: 28px; border-bottom: 2px solid #e2e8f0; margin-bottom: 32px; }
  .header h1 { font-size: 28px; color: #1e293b; margin-bottom: 4px; }
  .header .period { font-size: 14px; color: #7c3aed; font-weight: 500; }
  .header .meta { font-size: 12px; color: #94a3b8; margin-top: 8px; }
  .score-section { text-align: center; margin-bottom: 32px; }
  .score-circle { display: inline-flex; flex-direction: column; align-items: center; gap: 8px; }
  .score-num { font-family: 'Playfair Display', serif; font-size: 56px; font-weight: 700; background: linear-gradient(135deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .score-label { font-size: 13px; color: #64748b; }
  .grade { display: inline-block; padding: 4px 12px; border-radius: 20px; background: #f5f3ff; color: #7c3aed; font-weight: 600; font-size: 13px; }
  .change { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-left: 8px; }
  .change.up { background: #f0fdf4; color: #16a34a; }
  .change.down { background: #fef2f2; color: #dc2626; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
  .metric { text-align: center; padding: 16px 10px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
  .metric .val { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #1e293b; }
  .metric .lbl { font-size: 11px; color: #94a3b8; margin-top: 4px; }
  .section { margin-top: 32px; }
  .section h2 { font-family: 'Playfair Display', serif; font-size: 18px; color: #1e293b; margin-bottom: 14px; }
  .affirmation { margin-top: 36px; text-align: center; padding: 28px 24px; background: linear-gradient(135deg, #f5f3ff, #fdf2f8, #eff6ff); border-radius: 16px; }
  .affirmation .label { font-size: 11px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .affirmation .text { font-size: 14px; color: #334155; line-height: 1.7; font-style: italic; max-width: 600px; margin: 0 auto; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
  .print-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 16px; font-family: 'DM Sans', sans-serif; }
  .print-btn:hover { opacity: 0.9; }
</style>
</head>
<body>
  <div class="header">
    <div style="font-size:24px;margin-bottom:8px">\u221E</div>
    <h1>Infinite Helix</h1>
    <div class="period">Weekly Wellness Report</div>
    <div class="meta">${report.period?.label || ''} \u00b7 Prepared for ${userName}</div>
    <div style="margin-top:6px;font-size:11px;color:#cbd5e1">Private & Confidential</div>
    <button class="print-btn no-print" onclick="window.print()">Save as PDF</button>
  </div>

  <div class="score-section">
    <div class="score-circle">
      <div class="score-num">${sc.current}</div>
      <div class="score-label">Wellness Score out of 100</div>
      <div>
        <span class="grade">${sc.grade}</span>
        <span class="change ${sc.change >= 0 ? 'up' : 'down'}">${sc.change >= 0 ? '\u2191' : '\u2193'} ${Math.abs(sc.change)} from last week</span>
      </div>
    </div>
  </div>

  <div class="metrics">
    <div class="metric"><div class="val">${s.total_focus_hours}h</div><div class="lbl">Focus Time</div></div>
    <div class="metric"><div class="val">${s.breaks_per_day}</div><div class="lbl">Breaks / Day</div></div>
    <div class="metric"><div class="val">${s.hydration_avg_ml}/${s.hydration_goal_ml} ml</div><div class="lbl">Hydration Avg</div></div>
    <div class="metric"><div class="val" style="text-transform:capitalize">${s.mood_trend}</div><div class="lbl">Mood Trend</div></div>
  </div>

  <div class="section">
    <h2>Daily Wellness Scores</h2>
    ${dailyBars}
  </div>

  <div class="section">
    <h2>Emotional Wellness</h2>
    ${emotionHTML}
  </div>

  <div class="section">
    <h2>Self-Care Progress</h2>
    ${selfCareRows}
  </div>

  ${heatmapHTML}
  ${cycleHTML}

  <div class="section">
    <h2>Key Insights</h2>
    ${insightHTML}
  </div>

  <div class="section">
    <h2>Personalized Recommendations</h2>
    ${recsHTML}
  </div>

  ${report.affirmation ? `<div class="affirmation"><div class="label">Your Weekly Affirmation</div><div class="text">\u201C${report.affirmation}\u201D</div></div>` : ''}

  <div class="footer">
    Generated by Infinite Helix \u00b7 AI-Powered Wellness Assistant for Women<br>
    \u00a9 ${new Date().getFullYear()} \u00b7 This report is private and confidential. Share only at your discretion.
  </div>
</body>
</html>`;
}
