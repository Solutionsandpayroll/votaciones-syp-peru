# Sistema de Votación — S&P Perú

Plataforma web de votación para la elección del Supervisor SST 2026–2028. Garantiza un voto individual, secreto e irrepetible por trabajador. Desarrollada con React + Vercel + Neon PostgreSQL.

## Características

- Autenticación por nombre de trabajador (lista predefinida)
- Verificación en tiempo real — bloquea el acceso si el trabajador ya votó
- Voto secreto garantizado por diseño de base de datos (dos tablas sin relación)
- Prevención de voto duplicado validada del lado del servidor
- Resultados en tiempo real con actualización cada 10 segundos
- Página de resultados protegida con contraseña de administrador
- Exportación de resultados a PDF directamente desde el navegador
- Diseño responsivo — funciona en escritorio y móvil

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router 6 |
| Hosting | Vercel |
| Base de datos | Neon PostgreSQL |
| API / Backend | Vercel Serverless Functions (`api/`) |
| Código fuente | GitHub |

## Estructura del Proyecto

```
.
├── api/                      # Serverless functions (ejecutadas en Vercel)
│   ├── check-voter.js        # Verifica si un trabajador ya votó
│   ├── vote.js               # Registra el voto (atómico: votante + contador)
│   ├── results.js            # Devuelve resultados con porcentajes
│   └── history.js            # Devuelve historial de participantes
│
├── src/
│   ├── components/           # Componentes reutilizables (Card, CandidateCard...)
│   ├── config/
│   │   └── neonApi.js        # Cliente frontend que llama a /api/*
│   ├── context/
│   │   └── VotingContext.jsx # Estado global de la sesión de voto
│   ├── data/
│   │   └── candidates.js     # Datos de los candidatos
│   ├── pages/
│   │   ├── Login.jsx         # Selección de trabajador + acceso a resultados
│   │   ├── Voting.jsx        # Pantalla de selección de candidato
│   │   ├── Confirmation.jsx  # Confirmación del voto
│   │   └── Results.jsx       # Dashboard de resultados en tiempo real
│   └── main.jsx
│
├── public/                   # Imágenes y assets estáticos
├── vercel.json               # Configuración de rutas Vercel
├── .env                      # Variables de entorno locales (no en git)
└── index.html
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (ver `.env.example`):

```env
# Conexión a Neon PostgreSQL — solo disponible en el servidor
DATABASE_URL=postgresql://...

# Contraseña para acceder a la página de resultados (accesible en el navegador)
VITE_RESULTS_PASSWORD=tu_contraseña_segura
```

> `DATABASE_URL` **nunca** se expone al navegador. Solo la usan las funciones serverless en `api/`.

## Instalación y Desarrollo Local

```bash
# Instalar dependencias
npm install

# Instalar Vercel CLI (una sola vez)
npm install -g vercel

# Iniciar servidor local con soporte completo de API
vercel dev
```

> Usar `vercel dev` en lugar de `npm run dev` para que las rutas `/api/*` funcionen localmente.

## Base de Datos — Esquema

Dos tablas en Neon PostgreSQL, sin ninguna relación entre ellas (garantía de anonimidad):

```sql
-- Registra quién participó (sin indicar por quién votó)
CREATE TABLE votantes (
  id         SERIAL PRIMARY KEY,
  nombre     TEXT NOT NULL,
  fecha_hora TIMESTAMP DEFAULT NOW()
);

-- Cuenta votos por candidato (sin identificar al votante)
CREATE TABLE resultados (
  candidato_id     INTEGER PRIMARY KEY,
  candidato_nombre TEXT NOT NULL,
  total_votos      INTEGER DEFAULT 0
);
```

## Flujo de Votación

1. El trabajador selecciona su nombre en la pantalla de acceso.
2. El sistema consulta `/api/check-voter` — si ya votó, bloquea el acceso.
3. El trabajador elige su candidato y confirma.
4. `/api/vote` inserta el nombre en `votantes` e incrementa el contador en `resultados` de forma atómica.
5. El trabajador ve la pantalla de confirmación. El acceso queda bloqueado definitivamente.

## Resultados

El administrador accede desde la pantalla de login usando la contraseña configurada en `VITE_RESULTS_PASSWORD`. La vista muestra:

- Votos y porcentaje por candidato
- Historial de trabajadores que participaron (sin indicar su voto)
- Botón para exportar a PDF

## Despliegue en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Agregar las variables de entorno en el panel de Vercel:
   - `DATABASE_URL` (sin prefijo VITE_)
   - `VITE_RESULTS_PASSWORD`
3. Vercel desplegará automáticamente en cada `git push` a `main`.
