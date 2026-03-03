import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { nombre } = req.body

  if (!nombre) {
    return res.status(400).json({ error: 'Nombre requerido' })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)

    const result = await sql`
      SELECT id FROM votantes
      WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(${nombre}))
      LIMIT 1
    `

    return res.status(200).json({ hasVoted: result.length > 0 })
  } catch (error) {
    console.error('Error verificando votante:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
