import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '@/pages/ResetPassword';

// Mock du module Supabase
const mockUpdateUser = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      updateUser: (...args: any[]) => mockUpdateUser(...args),
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: any) => {
        mockOnAuthStateChange(callback);
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn()
            }
          }
        };
      }
    }
  }
}));

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock de sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock du composant Image
vi.mock('@/components/ui/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}));

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } } });
  });

  it('affiche un message si le lien est invalide', () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    expect(screen.getByText(/lien invalide ou expiré/i)).toBeInTheDocument();
  });

  it('affiche le formulaire quand la session est valide', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    });
  });

  it('valide que les mots de passe correspondent', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /mettre à jour/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password456!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });

  it('valide la complexité du mot de passe', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /mettre à jour/i });

    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument();
    });
  });

  it('met à jour le mot de passe avec succès', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /mettre à jour/i });

    fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewPassword123!' });
    });

    await waitFor(() => {
      expect(screen.getByText(/mot de passe mis à jour/i)).toBeInTheDocument();
    });
  });

  it('gère les erreurs de token expiré', async () => {
    mockUpdateUser.mockResolvedValue({ 
      error: { message: 'Token has expired' } 
    });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /mettre à jour/i });

    fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/lien de réinitialisation a expiré/i)).toBeInTheDocument();
    });
  });
});
