# 🎮 SubChecks

**Sistema de gestión de pagos para suscripciones compartidas**

Una aplicación web moderna para administrar suscripciones compartidas de YouTube Premium y Crunchyroll, con gestión de saldos, historial de pagos y control de usuarios.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase)

## ✨ Características

- 🎯 **Gestión Multi-Servicio**: YouTube Premium y Crunchyroll
- 📊 **Tablas Interactivas**: Saldos, historial y pagos con paginación
- 🔐 **Sistema de Autenticación**: Login/registro seguro con Supabase
- 📱 **Diseño Responsivo**: Adaptable a todos los dispositivos
- 🎨 **Tema Oscuro**: Interface moderna y elegante
- ⚡ **Tiempo Real**: Actualizaciones instantáneas
- 🛡️ **Seguridad**: Row Level Security (RLS) con Supabase
- 🔄 **CRUD Completo**: Crear, leer, actualizar y eliminar registros

## 🚀 Tecnologías

- **Frontend**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Deployment**: Vercel Ready

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/martinbasile13/SubChecks.git
cd SubChecks

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### Base de Datos Supabase

La aplicación utiliza tres tablas principales:

```sql
-- Saldos de usuarios
saldo (id, remitente, monto, aplicacion, fecha_actualizacion)

-- Historial de pagos recibidos
historial_pagos (id, remitente_nombre, monto, aplicacion, fecha_creacion, pago_id)

-- Pagos realizados a la web
pagos (id, monto, descripcion, aplicacion, fecha)
```

## 🖥️ Scripts Disponibles

```bash
npm run dev      # 🚀 Servidor de desarrollo (localhost:3001)
npm run build    # 📦 Build para producción
npm run start    # ▶️ Servidor de producción
npm run lint     # 🔍 Linter de código
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # 🏠 App Router (Next.js 15)
│   ├── gestion/           # 📊 Páginas de gestión por servicio
│   │   └── [aplicacion]/  # 🎯 Rutas dinámicas (youtube/crunchyroll)
│   ├── auth/              # 🔐 Autenticación
│   │   ├── login/         # 📝 Página de login
│   │   └── register/      # ✍️ Página de registro
│   └── debug/             # 🐛 Herramientas de debug
├── components/            # 🧩 Componentes reutilizables
│   └── Header.tsx         # 🧭 Navegación principal
├── hooks/                 # 🪝 Custom Hooks
│   ├── useAuth.ts         # 👤 Gestión de autenticación
│   ├── useGestionPagos.ts # 💰 Gestión de datos principal
│   └── useGestionPagosSimple.ts # 📄 Hook simplificado
├── lib/                   # ⚙️ Configuraciones
│   └── supabase.ts        # 🗄️ Cliente de Supabase
└── types/                 # 📝 Definiciones TypeScript
    └── database.ts        # 🏗️ Tipos de base de datos
```

## 🌐 Funcionalidades

### 🎮 Gestión por Servicio
- **YouTube Premium**: Sombra roja característica
- **Crunchyroll**: Sombra naranja característica
- Navegación independiente por servicio

### 📊 Tablas con Paginación
- **Saldos**: Control de dinero disponible por usuario
- **Historial**: Registro de todos los pagos recibidos  
- **Pagos Web**: Pagos realizados a las plataformas

### 🔐 Sistema de Autenticación
- Registro de nuevos usuarios
- Login seguro
- Control de acceso por roles
- Funciones CRUD solo para usuarios autenticados

## 🚀 Deployment en Vercel

### 1. Preparación
```bash
# Verificar que el build funcione
npm run build
```

### 2. Variables de Entorno en Vercel
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Configuración de Supabase
- ✅ Políticas RLS configuradas
- ✅ Tablas creadas
- ✅ Datos de prueba (opcional)

### 4. Deploy
1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno
3. Deploy automático 🚀

## 📱 Screenshots

### 🏠 Página Principal
- Cards interactivas para cada servicio
- Diseño responsive con hover effects
- Navegación intuitiva

### 📊 Panel de Gestión
- Tres tablas organizadas
- Controles de paginación
- Botones CRUD para usuarios autenticados

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Martín Basile**
- GitHub: [@martinbasile13](https://github.com/martinbasile13)

---

⭐ **¡Si te gustó este proyecto, dale una estrella!** ⭐

💡 **Desarrollado para facilitar la gestión de suscripciones compartidas**