import About from '../components/About';
import Classes from '../components/Classes';
import Contact from '../components/Contact';
import Hero from '../components/Hero';
import JoinCta from '../components/JoinCta';
import Locations from '../components/Locations';
import Pricing from '../components/Pricing';
import Promotions from '../components/Promotions';
import Schedule from '../components/Schedule';
import Services from '../components/Services';
import Stats from '../components/Stats';
import Testimonials from '../components/Testimonials';
import Trainers from '../components/Trainers';

/** Portada pública: cualquiera puede verla sin iniciar sesión. */
function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <About />
      <Locations />
      <Services />
      <Schedule />
      <Classes />
      <Pricing />
      <Promotions />
      <JoinCta />
      <Trainers />
      <Testimonials />
      <Contact />
    </>
  );
}

export default Home;
