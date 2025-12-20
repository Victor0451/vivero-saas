/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import ProfilePage from '../page'

// Mock de componentes
jest.mock('@/components/page-header', () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

jest.mock('@/components/profile-form', () => ({
  ProfileForm: ({ initialData }: { initialData: any }) => (
    <div data-testid="profile-form">
      <p>Profile Form for {initialData.nombre}</p>
    </div>
  ),
}))

// Mock de Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      })
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              nombre: 'Juan Pérez',
              avatar_url: 'https://example.com/avatar.jpg',
              rol: 'usuario'
            },
            error: null
          })
        }))
      }))
    }))
  }))
}))

describe('Profile Page', () => {
  it('renders profile page with correct title and description', async () => {
    render(await ProfilePage())

    expect(screen.getByText('Perfil de Usuario')).toBeInTheDocument()
    expect(screen.getByText('Administra tu información personal y preferencias')).toBeInTheDocument()
  })

  it('renders page header component', async () => {
    render(await ProfilePage())

    expect(screen.getByTestId('page-header')).toBeInTheDocument()
  })

  it('renders profile form component', async () => {
    render(await ProfilePage())

    expect(screen.getByTestId('profile-form')).toBeInTheDocument()
  })

  it('passes correct initial data to profile form', async () => {
    render(await ProfilePage())

    expect(screen.getByText('Profile Form for Juan Pérez')).toBeInTheDocument()
  })

  it('renders with correct layout structure', async () => {
    const { container } = render(await ProfilePage())

    // Verificar que tiene la estructura esperada
    expect(container.firstChild).toHaveClass('space-y-8')

    // Verificar que el contenedor tiene max-w-2xl
    const formContainer = container.querySelector('.max-w-2xl')
    expect(formContainer).toBeInTheDocument()
  })
})
