# 🧪 Guía de Testing - Vivero SaaS

Esta guía documenta el sistema de testing implementado para garantizar la calidad y confiabilidad del código.

## 📋 Tabla de Contenidos

- [Configuración del Entorno](#configuración-del-entorno)
- [Ejecutar Tests](#ejecutar-tests)
- [Estructura de Tests](#estructura-de-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Cobertura de Código](#cobertura-de-código)
- [Mejores Prácticas](#mejores-prácticas)

## 🛠️ Configuración del Entorno

### Prerrequisitos

- Node.js 18.x, 20.x, o 25.x
- npm o yarn

### Instalación de Dependencias

```bash
npm install
```

### Variables de Entorno para Tests

Los tests están configurados para funcionar sin variables de entorno reales, usando mocks para todas las dependencias externas.

## 🏃 Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar tests para CI (sin watch, con cobertura)
npm run test:ci
```

### Ejecutar Tests Específicos

```bash
# Ejecutar tests de un archivo específico
npm test -- --testPathPattern=confirm-dialog

# Ejecutar tests de un directorio
npm test -- --testPathPattern=components

# Ejecutar un test específico
npm test -- --testNamePattern="renders correctly"
```

## 📁 Estructura de Tests

```
src/
├── components/
│   ├── __tests__/
│   │   ├── confirm-dialog.test.tsx
│   │   ├── avatar-upload.test.tsx
│   │   └── header.test.tsx
│   └── ...
├── app/
│   ├── actions/
│   │   └── __tests__/
│   │       └── profile.test.ts
│   └── (dashboard)/
│       └── perfil/
│           └── __tests__/
│               └── page.test.tsx
├── jest.config.js
├── jest.setup.js
└── ...
```

### Tipos de Tests Implementados

#### 1. **Unit Tests** - Componentes
- Pruebas de renderizado básico
- Props y estados
- Interacciones del usuario
- Validaciones

#### 2. **Integration Tests** - Server Actions
- Validaciones de entrada/salida
- Manejo de errores
- Integración con dependencias mockeadas

#### 3. **File Structure Tests** - Archivos
- Verificación de existencia de archivos
- Validación de imports/exports
- Estructura de código

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### `ci.yml` - Pipeline Principal
- **Triggers**: Push/PR a `main` y `develop`
- **Matrix**: Node.js 18.x, 20.x, 25.x
- **Jobs**:
  - **test**: Linting + Tests + Cobertura
  - **build**: Build de producción
  - **security**: Auditoría de seguridad
  - **deploy-staging**: Deploy a staging (develop branch)
  - **deploy-production**: Deploy a producción (main branch)

#### `codeql.yml` - Análisis de Seguridad
- **Triggers**: Push/PR + Schedule semanal
- **Análisis**: CodeQL para JavaScript/TypeScript
- **Categorías**: Security and Quality

### Estados de Build

Los workflows están configurados para:
- ✅ **Requerir tests passing** antes de merge
- ✅ **Build exitoso** en múltiples versiones de Node.js
- ✅ **Cobertura de código** subida a Codecov
- ✅ **Análisis de seguridad** automático

## 📊 Cobertura de Código

### Configuración

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Reportes Generados

```bash
npm run test:coverage
```

Genera reportes en múltiples formatos:
- **Consola**: Resumen textual
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: Para Codecov y otras herramientas
- **JSON**: Para integración con otras herramientas

### Umbrales de Cobertura

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## ✅ Mejores Prácticas

### Estructura de Tests

```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should behave correctly', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Naming Conventions

```typescript
// Archivos: *.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx
// Funciones: describe('Component/Function', () => { ... })
// Casos: it('should do something', () => { ... })
```

### Mocking Strategy

```typescript
// Mocks en jest.setup.js para dependencias globales
// Mocks específicos en archivos de test individuales
// Usar factories para datos de test consistentes
```

### Testing Patterns

#### Component Testing
```typescript
// Renderizar con props realistas
render(<Component {...props} />)

// Verificar renderizado correcto
expect(screen.getByText('Expected Text')).toBeInTheDocument()

// Simular interacciones
fireEvent.click(button)
await userEvent.click(button)

// Verificar cambios de estado
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled()
})
```

#### Async Testing
```typescript
it('handles async operations', async () => {
  // Para funciones que retornan promesas
  await expect(asyncFunction()).resolves.toEqual(expected)

  // Para efectos secundarios asincrónicos
  await waitFor(() => {
    expect(result).toBe(expected)
  })
})
```

### Debugging Tests

```bash
# Ver modo verbose
npm test -- --verbose

# Ver solo tests fallidos
npm test -- --testNamePattern="should fail"

# Debug con Node.js inspector
npm test -- --inspect-brk
```

## 🚀 Próximos Pasos

### Fase 5: Integration Tests E2E
```bash
# Instalar Playwright o Cypress
npm install --save-dev @playwright/test
# o
npm install --save-dev cypress
```

### Fase 6: Performance Testing
- Lighthouse CI para métricas de rendimiento
- Bundle analyzer para tamaño de build
- Memory leak detection

### Fase 7: Accessibility Testing
```bash
npm install --save-dev @testing-library/jest-dom
npm install --save-dev axe-playwright
```

## 📞 Soporte

Para preguntas sobre testing:

1. Revisar esta documentación
2. Ver ejemplos en archivos de test existentes
3. Consultar issues en el repositorio
4. Abrir nueva issue con detalles del problema

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0
