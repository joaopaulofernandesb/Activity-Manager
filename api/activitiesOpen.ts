
import { Request, Response } from 'express';
import connectDB from '../config/database';
import Activity from '../model/activity';

export default async function handler(req: Request, res: Response) {
  await connectDB();

  try {
    const openActivities = await Activity.find({ endTime: null });

    if (openActivities.length === 0) {
      return res.json({ message: 'Nenhuma atividade em aberto.' });
    }

    return res.json(openActivities);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar atividades em aberto.' });
  }
}
