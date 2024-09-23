import { Request, Response } from 'express';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import connectDB from '../config/database';
import Activity from '../model/activity';

dayjs.extend(utc);
dayjs.extend(timezone);

// Definir o fuso horário a partir da variável de ambiente ou usar 'America/Sao_Paulo' como padrão
const timeZone = process.env.TIMEZONE || 'America/Sao_Paulo';

export default async function handler(req: Request, res: Response) {
  // Adicionar cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Verifica se é uma requisição OPTIONS (pré-flight request para CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  const { method } = req;

  switch (method) {
    case 'POST': {
      const { type, cardId } = req.body;

      // Usar o timeZone vindo da variável de ambiente
      const startTime = dayjs().tz(timeZone).toDate();
      console.log(`Start Time (${timeZone}):`, startTime);

      const activity = new Activity({
        type,
        cardId,
        startTime,
        endTime: null,
      });
      try {
        await activity.save();
        return res.status(201).json(activity);
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao salvar atividade' });
      }
    }
    case 'PUT': {
      const { id } = req.query;
      try {
        const activity = await Activity.findById(id);
        if (!activity) return res.status(404).json({ error: 'Atividade não encontrada' });

        const endTime = dayjs().tz(timeZone).toDate();
        console.log(`End Time (${timeZone}):`, endTime);

        activity.endTime = endTime;
        await activity.save();
        return res.json(activity);
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao atualizar atividade' });
      }
    }
    case 'GET': {
      const { date } = req.query;
      if (!date) return res.status(400).json({ error: 'Data não fornecida' });

      const selectedDate = dayjs(date as string).tz(timeZone).startOf('day');
      const nextDay = selectedDate.add(1, 'day');

      try {
        const activities = await Activity.find({
          startTime: { $gte: selectedDate.toDate(), $lt: nextDay.toDate() },
          endTime: { $ne: null },
        });

        const activitiesWithDuration = activities.map(activity => {
          const startTime = dayjs(activity.startTime).tz(timeZone);
          const endTime = dayjs(activity.endTime).tz(timeZone);

          const durationSeconds = endTime.diff(startTime, 'second');
          const hours = Math.floor(durationSeconds / 3600);
          const minutes = Math.floor((durationSeconds % 3600) / 60);
          const seconds = durationSeconds % 60;

          let formattedDuration = '';
          if (hours > 0) formattedDuration += `${hours}h `;
          if (minutes > 0 || hours > 0) formattedDuration += `${minutes}m `;
          formattedDuration += `${seconds}s`;

          return {
            ...activity._doc,
            duration: durationSeconds,
            formattedDuration: formattedDuration.trim(),
          };
        });

        return res.json(activitiesWithDuration);
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar atividades' });
      }
    }
    default: {
      res.setHeader('Allow', ['POST', 'PUT', 'GET', 'OPTIONS']);
      return res.status(405).end(`Método ${method} não permitido`);
    }
  }
}
