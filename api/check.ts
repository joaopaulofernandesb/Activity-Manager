import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
       // Adicionar cabeçalhos CORS
   res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todas as origens
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Métodos permitidos
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Cabeçalhos permitidos
 
   // Verifica se é uma requisição OPTIONS (pré-flight request para CORS)
   if (req.method === 'OPTIONS') {
     return res.status(200).end(); // Responder imediatamente a requisições OPTIONS
   }
  const { method } = req;

  if (method === 'GET') {
    return res.status(200).json({
      message: 'API is running!',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${method} não permitido`);
  }
}
