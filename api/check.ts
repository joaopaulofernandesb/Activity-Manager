import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
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
