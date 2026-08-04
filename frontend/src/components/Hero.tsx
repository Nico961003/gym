import { useCallback, useEffect, useState } from 'react';
import { slides } from '../data/gym';
import Icon from './Icon';

const INTERVAL_MS = 7000;

function Hero() {
  const [index, setIndex] = useState(0);

  const go = useCallback((step: number) => {
    setIndex((current) => (current + step + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => go(1), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [go, index]);

  return (
    <section id="inicio" className="rg-hero" data-bs-theme="dark">
      {slides.map((slide, i) => (
        <div
          key={slide.title}
          className={`rg-hero__slide ${i === index ? 'is-active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden={i !== index}
        />
      ))}

      <div className="rg-hero__overlay" />

      <div className="container rg-hero__content">
        <div className="row">
          <div className="col-lg-8 col-xl-7">
            <p className="rg-eyebrow">{slides[index].eyebrow}</p>
            <h1 className="display-3 fw-bold text-white mb-4">
              {slides[index].title}
            </h1>
            <p className="lead text-white-50 mb-5">{slides[index].text}</p>
            <div className="d-flex flex-wrap gap-3">
              <a href="#tarifas" className="btn btn-brand btn-lg">
                Ver tarifas
              </a>
              <a href="#clases" className="btn btn-outline-light btn-lg">
                Nuestras clases
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="rg-hero__controls container">
        <button
          type="button"
          className="rg-hero__arrow"
          onClick={() => go(-1)}
          aria-label="Anterior"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <div className="rg-hero__dots" role="tablist">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              role="tab"
              className={`rg-hero__dot ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-selected={i === index}
            />
          ))}
        </div>
        <button
          type="button"
          className="rg-hero__arrow"
          onClick={() => go(1)}
          aria-label="Siguiente"
        >
          <Icon name="chevronRight" size={20} />
        </button>
      </div>
    </section>
  );
}

export default Hero;
