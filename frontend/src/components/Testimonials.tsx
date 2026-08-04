import { testimonials } from '../data/gym';

function Testimonials() {
  return (
    <section className="rg-section rg-section--dark" data-bs-theme="dark">
      <div className="container">
        <div className="text-center mb-5">
          <p className="rg-eyebrow">Opiniones</p>
          <h2 className="rg-title text-white">Lo que dicen nuestros socios</h2>
        </div>

        <div className="row g-4">
          {testimonials.map((item) => (
            <div className="col-lg-4" key={item.name}>
              <figure className="rg-quote h-100">
                <blockquote className="mb-4">«{item.quote}»</blockquote>
                <figcaption className="d-flex align-items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="rg-quote__avatar"
                    loading="lazy"
                  />
                  <div>
                    <p className="fw-semibold mb-0 text-white">{item.name}</p>
                    <p className="small text-white-50 mb-0">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
