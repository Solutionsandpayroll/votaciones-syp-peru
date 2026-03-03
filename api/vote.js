import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { nombre, candidatoId } = req.body

  if (!nombre || !candidatoId) {
    return res.status(400).json({ error: 'Nombre y candidatoId son requeridos' })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)

    // Verificar que el candidato existe
    const candidatoExists = await sql`
      SELECT candidato_id FROM resultados WHERE candidato_id = ${candidatoId}
    `
    if (candidatoExists.length === 0) {
      return res.status(400).json({ error: 'Candidato no válido' })
    }

    // Verificar que el votante no haya votado
    const yaVoto = await sql`
      SELECT id FROM votantes
      WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(${nombre}))
      LIMIT 1
    `
    if (yaVoto.length > 0) {
      return res.status(409).json({ error: 'Este usuario ya ha votado' })
    }

    // Registrar el votante (solo nombre y timestamp — sin candidato)
    await sql`
      INSERT INTO votantes (nombre) VALUES (${nombre})
    `

    // Incrementar el contador del candidato (sin nombre del votante)
    await sql`
      UPDATE resultados
      SET total_votos = total_votos + 1
      WHERE candidato_id = ${candidatoId}
    `

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error registrando voto:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
