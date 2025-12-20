import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../confirm-dialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: 'Eliminar elemento',
    description: '¿Estás seguro de que quieres eliminar este elemento?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: jest.fn(),
    variant: 'destructive' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly when open', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('Eliminar elemento')).toBeInTheDocument()
    expect(screen.getByText('¿Estás seguro de que quieres eliminar este elemento?')).toBeInTheDocument()
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />)

    expect(screen.queryByText('Eliminar elemento')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog {...defaultProps} />)

    await user.click(screen.getByText('Eliminar'))

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog {...defaultProps} />)

    await user.click(screen.getByText('Cancelar'))

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  it('uses default button texts when not provided', () => {
    const propsWithoutTexts = {
      ...defaultProps,
      confirmText: undefined,
      cancelText: undefined,
    }
    render(<ConfirmDialog {...propsWithoutTexts} />)

    expect(screen.getByText('Confirmar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('applies destructive variant styling', () => {
    render(<ConfirmDialog {...defaultProps} />)

    const confirmButton = screen.getByText('Eliminar')
    expect(confirmButton).toHaveClass('bg-destructive hover:bg-destructive/90')
  })

  it('applies default variant styling', () => {
    render(<ConfirmDialog {...defaultProps} variant="default" />)

    const confirmButton = screen.getByText('Eliminar')
    expect(confirmButton).not.toHaveClass('bg-destructive')
  })
})
