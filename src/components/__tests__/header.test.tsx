/**
 * @jest-environment jsdom
 */

import fs from 'fs'
import path from 'path'
import { Header } from '../header'

// Tests básicos para verificar que el componente Header existe y se puede importar
describe('Header Component', () => {
  const filePath = path.join(__dirname, '../header.tsx')

  it('should be importable', () => {
    expect(Header).toBeDefined()
  })

  it('should export Header function', () => {
    expect(typeof Header).toBe('function')
  })

  it('should have HeaderProps interface', () => {
    // Verificar que el archivo contiene la definición de la interfaz
    const content = fs.readFileSync(filePath, 'utf8')
    expect(content).toContain('interface HeaderProps')
  })

  it('should contain getUserProfile function', () => {
    const content = fs.readFileSync(filePath, 'utf8')
    expect(content).toContain('async function getUserProfile')
  })

  it('should import ThemeToggle component', () => {
    const content = fs.readFileSync(filePath, 'utf8')
    expect(content).toContain("import { ThemeToggle }")
  })
})
