import { stats } from '../data/gym';

function Stats() {
  return (
    <section className="rg-stats" data-bs-theme="dark">
      <div className="container">
        <div className="row g-4 text-center">
          {stats.map((stat) => (
            <div className="col-6 col-lg-3" key={stat.label}>
              <p className="rg-stats__value">{stat.value}</p>
              <p className="rg-stats__label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
