import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)

    const historial = await sql`
      SELECT nombre, fecha_hora
      FROM votantes
      ORDER BY fecha_hora ASC
    `

    const data = historial.map(v => ({
      nombre: v.nombre,
      fechaHora: v.fecha_hora
    }))

    return res.status(200).json({ historial: data, total: data.length })
  } catch (error) {
    console.error('Error obteniendo historial:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
