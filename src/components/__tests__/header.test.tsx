/**
 * @jest-environment jsdom
 */

// Tests básicos para verificar que el componente Header existe y se puede importar
describe('Header Component', () => {
  it('should be importable', () => {
    expect(() => require('../header')).not.toThrow()
  })

  it('should export Header function', () => {
    const { Header } = require('../header')
    expect(typeof Header).toBe('function')
  })

  it('should have HeaderProps interface', () => {
    // Verificar que el archivo contiene la definición de la interfaz
    const fs = require('fs')
    const path = require('path')
    const filePath = path.join(__dirname, '../header.tsx')
    const content = fs.readFileSync(filePath, 'utf8')

    expect(content).toContain('interface HeaderProps')
  })

  it('should contain getUserProfile function', () => {
    const fs = require('fs')
    const path = require('path')
    const filePath = path.join(__dirname, '../header.tsx')
    const content = fs.readFileSync(filePath, 'utf8')

    expect(content).toContain('async function getUserProfile')
  })

  it('should import ThemeToggle component', () => {
    const fs = require('fs')
    const path = require('path')
    const filePath = path.join(__dirname, '../header.tsx')
    const content = fs.readFileSync(filePath, 'utf8')

    expect(content).toContain("import { ThemeToggle }")
  })
})
