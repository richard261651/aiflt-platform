# AI FLT - Full Stack Project

Plataforma educativa para feedback de escritura en inglés basado en los principios de Harmer, potenciado por IA (Claude) y MongoDB.

## Estructura del Proyecto

El repositorio está dividido en dos partes independientes para facilitar el despliegue moderno:

- `/frontend`: Aplicación SPA creada con React y Vite.
- `/backend`: Servidor API REST creado con Node.js, Express y Mongoose.

## Instrucciones de Despliegue

### 1. Preparar GitHub
Sube este repositorio a tu cuenta de GitHub:
```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin master
```

### 2. Desplegar el Backend en Render (Servicio Web)
1. Crea una cuenta en [Render.com](https://render.com).
2. Crea un nuevo **Web Service** y conéctalo a tu repositorio de GitHub.
3. **Configuración clave:**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables (Variables de Entorno)**:
   - `MONGODB_URI`: Tu cadena de conexión a MongoDB Atlas.
   - `ANTHROPIC_API_KEY`: Tu clave secreta de Claude (cuando la tengas).
   - *Nota: Render asignará el `PORT` automáticamente.*

### 3. Desplegar el Frontend en Vercel
1. Crea una cuenta en [Vercel.com](https://vercel.com).
2. Crea un nuevo **Project** y conéctalo a tu repositorio de GitHub.
3. **Configuración clave:**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: La URL pública de tu backend en Render (ej. `https://mi-backend.onrender.com/api`).

---

## Ejecución Local
Para correr el proyecto en tu computadora:

1. Inicia la base de datos local (MongoDB) si no tienes una en la nube.
2. Abre dos terminales:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
