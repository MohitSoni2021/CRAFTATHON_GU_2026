import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { computeAdherenceScore, getDailyBreakdown, detectPatterns } from './adherence.service';

export const getScore = async (req: AuthRequest, res: Response) => {
  try {
    const data = await computeAdherenceScore(req.user!.id);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDaily = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getDailyBreakdown(req.user!.id);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getWeekly = async (req: AuthRequest, res: Response) => {
  try {
    const daily = await getDailyBreakdown(req.user!.id, 84); // 12 weeks
    // Group by ISO week
    const byWeek: Record<string, any[]> = {};
    for (const day of daily) {
      const d = new Date(day.date);
      const week = `${d.getFullYear()}-W${String(Math.ceil((d.getDate()) / 7)).padStart(2,'0')}`;
      if (!byWeek[week]) byWeek[week] = [];
      byWeek[week].push(day);
    }
    const data = Object.entries(byWeek).map(([week, days]) => ({
      week,
      score: Math.round(days.reduce((s, d) => s + d.score, 0) / days.length),
      taken: days.reduce((s, d) => s + d.taken, 0),
      missed: days.reduce((s, d) => s + d.missed, 0),
    }));
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatterns = async (req: AuthRequest, res: Response) => {
  try {
    const data = await detectPatterns(req.user!.id);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRisk = async (req: AuthRequest, res: Response) => {
  try {
    const { riskLevel, score, currentStreak } = await computeAdherenceScore(req.user!.id);
    res.json({ success: true, data: { riskLevel, score, currentStreak } });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
