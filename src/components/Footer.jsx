import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiTwitter, FiMail } from "react-icons/fi";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-violet-600 text-white ">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-2xl font-bold text-white">Turnify</h2>
            <p className="mt-2 text-sm text-white">
              Tu agenda de belleza, simplificada.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/book" className="hover:text-white transition-colors">
                  Reservar Cita
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-white transition-colors"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  to="/appointments"
                  className="hover:text-white transition-colors"
                >
                  Mis Citas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="hover:text-white transition-colors"
                >
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Contacto
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="mailto:soporte@turnify.com"
                  className="flex items-center space-x-2 hover:text-white transition-colors"
                >
                  <FiMail />
                  <span>Soporte</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-white order-2 sm:order-1 mt-4 sm:mt-0">
            &copy; {currentYear} Turnify. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 order-1 sm:order-2">
            <a
              href="#"
              className="text-white hover:text-white transition-colors"
            >
              <span className="sr-only">Facebook</span>
              <FiFacebook className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-white hover:text-white transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <FiInstagram className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-white hover:text-white transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <FiTwitter className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
