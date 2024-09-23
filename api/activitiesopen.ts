
import { Request, Response } from 'express';
import connectDB from '../config/database';
import Activity from '../model/activity';


export default async function handler(req: Request, res: Response) {
   // Adicionar cabeçalhos CORS
 res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todas as origens
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS'); // Métodos permitidos
 res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Cabeçalhos permitidos

 // Verifica se é uma requisição OPTIONS (pré-flight request para CORS)
 if (req.method === 'OPTIONS') {
   return res.status(200).end(); // Responder imediatamente a requisições OPTIONS
 }
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

