# Copilot Instructions para SubChecks

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Información del Proyecto

SubChecks es una aplicación web construida con:
- **Next.js 15** con TypeScript
- **Tailwind CSS** para estilos
- **Supabase** para base de datos y autenticación
- **App Router** de Next.js

## Convenciones de Código

- Utiliza TypeScript para todos los archivos
- Usa componentes funcionales de React con hooks
- Implementa el patrón de componentes de servidor cuando sea posible
- Usa Tailwind CSS para todos los estilos
- Mantén los componentes reutilizables en la carpeta `components`
- Usa la configuración de ESLint proporcionada
- Sigue las mejores prácticas de Next.js App Router

## Configuración de Supabase

- Las configuraciones de Supabase están en variables de entorno
- Usa el cliente de Supabase configurado para interacciones con la base de datos
- Implementa autenticación usando Supabase Auth
- Usa Row Level Security (RLS) para seguridad de datos
