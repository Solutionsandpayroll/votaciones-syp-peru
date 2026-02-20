# 🔌 Integración con Power Automate - Dos Tablas

## 📋 Configuración del Flujo en Power Automate

### 1️⃣ Crear el Flujo HTTP

1. Ve a [Power Automate](https://make.powerautomate.com/)
2. Crea un nuevo **Flujo de nube automatizado**
3. Nombra tu flujo: `"Sistema de Votación - Registro de Votos"`
4. Selecciona el trigger: **"When a HTTP request is received"**

---

### 2️⃣ Configurar el Trigger HTTP

En el trigger HTTP, haz clic en **"Generar a partir del ejemplo"** y pega este JSON:

```json
{
    "votante": {
        "nombreVotante": "Cristian Ferney Parada",
        "fecha": "16/02/2026",
        "hora": "15:30:45"
    },
    "candidato": {
        "candidatoNombre": "María García López",
        "candidatoId": 1
    }
}
```

Esto generará automáticamente el esquema correcto.

---

### 3️⃣ Preparar Excel con DOS Tablas

#### **Tabla 1: Votantes** (Hoja: "Votantes")

| Nombre Votante | Fecha | Hora |
|----------------|-------|------|
|                |       |      |

- Selecciona las celdas con encabezados
- Ve a **Insertar > Tabla**
- Nombra la tabla: `"TablaVotantes"`

#### **Tabla 2: Conteo de Votos** (Hoja: "Conteo")

| Candidato ID | Nombre Candidato | Total Votos |
|-------------|------------------|-------------|
| 1           | María García López | 0 |
| 2           | Jose Sergio Veintemilla | 0 |
| 3           | Ana Rodríguez Paz | 0 |
| 4           | Roberto Silva Morales | 0 |
| 5           | Patricia Flores Castro | 0 |

- **IMPORTANTE:** Agrega manualmente las filas de todos los candidatos con Total Votos = 0
- Selecciona todo (incluyendo datos)
- Ve a **Insertar > Tabla**
- Nombra la tabla: `"TablaConteo"`

---

### 4️⃣ Agregar Acción 1: Registrar Votante

1. Haz clic en **"+ Nuevo paso"**
2. Busca: **"Excel Online (Business)"**
3. Selecciona: **"Add a row into a table"**
4. Configura:
   - **Ubicación:** OneDrive for Business
   - **Biblioteca de documentos:** OneDrive
   - **Archivo:** Selecciona tu archivo Excel
   - **Tabla:** `TablaVotantes`

5. Mapea los campos:
   - **Nombre Votante** → `votante` → `nombreVotante`
   - **Fecha** → `votante` → `fecha`
   - **Hora** → `votante` → `hora`

---

### 5️⃣ Agregar Acción 2: Obtener fila del candidato

1. Haz clic en **"+ Nuevo paso"**
2. Busca: **"Excel Online (Business)"**
3. Selecciona: **"List rows present in a table"**
4. Configura:
   - **Ubicación:** OneDrive for Business
   - **Biblioteca de documentos:** OneDrive
   - **Archivo:** Tu archivo Excel
   - **Tabla:** `TablaConteo`
   - **Filter Query:** `Candidato ID eq ` + luego selecciona `candidato` → `candidatoId`
   - **Top Count:** `1`

---

### 6️⃣ Agregar Acción 3: Actualizar contador

1. Haz clic en **"+ Nuevo paso"**
2. Busca: **"Excel Online (Business)"**
3. Selecciona: **"Update a row"**
4. Configura:
   - **Ubicación:** OneDrive for Business
   - **Biblioteca de documentos:** OneDrive
   - **Archivo:** Tu archivo Excel
   - **Tabla:** `TablaConteo`
   - **Key Column:** `Candidato ID`
   - **Key Value:** Selecciona `candidato` → `candidatoId`

5. Mapea los campos:
   - **Candidato ID** → `candidato` → `candidatoId`
   - **Nombre Candidato** → `candidato` → `candidatoNombre`
   - **Total Votos** → Haz clic en el campo y construye esta expresión:
     ```
     add(items('Apply_to_each')?['Total Votos'], 1)
     ```
     O en modo visual: `Total Votos del resultado anterior + 1`

**Nota:** Power Automate creará automáticamente un "Apply to each" alrededor de esta acción. Esto es normal.

---

### 7️⃣ (Opcional) Agregar Respuesta

1. Después del "Apply to each", haz clic en **"+ Nuevo paso"**
2. Busca: **"Response"**
3. Configura:
   - **Status Code:** `200`
   - **Body:**
   ```json
   {
     "success": true,
     "message": "Voto registrado correctamente"
   }
   ```

---

### 8️⃣ Guardar y Obtener URL

1. Haz clic en **"Guardar"** (arriba a la derecha)
2. Vuelve al trigger HTTP
3. La URL ya está configurada en tu código

---

## 🧪 Probar la Integración

### JSON de Prueba:

```json
{
    "votante": {
        "nombreVotante": "Usuario Prueba",
        "fecha": "16/02/2026",
        "hora": "15:30:45"
    },
    "candidato": {
        "candidatoNombre": "María García López",
        "candidatoId": 1
    }
}
```

### Verificación:
1. ✅ En hoja "Votantes": Debe aparecer "Usuario Prueba" con fecha y hora
2. ✅ En hoja "Conteo": "María García López" debe tener Total Votos = 1

---

## 🔧 Configuración Avanzada

### Deshabilitar Power Automate temporalmente:

En `src/config/powerAutomate.js`:

```javascript
export const POWER_AUTOMATE_CONFIG = {
  endpoint: "tu-url-aqui",
  enabled: false // ← Cambiar a false
}
```

### Ver logs en consola del navegador:

Abre las **DevTools** (F12) y ve a la pestaña **Console** para ver:
- ✅ Éxitos: "Voto enviado a Power Automate"
- ❌ Errores: "Error al enviar voto a Power Automate"

---

## 📊 Estructura de Datos Enviados

Cada voto envía este objeto JSON con dos secciones:

```javascript
{
  // Datos del votante (Tabla Votantes)
  votante: {
    nombreVotante: "Cristian Ferney Parada",
    fecha: "16/02/2026",
    hora: "15:30:45"
  },
  // Datos del candidato (Tabla Conteo)
  candidato: {
    candidatoNombre: "María García López",
    candidatoId: 1
  }
}
```

### Flujo de Datos:

```
1. Se envía el voto
   ↓
2. Tabla "Votantes" → Agrega nueva fila
   ↓
3. Tabla "Conteo" → Busca candidato por ID
   ↓
4. Incrementa "Total Votos" en +1
```

---

## ⚠️ Notas Importantes

1. **Tolerancia a fallos:** Si Power Automate falla, el voto se registra localmente de todos modos
2. **Sin duplicados:** Se verifica que el usuario no haya votado antes
3. **Asíncrono:** El envío no bloquea la interfaz
4. **CORS:** Power Automate maneja CORS automáticamente

---

## 🔐 Seguridad

### Proteger el Endpoint (Opcional):

1. En Power Automate, ve al trigger HTTP
2. Habilita **"Require authentication"**
3. Configura autenticación con **Azure AD** o **API Key**

### Límites de Llamadas:

- **Power Automate Free:** ~750 ejecuciones/mes
- **Power Automate Premium:** ~30,000 ejecuciones/mes

---

## 📱 Troubleshooting

### Error: "Network Error"
- Verifica que la URL esté correcta
- Asegúrate de que el flujo esté activado
- Revisa las políticas de firewall

### Error: "400 Bad Request"
- Verifica el esquema JSON del trigger
- Confirma los nombres de los campos

### Votos no aparecen en Excel
- Verifica que la tabla tenga el nombre correcto
- Confirma que los nombres de columnas sean exactos
- Revisa el historial de ejecuciones del flujo

---

## ✅ Checklist de Configuración

- [ ] Flujo creado en Power Automate
- [ ] Trigger HTTP configurado con el esquema correcto
- [ ] Excel creado con **DOS hojas:** "Votantes" y "Conteo"
- [ ] Tabla "TablaVotantes" creada con columnas: Nombre Votante, Fecha, Hora
- [ ] Tabla "TablaConteo" creada con columnas: Candidato ID, Nombre Candidato, Total Votos
- [ ] **Importante:** Los 5 candidatos agregados manualmente en TablaConteo con Total Votos = 0
- [ ] Acción "Add a row" agregada para TablaVotantes
- [ ] Acción "List rows present in a table" agregada para TablaConteo (con filtro por ID)
- [ ] Acción "Update a row" agregada con fórmula de incremento
- [ ] URL del endpoint ya está en `powerAutomate.js`
- [ ] Flujo guardado y activado
- [ ] Prueba manual realizada desde Power Automate
- [ ] Verificación: Votante aparece en hoja "Votantes"
- [ ] Verificación: Contador incrementa en hoja "Conteo"
- [ ] Prueba funcional desde la aplicación React

---

## 📸 Vista del Flujo en Power Automate

Tu flujo debe verse así:

```
1. [Trigger] When a HTTP request is received
   ↓
2. [Excel] Add a row into a table (TablaVotantes)
   ↓
3. [Excel] List rows present in a table (TablaConteo)
   └─ Filter Query: Candidato ID eq [candidatoId]
   ↓
4. [Control] Apply to each
   └─ [Excel] Update a row (TablaConteo)
      └─ Total Votos = add(current Total Votos, 1)
   ↓
5. [Response] Status 200 (Opcional)
```

---

## 🎯 Ventajas de Usar Dos Tablas

✅ **Tabla Votantes:** Registro histórico completo de quién votó y cuándo  
✅ **Tabla Conteo:** Resultados consolidados y fáciles de visualizar  
✅ **Performance:** Búsqueda rápida por ID de candidato  
✅ **Escalabilidad:** Ambas tablas crecen de forma independiente  
✅ **Reporting:** Fácil crear gráficos desde la tabla de conteo  

---

**¡Listo!** Tu sistema de votación ahora está integrado con Power Automate. 🎉
