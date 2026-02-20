# 🔒 Configuración de Variables de Entorno

Este archivo explica cómo configurar las variables de entorno para conectar con Power Automate.

---

## ⚠️ IMPORTANTE: Seguridad

Las URLs de Power Automate contienen **tokens de acceso secretos** que NO deben compartirse públicamente ni subirse a GitHub.

❌ **NO hacer:**
- Subir el archivo `.env` a GitHub
- Compartir las URLs en chat, email o documentos públicos
- Hardcodear las URLs directamente en el código

✅ **SÍ hacer:**
- Mantener las URLs en el archivo `.env` (ya está en `.gitignore`)
- Usar el archivo `.env.example` como plantilla
- Compartir las URLs de forma segura (1Password, etc.)

---

## 📋 Configuración Inicial

### **1. Crear el archivo `.env`**

Copia el archivo `.env.example`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# O manualmente: copia .env.example y renómbralo a .env
```

### **2. Completar las URLs**

Abre `.env` y reemplaza los placeholders con tus URLs reales de Power Automate:

```env
VITE_POWER_AUTOMATE_VOTE_ENDPOINT=https://...tu-url-de-votacion...
VITE_POWER_AUTOMATE_CHECK_VOTER_ENDPOINT=https://...tu-url-de-verificacion...
```

### **3. Reiniciar el servidor de desarrollo**

Después de modificar `.env`, reinicia Vite:

```bash
# Detén el servidor (Ctrl+C) y vuelve a ejecutar:
npm run dev
```

---

## 🔑 Obtener las URLs de Power Automate

### **URL del flujo de votación:**
1. Ve a [Power Automate](https://make.powerautomate.com/)
2. Abre tu flujo de votación
3. Haz clic en el trigger **"When a HTTP request is received"**
4. Copia la **URL HTTP POST**
5. Pégala en `VITE_POWER_AUTOMATE_VOTE_ENDPOINT`

### **URL del flujo de verificación:**
1. Abre el flujo de verificación de votantes
2. Copia la **URL HTTP POST** del trigger
3. Pégala en `VITE_POWER_AUTOMATE_CHECK_VOTER_ENDPOINT`

---

## 🧪 Verificar la configuración

Para verificar que las variables se están cargando correctamente:

```javascript
// Temporalmente en consola del navegador:
console.log(import.meta.env.VITE_POWER_AUTOMATE_VOTE_ENDPOINT)
```

Si devuelve `undefined`, verifica:
- ✅ El archivo `.env` existe en la raíz del proyecto
- ✅ Las variables empiezan con `VITE_`
- ✅ Reiniciaste el servidor después de crear `.env`

---

## 🚀 Despliegue a Producción

Cuando despliegues a producción (Vercel, Netlify, etc.):

1. Ve a la configuración del proyecto
2. Busca **Environment Variables**
3. Agrega las dos variables:
   - `VITE_POWER_AUTOMATE_VOTE_ENDPOINT`
   - `VITE_POWER_AUTOMATE_CHECK_VOTER_ENDPOINT`
4. Redeploy

---

## 📝 Estructura de archivos

```
proyecto/
├── .env                    # ❌ NO subir (está en .gitignore)
├── .env.example           # ✅ Plantilla (SÍ subir)
├── .gitignore             # ✅ Incluye .env
└── src/
    └── config/
        └── powerAutomate.js  # ✅ Lee desde variables de entorno
```

---

## ❓ FAQ

### **¿Por qué usar variables de entorno?**
- 🔒 Seguridad: Los tokens no están en el código
- 🔄 Flexibilidad: Diferentes URLs para desarrollo/producción
- 👥 Colaboración: Cada dev tiene sus propias credenciales

### **¿Qué pasa si alguien clona el repo?**
- No tendrá el archivo `.env`
- Deberá crear su propio `.env` basándose en `.env.example`
- Necesitará sus propias URLs de Power Automate

### **¿Puedo regenerar las URLs?**
Sí, si sospechas que se compartieron accidentalmente:
1. Ve a Power Automate → Tu flujo
2. Edita el trigger
3. Guarda (se regenera la URL)
4. Actualiza tu `.env`

---

**✅ Configuración completada.** Las URLs ahora están seguras en `.env` y no se subirán a GitHub.
