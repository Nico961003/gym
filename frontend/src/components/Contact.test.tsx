import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { gym } from '../data/gym';
import Contact from './Contact';

describe('Contact', () => {
  it('lleva el ancla #contacto', () => {
    const { container } = render(<Contact />);
    expect(container.querySelector('#contacto')).toBeInTheDocument();
  });

  it('muestra dirección, teléfono y correo', () => {
    render(<Contact />);
    expect(screen.getByText(gym.address)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: gym.phone })).toHaveAttribute(
      'href',
      `tel:${gym.phone.replace(/\s/g, '')}`
    );
    expect(screen.getByRole('link', { name: gym.email })).toHaveAttribute(
      'href',
      `mailto:${gym.email}`
    );
  });

  it('muestra el horario del centro', () => {
    render(<Contact />);
    for (const tramo of gym.schedule) {
      expect(screen.getByText(tramo.days)).toBeInTheDocument();
    }
  });

  it('todos los campos del formulario tienen etiqueta', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/me interesa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
  });

  it('no muestra confirmación hasta enviar', () => {
    render(<Contact />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('avisa de que es una demostración al enviar', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/nombre/i), 'Ana');
    await user.click(screen.getByRole('button', { name: /enviar solicitud/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /formulario de demostración/i
    );
  });

  it('el desplegable ofrece las cuatro opciones de interés', () => {
    render(<Contact />);
    const select = screen.getByLabelText(/me interesa/i);
    expect(select).toHaveValue('sala');
    expect(select.querySelectorAll('option')).toHaveLength(4);
  });
});
