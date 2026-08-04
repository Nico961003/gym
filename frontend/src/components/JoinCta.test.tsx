import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import JoinCta from './JoinCta';

function renderCta() {
  return render(
    <MemoryRouter>
      <JoinCta />
    </MemoryRouter>
  );
}

describe('JoinCta', () => {
  it('invita a darse de alta con un enlace al registro', () => {
    renderCta();
    expect(screen.getByRole('link', { name: /hazte socio/i })).toHaveAttribute(
      'href',
      '/registro'
    );
  });

  it('ofrece la alternativa de acceder a quien ya es socio', () => {
    renderCta();
    expect(
      screen.getByRole('link', { name: /accede a tu cuenta/i })
    ).toHaveAttribute('href', '/acceder');
  });

  it('enumera las ventajas del alta', () => {
    renderCta();
    expect(screen.getByText(/primera semana de prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/sin matrícula ni permanencia/i)).toBeInTheDocument();
    expect(screen.getByText(/tres sedes/i)).toBeInTheDocument();
  });
});
