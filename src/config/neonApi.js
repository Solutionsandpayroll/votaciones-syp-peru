/**
 * Cliente frontend para comunicarse con las API routes de Vercel
 * Las credenciales de Neon NUNCA llegan al navegador — viven en el servidor
 */

/**
 * Verifica si un votante ya ha votado
 * @param {string} nombre
 * @returns {Promise<{ hasVoted: boolean }>}
 */
export async function checkIfUserVoted(nombre) {
  try {
    const res = await fetch('/api/check-voter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Error verificando votante:', error)
    return { hasVoted: false, error: error.message }
  }
}

/**
 * Registra un voto en Neon
 * - Inserta el nombre del votante en la tabla `votantes`
 * - Incrementa el contador en la tabla `resultados`
 * - Nunca vincula votante con candidato en la BD
 * @param {string} nombre
 * @param {number} candidatoId
 * @returns {Promise<{ success: boolean }>}
 */
export async function registrarVoto(nombre, candidatoId) {
  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, candidatoId })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    return { success: true }
  } catch (error) {
    console.error('Error registrando voto:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene los resultados actuales
 * @returns {Promise<{ resultados: Array, totalVotos: number }>}
 */
export async function obtenerResultados() {
  try {
    const res = await fetch('/api/results')
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Error obteniendo resultados:', error)
    return { resultados: [], totalVotos: 0 }
  }
}

/**
 * Obtiene el historial de votantes
 * @returns {Promise<{ historial: Array, total: number }>}
 */
export async function obtenerHistorial() {
  try {
    const res = await fetch('/api/history')
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Error obteniendo historial:', error)
    return { historial: [], total: 0 }
  }
}
