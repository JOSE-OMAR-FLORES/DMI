# Estrategia de Versionamiento y Flujo de Trabajo Git

## Estrategia GitHub Flow

Este proyecto utiliza GitHub Flow como estrategia de ramificación. Es un flujo simple y eficiente que se centra en la rama principal:

### Estructura de Ramas

- `main`: Rama principal que contiene el código siempre desplegable
- `feature/*`: Ramas para nuevas características, correcciones y experimentos

## Convención de Versionamiento

Utilizamos Versionamiento Semántico (SemVer):

- **MAJOR.MINOR.PATCH** (ejemplo: 1.0.0)
  - MAJOR: cambios incompatibles con versiones anteriores
  - MINOR: nuevas funcionalidades compatibles con versiones anteriores
  - PATCH: correcciones de errores compatibles con versiones anteriores

## Flujo de Trabajo GitHub Flow

1. **Crear una rama**
   - Crear rama `feature/nombre-caracteristica` desde `main`
   - El nombre debe ser descriptivo de la tarea

2. **Realizar cambios**
   - Desarrollar la característica o corrección
   - Hacer commits frecuentes con mensajes descriptivos

3. **Abrir Pull Request**
   - Crear Pull Request a `main`
   - Describir los cambios realizados
   - Solicitar revisión del código

4. **Revisión y discusión**
   - El equipo revisa el código
   - Se realizan ajustes si es necesario

5. **Deploy y pruebas**
   - Se despliega automáticamente a staging para pruebas
   - Se valida que todo funcione correctamente

6. **Merge**
   - Una vez aprobado, se hace merge a `main`
   - Se despliega automáticamente a producción

## Pipeline CI/CD

El proyecto incluye un pipeline básico con las siguientes etapas:

1. **Build**: Compilación y construcción del proyecto
2. **Test**: Ejecución de pruebas automatizadas
3. **Deploy Staging**: Despliegue automático para Pull Requests (testing)
4. **Deploy Production**: Despliegue automático cuando se hace merge a main

## Comandos Git Útiles

```bash
# Crear una nueva característica
git checkout main
git pull origin main
git checkout -b feature/nueva-caracteristica

# Subir cambios
git add .
git commit -m "Descripción del cambio"
git push origin feature/nueva-caracteristica

# Actualizar rama con los últimos cambios
git checkout main
git pull origin main
git checkout feature/mi-rama
git merge main
```
