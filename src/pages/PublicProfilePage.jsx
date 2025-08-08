import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicBusinessProfile } from "@/services/PublicService";

// UI Components
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

// Icons
import {
  FiClock,
  FiDollarSign,
  FiArrowRight,
  FiMapPin,
  FiPhone,
  FiGlobe,
  FiInstagram,
  FiFacebook,
  FiMail,
  FiUsers,
  FiScissors,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PublicProfilePage = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      getPublicBusinessProfile(slug)
        .then((response) => setBusiness(response.data))
        .catch(() =>
          setError("No se pudo encontrar el perfil de este negocio."),
        )
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
        {error}
      </div>
    );
  if (!business) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* --- Banner/Hero Section --- */}
      <div className="bg-violet-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <header className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage
                src={business.logo ? `${API_URL}${business.logo}` : undefined}
              />
              <AvatarFallback className="text-4xl bg-violet-100 text-violet-600">
                {business.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {business.name}
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                {business.description}
              </p>
              <div className="flex justify-center md:justify-start items-center space-x-2 mt-3 text-sm text-gray-500">
                <FiMapPin className="w-4 h-4" />
                <span>{business.address}</span>
              </div>
            </div>
          </header>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* --- SECCIÓN DE SERVICIOS --- */}
        {business.offerings && business.offerings.length > 0 && (
          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Nuestros Servicios
            </h2>
            <p className="mt-2 text-gray-600">
              Elige el servicio que necesitas y reserva tu cita
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {business.offerings.map((service) => (
                <Card
                  key={service.id}
                  className="text-left overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col"
                >
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                    <p className="text-sm text-gray-500 pt-1">
                      {service.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow justify-between">
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="flex items-center text-sm">
                        <FiClock className="mr-2" />
                        {service.durationMinutes} min
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${Number(service.price).toFixed(2)}
                      </span>
                    </div>
                    <Link to="/book" className="mt-4">
                      <Button className="w-full bg-violet-600 hover:bg-violet-700">
                        Reservar Ahora <FiArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* --- SECCIÓN DE EQUIPO --- */}
        {business.employees && business.employees.length > 0 && (
          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Nuestro Equipo</h2>
            <p className="mt-2 text-gray-600">
              Conoce a nuestros profesionales
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 mt-10">
              {business.employees.map((emp) => (
                <div key={emp.id} className="text-center space-y-2">
                  <Avatar className="h-24 w-24 mx-auto border-2 border-violet-200">
                    <AvatarImage
                      src={emp.photo ? `${API_URL}${emp.photo}` : undefined}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {emp.name?.[0]}
                      {emp.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">
                    {emp.name} {emp.lastName}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-violet-700 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-12 px-4 sm:px-6 lg:px-8">
          {/* Columna 1: Info del Negocio */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl">{business.name}</h3>
            <p className="flex items-start">
              <FiMapPin className="w-4 h-4 mr-3 mt-1 flex-shrink-0" />
              {business.address}
            </p>
          </div>
          {/* Columna 2: Contacto */}
          <div className="space-y-2">
            <h4 className="font-semibold">Contacto</h4>
            <p className="flex items-center">
              <FiPhone className="w-4 h-4 mr-3" />
              {business.phone}
            </p>
            <p className="flex items-center">
              <FiMail className="w-4 h-4 mr-3" />
              {business.email}
            </p>
          </div>
          {/* Columna 3: Redes Sociales */}
          <div className="space-y-2">
            <h4 className="font-semibold">Síguenos</h4>
            <div className="flex space-x-4">
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-violet-200"
                >
                  <FiGlobe size={24} />
                </a>
              )}
              {business.instagram && (
                <a
                  href={`https://instagram.com/${business.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-violet-200"
                >
                  <FiInstagram size={24} />
                </a>
              )}
              {business.facebook && (
                <a
                  href={`https://facebook.com/${business.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-violet-200"
                >
                  <FiFacebook size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicProfilePage;
