# 📊 Plantilla de Excel - Sistema de Votación

## Estructura del Archivo Excel

### **Archivo:** `Votaciones_SYP.xlsx`

---

## 📋 Hoja 1: "Votantes"

Esta hoja registra cada voto individual.

### Estructura de la Tabla: `TablaVotantes`

| Nombre Votante | Fecha | Hora |
|----------------|-------|------|
| _Los datos se agregan automáticamente_ | | |

### Columnas:
- **Nombre Votante** (Texto): Nombre completo del votante
- **Fecha** (Texto): Formato DD/MM/YYYY
- **Hora** (Texto): Formato HH:MM:SS

### Ejemplo de datos:

| Nombre Votante | Fecha | Hora |
|----------------|-------|------|
| Cristian Ferney Parada | 16/02/2026 | 15:30:45 |
| María José González | 16/02/2026 | 15:32:10 |
| Juan Carlos Méndez | 16/02/2026 | 15:35:22 |

---

## 📊 Hoja 2: "Conteo"

Esta hoja contiene el conteo de votos por candidato.

### Estructura de la Tabla: `TablaConteo`

| Candidato ID | Nombre Candidato | Total Votos |
|-------------|------------------|-------------|
| 1 | María García López | 0 |
| 2 | Jose Sergio Veintemilla | 0 |
| 3 | Ana Rodríguez Paz | 0 |
| 4 | Roberto Silva Morales | 0 |
| 5 | Patricia Flores Castro | 0 |

### Columnas:
- **Candidato ID** (Número): ID único del candidato (1-5)
- **Nombre Candidato** (Texto): Nombre completo del candidato
- **Total Votos** (Número): Contador de votos (inicia en 0)

### ⚠️ IMPORTANTE:
**Debes agregar manualmente estas 5 filas ANTES de crear la tabla.**  
El flujo de Power Automate las actualizará automáticamente.

---

## 🔧 Pasos para Crear las Tablas en Excel

### Para "Votantes":
1. Escribe los encabezados en la fila 1
2. Selecciona A1:C1
3. Ve a **Insertar > Tabla**
4. Marca "La tabla tiene encabezados"
5. Haz clic en "Aceptar"
6. Selecciona la tabla → **Diseño de tabla** → Nombre: `TablaVotantes`

### Para "Conteo":
1. Escribe los encabezados en la fila 1
2. **Escribe las 5 filas de candidatos con Total Votos = 0**
3. Selecciona A1:C6 (incluye encabezados y datos)
4. Ve a **Insertar > Tabla**
5. Marca "La tabla tiene encabezados"
6. Haz clic en "Aceptar"
7. Selecciona la tabla → **Diseño de tabla** → Nombre: `TablaConteo`

---

## 📈 Opcional: Agregar Gráfico de Resultados

En una tercera hoja llamada "Dashboard":

1. Inserta un **Gráfico de Barras**
2. Datos: Selecciona de "Conteo" → Nombre Candidato y Total Votos
3. Personaliza colores y título
4. El gráfico se actualizará automáticamente con cada voto

---

## 🔗 Guardar y Compartir

1. Guarda el archivo en **OneDrive for Business** o **SharePoint**
2. Ruta sugerida: `Documents/Votaciones/Votaciones_SYP.xlsx`
3. **No compartas el archivo** mientras las votaciones estén activas para evitar cambios manuales
4. Puedes descargar una copia para análisis sin afectar el flujo

---

## 💡 Tips Adicionales

### Formato Condicional (Conteo):
Resalta el candidato con más votos:
1. Selecciona la columna "Total Votos"
2. **Inicio > Formato condicional > Barras de datos**
3. Elige un color (azul o verde)

### Validación de Datos:
Si quieres evitar cambios manuales:
1. Selecciona las celdas de datos
2. **Revisar > Proteger hoja**
3. Permite "Insertar filas" y "Eliminar filas"
4. Pon contraseña

### Fórmulas Útiles:
En otra hoja para análisis:
```
Total de Votantes:
=CONTAR.SI(Votantes[Nombre Votante];">")

Total de Votos:
=SUMA(Conteo[Total Votos])

Candidato Líder:
=INDICE(Conteo[Nombre Candidato];COINCIDIR(MAX(Conteo[Total Votos]);Conteo[Total Votos];0))

Porcentaje de Votos (para cada candidato):
=[@[Total Votos]]/SUMA(Conteo[Total Votos])
```

---

## ✅ Verificación Final

Antes de conectar con Power Automate, verifica:

- [ ] Archivo guardado en OneDrive/SharePoint
- [ ] Hoja "Votantes" existe con TablaVotantes
- [ ] Hoja "Conteo" existe con TablaConteo
- [ ] Los 5 candidatos están en TablaConteo con Total Votos = 0
- [ ] Los nombres de las tablas son exactos (distingue mayúsculas)
- [ ] Las columnas tienen los nombres exactos como se especifican
- [ ] Puedes abrir el archivo sin errores

---

**¡Listo!** Tu Excel está preparado para recibir votos automáticamente. 🎉
