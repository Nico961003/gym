import { Outlet } from 'react-router';
import Footer from './Footer';
import Navbar from './Navbar';

/** Marco común: navbar arriba, contenido de la ruta y pie. */
function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
