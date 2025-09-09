# Estrategia de Versionamiento y Flujo de Trabajo Git

## Estrategia GitFlow

Este proyecto utiliza GitFlow como estrategia de ramificación. A continuación se detalla la estructura de ramas y el flujo de trabajo:

### Ramas Principales

- `main`: Rama principal que contiene el código en producción
- `develop`: Rama de desarrollo donde se integran las nuevas características

### Ramas de Soporte

- `feature/*`: Ramas para nuevas características
- `release/*`: Ramas para preparar una nueva versión
- `hotfix/*`: Ramas para correcciones urgentes en producción

## Convención de Versionamiento

Utilizamos Versionamiento Semántico (SemVer):

- **MAJOR.MINOR.PATCH** (ejemplo: 1.0.0)
  - MAJOR: cambios incompatibles con versiones anteriores
  - MINOR: nuevas funcionalidades compatibles con versiones anteriores
  - PATCH: correcciones de errores compatibles con versiones anteriores

## Flujo de Trabajo

1. **Nuevas Características**
   - Crear rama `feature/nombre-caracteristica` desde `develop`
   - Desarrollar la característica
   - Crear Pull Request a `develop`

2. **Preparación de Release**
   - Crear rama `release/X.Y.Z` desde `develop`
   - Realizar ajustes finales y correcciones
   - Merge a `main` y `develop`

3. **Correcciones Urgentes**
   - Crear rama `hotfix/descripcion` desde `main`
   - Realizar la corrección
   - Merge a `main` y `develop`

## Pipeline CI/CD

El proyecto incluye un pipeline básico con las siguientes etapas:

1. **Build**: Compilación y construcción del proyecto
2. **Test**: Ejecución de pruebas automatizadas
3. **Deploy**: Despliegue automático al entorno de staging (solo para rama develop)

## Comandos Git Útiles

```bash
# Crear una nueva característica
git checkout develop
git checkout -b feature/nueva-caracteristica

# Crear un release
git checkout develop
git checkout -b release/1.0.0

# Crear un hotfix
git checkout main
git checkout -b hotfix/error-critico
```
