import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

import {
  Calendar,
  User,
  Users,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Settings,
  Image as ImageIcon,
} from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  const FeatureCard = ({ icon: Icon, title, description }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* --- NAVEGACIÓN --- */}

      <Header />

      {/* --- SECCIÓN PRINCIPAL (HERO) --- */}
      <section className="py-24 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4"
        >
          <span className="text-violet-600">Turnify</span> La agenda que nos
          conecta a todos.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto"
        >
          Una plataforma inteligente donde los mejores profesionales y sus
          clientes se encuentran. Gestiona tu negocio o encuentra tu próximo
          turno en un solo lugar.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center items-center gap-4" // 👉
        >
          <a
            href="https://wa.me/5493546458933?text=Hola%21%20Quiero%20registrar%20mi%20negocio."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-md font-medium px-8 py-3 inline-flex items-center"
          >
            Registrar mi negocio <ArrowRight className="w-5 h-5 ml-2" />
          </a>

          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="bg-violet-600 hover:bg-violet-700 text-white h-12 px-8 py-3 text-base inline-flex items-center"
          >
            Reservar Ahora <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* --- SECCIÓN DE FUNCIONALIDADES --- */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Una Solución Completa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para una gestión eficiente, tanto para
              clientes como para administradores.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Calendar}
              title="Reserva de Citas Inteligente"
              description="Los clientes pueden ver la disponibilidad en tiempo real, elegir profesionales y reservar en segundos."
            />
            <FeatureCard
              icon={Users}
              title="Gestión de Empleados"
              description="Administra tu personal, asigna servicios a cada profesional y define sus horarios de trabajo."
            />
            <FeatureCard
              icon={Clock}
              title="Control de Horarios"
              description="Cada empleado puede gestionar su disponibilidad semanal, asegurando que el calendario siempre esté actualizado."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Asignación de Servicios"
              description="Define qué servicios puede realizar cada empleado para optimizar la asignación de citas."
            />
            <FeatureCard
              icon={Settings}
              title="Panel de Administración"
              description="Una vista centralizada para gestionar servicios, empleados, citas y ver estadísticas clave de tu negocio."
            />
            <FeatureCard
              icon={ImageIcon}
              title="Perfiles Personalizados"
              description="Tanto clientes como empleados pueden subir su propia foto de perfil para una experiencia más personal."
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
};

export default HomePage;
