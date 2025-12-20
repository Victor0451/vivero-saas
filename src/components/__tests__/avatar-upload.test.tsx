import { render, screen } from '@testing-library/react'
import { AvatarUpload } from '../avatar-upload'

// Mock de showToast
jest.mock('@/lib/toast', () => ({
  showToast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

describe('AvatarUpload', () => {
  const defaultProps = {
    onUpload: jest.fn(),
    isUploading: false,
    currentAvatarUrl: '',
  }

  it('renders component without crashing', () => {
    render(<AvatarUpload {...defaultProps} />)
    expect(screen.getByText('Arrastra y suelta tu foto aquí, o')).toBeInTheDocument()
  })

  it('renders with current avatar URL', () => {
    render(<AvatarUpload {...defaultProps} currentAvatarUrl="https://example.com/avatar.jpg" />)
    // Component renders without crashing with avatar URL
    expect(screen.getByText('Arrastra y suelta tu foto aquí, o')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<AvatarUpload {...defaultProps} isUploading={true} />)
    expect(screen.getByText('Arrastra y suelta tu foto aquí, o')).toBeInTheDocument()
  })

  it('has file input with correct attributes', () => {
    render(<AvatarUpload {...defaultProps} />)
    const fileInput = screen.getByTestId('avatar-file-input')
    expect(fileInput).toHaveAttribute('type', 'file')
    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png,image/webp')
  })
})
