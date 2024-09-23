import { Request, Response } from 'express';
import connectDB from '../config/database';
import Activity from '../model/activity';

// Função para obter a data atual em UTC-3 (Brasil/São Paulo)
function getBrazilTime() {
  const now = new Date();
  const utcOffset = now.getTimezoneOffset(); // Offset em minutos da UTC
  const brazilOffset = -180; // UTC-3 é igual a -180 minutos
  const localTime = new Date(now.getTime() + (brazilOffset - utcOffset) * 60000);
  return localTime;
}

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

      // Definir o horário de início em UTC-3 (Brasil/São Paulo)
      const startTime = getBrazilTime();
      console.log(`Start Time (UTC-3):`, startTime);

      const activity = new Activity({
        type,
        cardId,
        startTime,
        endTime: null, // Final será adicionado depois
      });
      try {
        await activity.save();
        return res.status(201).json(activity);
      } catch (error) {
        console.error('Erro ao salvar atividade', error);
        return res.status(500).json({ error: 'Erro ao salvar atividade' });
      }
    }
    case 'PUT': {
      const { id } = req.query;
      try {
        const activity = await Activity.findById(id);
        if (!activity) return res.status(404).json({ error: 'Atividade não encontrada' });

        // Definir o horário de término em UTC-3 (Brasil/São Paulo)
        const endTime = getBrazilTime();
        console.log(`End Time (UTC-3):`, endTime);

        activity.endTime = endTime;
        await activity.save();
        return res.json(activity);
      } catch (error) {
        console.error('Erro ao atualizar atividade', error);
        return res.status(500).json({ error: 'Erro ao atualizar atividade' });
      }
    }
    case 'GET': {
      const { date } = req.query;
      if (!date) return res.status(400).json({ error: 'Data não fornecida' });

      // Garantir que a data de busca seja baseada no fuso horário UTC-3
      const selectedDate = new Date(`${date}T00:00:00-03:00`); // Forçar UTC-3 no início do dia
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1); // Próximo dia

      try {
        const activities = await Activity.find({
          startTime: { $gte: selectedDate, $lt: nextDay },
          endTime: { $ne: null }, // Apenas atividades com endTime
        });

        const activitiesWithDuration = activities.map(activity => {
          const startTime = new Date(activity.startTime);
          const endTime = new Date(activity.endTime);

          const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
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
      res.setHeader('Allow', ['POST', 'PUT', 'GET', 'OPTIONS']); // Corrigido o uso de 'OPTIONS' como string
      return res.status(405).end(`Método ${method} não permitido`);
    }
  }
}
