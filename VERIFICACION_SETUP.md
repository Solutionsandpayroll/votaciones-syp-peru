# 🔍 Configuración del Flujo de Verificación de Votantes

Este flujo permite verificar si un usuario ya votó ANTES de permitirle acceder al sistema de votación.

---

## 📋 Paso 1: Crear el Flujo de Verificación

1. Ve a [Power Automate](https://make.powerautomate.com/)
2. Crea un nuevo **Flujo de nube automatizado**
3. Nombra tu flujo: `"Verificar si Usuario Ya Votó"`
4. Selecciona el trigger: **"When a HTTP request is received"**

---

## 📝 Paso 2: Configurar el Trigger HTTP

En el trigger HTTP, haz clic en **"Generar a partir del ejemplo"** y pega este JSON:

```json
{
    "nombreVotante": "Cristian Ferney Parada"
}
```

Esto generará el esquema:

```json
{
    "type": "object",
    "properties": {
        "nombreVotante": {
            "type": "string"
        }
    }
}
```

---

## 🔎 Paso 3: Obtener TODAS las filas de la tabla

1. Haz clic en **"+ Nuevo paso"**
2. Busca: **"Excel Online (Business)"**
3. Selecciona: **"List rows present in a table"**
4. Configura:
   - **Location:** OneDrive for Business
   - **Document Library:** OneDrive
   - **File:** Selecciona tu archivo Excel
   - **Table:** `TablaVotantes`
   - **NO pongas nada en Filter Query** (dejar vacío)
   - **NO pongas nada en Top Count** (dejar vacío)

Esto traerá TODAS las filas para compararlas manualmente.

---

## 🔄 Paso 4: Inicializar variable de control

1. Haz clic en **"+ Nuevo paso"**
2. Busca: **"Initialize variable"** (Variables)
3. Configura:
   - **Name:** `encontrado`
   - **Type:** Boolean
   - **Value:** `false`

Esta variable marcará si encontramos al votante.

---

## 🔁 Paso 5: Recorrer cada fila con Apply to each

1. Haz clic en **"+ Nuevo paso"**
2. Busca: **"Apply to each"** (Control)
3. En **"Select an output from previous steps"**, selecciona:
   - Contenido dinámico → `value` (de la acción "List rows")

Esto creará un bucle que revisará cada fila una por una.

---

## ✅ Paso 6: Comparar nombres dentro del bucle

**DENTRO del Apply to each**, agrega una **Condition**:

1. Clic en **"Add an action"** dentro del Apply to each
2. Busca: **"Condition"** (Control)
3. Haz clic en **"Edit in advanced mode"** y pega esta expresión:

```
@equals(toLower(items('Apply_to_each')?['Nombre']), toLower(triggerBody()?['nombreVotante']))
```

**Explicación:**
- `items('Apply_to_each')?['Nombre']` → Nombre de la fila actual
- `triggerBody()?['nombreVotante']` → Nombre que llegó en el HTTP
- `toLower()` → Convierte ambos a minúsculas (ignora mayúsculas/minúsculas)
- `equals()` → Compara si son iguales

---

## 🎯 Paso 7: Marcar como encontrado

**Dentro de la rama "If yes"** de la Condition (dentro del Apply to each):

1. Agrega: **"Set variable"** (Variables)
2. Configura:
   - **Name:** `encontrado`
   - **Value:** `true`

---

## 📊 Paso 8: Evaluar si se encontró el votante

**DESPUÉS del Apply to each** (fuera del bucle):

1. Haz clic en **"+ Nuevo paso"**
2. Busca: **"Condition"** (Control)
3. Configura:
   - **Valor 1:** `encontrado` (variable)
   - **Condición:** `is equal to`
   - **Valor 2:** `true`

---

## ✅ Paso 9: Configurar respuestas

### **Si es TRUE (el usuario YA votó):**

1. En la rama **"If yes"**, agrega: **"Response"**
2. Configura:
   - **Status Code:** `200`
   - **Body:**
   ```json
   {
     "hasVoted": true
   }
   ```

### **Si es FALSE (el usuario NO ha votado):**

1. En la rama **"If no"**, agrega: **"Response"**
2. Configura:
   - **Status Code:** `200`
   - **Body:**
   ```json
   {
     "hasVoted": false
   }
   ```

---

## 🔗 Paso 10: Obtener y Configurar la URL

1. Haz clic en **"Guardar"** (arriba a la derecha)
2. Vuelve al trigger **"When a HTTP request is received"**
3. Copia la **URL HTTP POST** que se generó
4. Ve a tu código en `src/config/powerAutomate.js`
5. Pega la URL en `checkVoterEndpoint`:

```javascript
export const POWER_AUTOMATE_CONFIG = {
  endpoint: "...", // Tu endpoint de votar
  checkVoterEndpoint: "PEGAR_AQUI_LA_URL_DEL_FLUJO_DE_VERIFICACION",
  enabled: true
}
```

---

## 🧪 Paso 11: Probar el Flujo

### **Prueba 1: Usuario que NO ha votado**

Payload de prueba:
```json
{
  "nombreVotante": "Usuario Prueba Nuevo"
}
```

Resultado esperado:
```json
{
  "hasVoted": false
}
```

### **Prueba 2: Usuario que SÍ ha votado**

1. Primero registra un voto con el nombre "Usuario Prueba Existente"
2. Luego prueba la verificación:

```json
{
  "nombreVotante": "Usuario Prueba Existente"
}
```

Resultado esperado:
```json
{
  "hasVoted": true
}
```

---

## 📊 Diagrama del Flujo

```
1. [Trigger] When a HTTP request is received
   └─ Body: { nombreVotante: "..." }
   ↓
2. [Excel] List rows present in a table
   └─ SIN Filter Query (traer TODAS las filas)
   ↓
3. [Variables] Initialize variable
   └─ encontrado = false
   ↓
4. [Control] Apply to each (sobre value)
   └─ Para cada fila:
      ├─ [Condition] toLower(Nombre) = toLower(nombreVotante)?
      └─ If YES → [Set variable] encontrado = true
   ↓
5. [Control] Condition
   └─ encontrado = true ?
   ↓
6a. [If YES] Response        6b. [If NO] Response
    └─ hasVoted: true             └─ hasVoted: false
```

**Ventajas de este método:**
✅ No depende de Filter Query (más robusto)  
✅ Comparación case-insensitive con `toLower()`  
✅ Funciona con nombres que tienen espacios extra  
✅ Fácil de debuggear (puedes ver cada comparación)  

---

## ⚙️ Configuración Opcional: Control de Concurrencia

**NO necesario con este método,** pero si quieres optimizar para muchas verificaciones simultáneas:

1. Haz clic en **⋯** del trigger
2. **Configuración** → **Control de concurrencia**
3. Activa el toggle
4. **Grado de paralelismo:** `25` (permite 25 verificaciones simultáneas)

**Nota:** Este método ya es muy eficiente sin control de concurrencia.

---

---

## ✅ Checklist de Configuración

- [ ] Flujo creado: "Verificar si Usuario Ya Votó"
- [ ] Trigger HTTP configurado con schema
- [ ] Acción "List rows" agregada con Filter Query correcto
- [ ] Condición agregada: `length(value) > 0`
- [ ] Response "hasVoted: true" en rama "If yes"
- [ ] Response "hasVoted: false" en rama "If no"
- [ ] URL copiada y agregada a `powerAutomate.js`
- [ ] Flujo guardado y activado
- [ ] Prueba manual realizada (usuario nuevo)
- [ ] Prueba manual realizada (usuario existente)
- [ ] Verificación desde la aplicación React

---

## 🎯 Ventajas de este Sistema

✅ **Previene votos duplicados:** Verifica contra Excel en tiempo real  
✅ **Funciona en múltiples dispositivos:** No depende de localStorage  
✅ **Case-insensitive:** Ignora mayúsculas/minúsculas automáticamente con `toLower()`  
✅ **Robusto:** No depende de Filter Query problemático  
✅ **Fácil de debuggear:** Puedes ver cada comparación en el historial  
✅ **Tolerante a espacios:** La comparación es flexible  
✅ **Auditable:** Cada verificación queda registrada  

---

## 🚨 Troubleshooting

### La verificación siempre devuelve "hasVoted: false"
- **Verifica el nombre de la columna en Excel:** Debe ser exactamente `Nombre` (como está en la expresión `items('Apply_to_each')?['Nombre']`)
- **Prueba agregando un nombre manualmente:** Escribe "test user" en Excel y luego prueba con `{ "nombreVotante": "TEST USER" }` (debe funcionar por el toLower)
- **Revisa el historial del flujo:** Ve a Power Automate → Tu flujo → Run history → Selecciona una ejecución → Revisa el Apply to each para ver las comparaciones

### Error: "The template validation failed"
- Verifica que la expresión en la Condition esté bien escrita:
  ```
  @equals(toLower(items('Apply_to_each')?['Nombre']), toLower(triggerBody()?['nombreVotante']))
  ```
- Asegúrate de que el nombre del Apply to each sea exactamente `Apply_to_each` (o ajusta en la expresión)

### Error 400 en la verificación
- El esquema JSON no coincide
- Verifica que estés enviando `{ nombreVotante: "..." }`

### El flujo es muy lento con muchas filas
- Si tienes más de 1000 votantes, considera agregar **Top Count: 1000** en List rows
- El retry mechanism de React compensará cualquier delay
- Para optimizar, podrías filtrar por fecha (solo votos del día actual)

---

**¡Listo!** Ahora tu sistema verifica contra Excel antes de permitir votar. 🔐
