from datetime import datetime, timedelta


class WellnessReportService:
    """Generates weekly wellness reports with women-focused insights."""

    def generate_weekly(self, user_id):
        today = datetime.now()
        monday = today - timedelta(days=today.weekday())
        friday = monday + timedelta(days=4)

        return {
            'period': {
                'start': monday.strftime('%Y-%m-%d'),
                'end': friday.strftime('%Y-%m-%d'),
                'label': f"{monday.strftime('%b %d')} — {friday.strftime('%b %d, %Y')}",
            },
            'wellness_score': {
                'current': 78,
                'previous': 72,
                'change': 6,
                'grade': 'B+',
            },
            'summary': {
                'total_focus_hours': 30.6,
                'avg_daily_focus': 6.1,
                'total_breaks': 24,
                'breaks_per_day': 4.8,
                'avg_break_interval_min': 72,
                'hydration_avg_ml': 1300,
                'hydration_goal_ml': 2000,
                'mood_trend': 'improving',
                'top_emotion': 'joy',
                'journal_entries': 5,
                'streak_days': 7,
            },
            'daily_scores': [
                {'day': 'Mon', 'score': 72, 'mood': 'focused'},
                {'day': 'Tue', 'score': 68, 'mood': 'neutral'},
                {'day': 'Wed', 'score': 81, 'mood': 'joy'},
                {'day': 'Thu', 'score': 85, 'mood': 'focused'},
                {'day': 'Fri', 'score': 76, 'mood': 'neutral'},
            ],
            'work_hours': {
                'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                'focus': [6.2, 5.8, 7.1, 6.5, 5.0],
                'breaks': [0.8, 1.0, 0.6, 0.9, 1.2],
            },
            'emotion_distribution': {
                'joy': 35,
                'neutral': 28,
                'sadness': 12,
                'surprise': 10,
                'anger': 8,
                'fear': 7,
            },
            'stress_heatmap': {
                'days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                'hours': ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
                'data': [
                    [2, 3, 5, 4, 2, 3, 6, 5, 3],
                    [1, 2, 4, 3, 2, 4, 5, 4, 2],
                    [3, 4, 6, 7, 3, 5, 7, 6, 4],
                    [2, 3, 5, 4, 2, 3, 4, 3, 2],
                    [1, 2, 3, 2, 1, 2, 3, 2, 1],
                ],
            },
            'self_care': {
                'hydration': {
                    'avg_ml': 1300,
                    'goal_ml': 2000,
                    'completion_pct': 65,
                    'best_day': 'Thursday',
                    'total_ml': 6500,
                },
                'breaks': {
                    'total': 24,
                    'avg_interval_min': 72,
                    'ideal_interval': 90,
                    'compliance_pct': 80,
                },
                'stretches': {
                    'done': 18,
                    'suggested': 25,
                    'compliance_pct': 72,
                },
                'eye_rest': {
                    'done': 22,
                    'suggested': 30,
                    'compliance_pct': 73,
                },
            },
            'cycle_insights': {
                'enabled': True,
                'current_phase': 'follicular',
                'phase_scores': {
                    'menstrual': 62,
                    'follicular': 78,
                    'ovulatory': 85,
                    'luteal': 68,
                },
                'tip': "You're in your follicular phase \u2014 energy and creativity are rising. This is a great time to tackle challenging projects, brainstorm new ideas, and schedule important presentations.",
            },
            'insights': [
                {
                    'type': 'achievement',
                    'title': 'Focus Champion',
                    'detail': 'Your focus sessions increased by 15% this week. Morning deep work (9\u201311 AM) was your superpower \u2014 you completed 68% of high-priority tasks during this window.',
                },
                {
                    'type': 'improvement',
                    'title': 'Hydration Needs Love',
                    'detail': 'You averaged 1300 ml/day vs your 2000 ml goal (65%). Try keeping a water bottle at your desk \u2014 your best day was Thursday when you hit 1750 ml.',
                },
                {
                    'type': 'positive',
                    'title': 'Healthy Break Rhythm',
                    'detail': 'You took breaks every 72 minutes on average \u2014 approaching the ideal 90-minute ultradian cycle. Your afternoon breaks especially helped reduce stress levels.',
                },
                {
                    'type': 'tip',
                    'title': 'Energy Peak Mapping',
                    'detail': 'Your data shows peak focus at 9\u201311 AM and 2\u20133 PM. Wednesday showed elevated stress \u2014 consider a lighter meeting schedule mid-week.',
                },
            ],
            'recommendations': [
                {
                    'category': 'Morning Routine',
                    'tip': 'Start with 5 minutes of mindfulness before diving into work. Your data shows 23% better focus on days you began with a journal entry.',
                },
                {
                    'category': 'Afternoon Recovery',
                    'tip': 'Your stress peaks post-lunch (1\u20132 PM). A 5-minute walk or stretching session can reduce cortisol and boost afternoon productivity.',
                },
                {
                    'category': 'Emotional Check-in',
                    'tip': 'Journal at least once daily \u2014 your emotional clarity scores are 30% higher on days you write. Even a single sentence counts.',
                },
                {
                    'category': 'Work Boundaries',
                    'tip': 'You logged screen time after 6 PM on 3 days. Setting a gentle wind-down alarm can help protect your evening recovery time.',
                },
            ],
            'affirmation': "You showed remarkable consistency this week, balancing focus and self-care with grace. Remember \u2014 sustainable success comes from honoring both your ambitions and your well-being. Every break you took, every glass of water, every moment of self-awareness is an investment in the incredible woman you're becoming. Keep listening to your body and mind. You're doing beautifully. \U0001f49c",
        }

    def calculate_score(self, metrics):
        weights = {
            'focus_time': 0.25,
            'break_balance': 0.20,
            'hydration': 0.15,
            'mood_stability': 0.15,
            'screen_time': 0.10,
            'stretch_compliance': 0.15,
        }

        score = 0
        for key, weight in weights.items():
            value = metrics.get(key, 50)
            score += value * weight

        return min(100, max(0, round(score)))
