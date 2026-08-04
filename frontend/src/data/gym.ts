/**
 * Datos de ejemplo de Rodriguez Gym.
 *
 * TODO: todo el contenido de este archivo es FICTICIO y sirve solo de relleno
 * para la maquetación. Sustituir por datos reales (o por la respuesta del
 * backend) antes de publicar el sitio.
 */
import carousel1 from '../assets/img/carousel-1.jpg';
import carousel2 from '../assets/img/carousel-2.jpg';
import feature1 from '../assets/img/feature-1.jpg';
import feature2 from '../assets/img/feature-2.jpg';
import feature3 from '../assets/img/feature-3.jpg';
import feature4 from '../assets/img/feature-4.jpg';
import team1 from '../assets/img/team-1.jpg';
import team2 from '../assets/img/team-2.jpg';
import team3 from '../assets/img/team-3.jpg';
import team4 from '../assets/img/team-4.jpg';
import testimonial1 from '../assets/img/testimonial-1.jpg';
import testimonial2 from '../assets/img/testimonial-2.jpg';
import testimonial3 from '../assets/img/testimonial-3.jpg';
import aboutImg from '../assets/img/about.jpg';

import type {
  GymClass,
  GymInfo,
  NavLink,
  Plan,
  Sede,
  Service,
  Slide,
  Stat,
  Testimonial,
  Trainer,
} from '../types/gym';

export const gym: GymInfo = {
  name: 'Rodriguez Gym',
  tagline: 'Entrena fuerte, vive mejor',
  description:
    'Somos un gimnasio de barrio con equipamiento de primer nivel. Desde 2016 acompañamos a nuestros socios con entrenadores certificados, planes personalizados y un ambiente en el que todo el mundo cabe, sea cual sea su punto de partida.',
  address: 'Av. de la Constitución 42, 28013 Madrid',
  phone: '+34 910 123 456',
  email: 'hola@rodriguezgym.example',
  schedule: [
    { days: 'Lunes a viernes', hours: '06:00 – 23:00' },
    { days: 'Sábados', hours: '08:00 – 21:00' },
    { days: 'Domingos y festivos', hours: '09:00 – 14:00' },
  ],
  social: [
    { label: 'Instagram', href: '#', icon: 'instagram' },
    { label: 'Facebook', href: '#', icon: 'facebook' },
    { label: 'YouTube', href: '#', icon: 'youtube' },
  ],
};

export const navLinks: NavLink[] = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Sedes', href: '#ubicaciones' },
  { label: 'Horarios', href: '#horarios' },
  { label: 'Clases', href: '#clases' },
  { label: 'Tarifas', href: '#tarifas' },
  { label: 'Promociones', href: '#promociones' },
  { label: 'Contacto', href: '#contacto' },
];

export const sedes: Sede[] = [
  {
    nombre: 'Rodriguez Gym Centro',
    direccion: 'Av. de la Constitución 42',
    ciudad: '28013 Madrid',
    telefono: '+34 910 123 456',
    horario: 'L-V 06:00–23:00 · S 08:00–21:00 · D 09:00–14:00',
    servicios: ['Sala 1.800 m²', 'Clases dirigidas', 'Sauna', 'Parking'],
    principal: true,
  },
  {
    nombre: 'Rodriguez Gym Chamartín',
    direccion: 'Calle de Alberto Alcocer 118',
    ciudad: '28036 Madrid',
    telefono: '+34 910 123 457',
    horario: 'L-V 07:00–22:30 · S 09:00–20:00 · D cerrado',
    servicios: ['Sala 1.100 m²', 'Zona funcional', 'Fisioterapia'],
    principal: false,
  },
  {
    nombre: 'Rodriguez Gym Getafe',
    direccion: 'Calle Madrid 7, Getafe',
    ciudad: '28901 Madrid',
    telefono: '+34 910 123 458',
    horario: 'L-V 06:30–22:00 · S 09:00–19:00 · D 10:00–14:00',
    servicios: ['Sala 900 m²', 'Boxeo', 'Parking gratuito'],
    principal: false,
  },
];

export const slides: Slide[] = [
  {
    image: carousel1,
    eyebrow: 'Primera semana gratis',
    title: 'Tu mejor versión empieza hoy',
    text: 'Más de 1.200 socios entrenan con nosotros cada mes. Ven a probar sin compromiso y descubre por qué se quedan.',
  },
  {
    image: carousel2,
    eyebrow: 'Entrenamiento personal',
    title: 'Un plan hecho a tu medida',
    text: 'Valoración inicial, objetivos claros y seguimiento mes a mes con entrenadores titulados.',
  },
];

export const stats: Stat[] = [
  { value: '1.200+', label: 'Socios activos' },
  { value: '32', label: 'Clases semanales' },
  { value: '12', label: 'Entrenadores' },
  { value: '9', label: 'Años en el barrio' },
];

export const aboutImage = aboutImg;

export const aboutHighlights: string[] = [
  '1.800 m² repartidos en tres plantas',
  'Sala de musculación con equipamiento Technogym',
  'Zona funcional, cardio y área de peso libre',
  'Vestuarios con taquillas, sauna y toallas incluidas',
];

export const services: Service[] = [
  {
    icon: 'dumbbell',
    title: 'Sala de musculación',
    text: 'Más de 80 máquinas y una amplia zona de peso libre con racks, mancuernas hasta 50 kg y plataformas de halterofilia.',
  },
  {
    icon: 'heart',
    title: 'Clases dirigidas',
    text: 'Spinning, HIIT, yoga, boxeo y body pump incluidos en todas las cuotas, sin reserva previa ni coste extra.',
  },
  {
    icon: 'user',
    title: 'Entrenamiento personal',
    text: 'Sesiones individuales o en pareja con entrenadores certificados y seguimiento de progreso en la app.',
  },
  {
    icon: 'leaf',
    title: 'Asesoría nutricional',
    text: 'Consulta mensual con nuestra nutricionista colegiada para ajustar la alimentación a tus objetivos.',
  },
  {
    icon: 'droplet',
    title: 'Recuperación',
    text: 'Sauna, zona de estiramientos, pistolas de masaje y sesiones de fisioterapia deportiva bajo cita.',
  },
  {
    icon: 'clock',
    title: 'Horario amplio',
    text: 'Abrimos a las 6:00 de la mañana de lunes a viernes para que entrenes antes o después del trabajo.',
  },
];

export const classes: GymClass[] = [
  {
    name: 'Spinning',
    image: feature1,
    days: 'Lunes, miércoles y viernes',
    time: '07:00 · 18:30 · 20:00',
    duration: '45 min',
    level: 'Todos los niveles',
  },
  {
    name: 'CrossTraining',
    image: feature2,
    days: 'Lunes a viernes',
    time: '09:00 · 19:00',
    duration: '60 min',
    level: 'Intermedio',
  },
  {
    name: 'Yoga y movilidad',
    image: feature3,
    days: 'Martes y jueves',
    time: '10:00 · 21:00',
    duration: '60 min',
    level: 'Iniciación',
  },
  {
    name: 'Boxeo',
    image: feature4,
    days: 'Martes, jueves y sábado',
    time: '18:00 · 11:00 (sáb)',
    duration: '50 min',
    level: 'Avanzado',
  },
];

export const trainers: Trainer[] = [
  {
    name: 'Carlos Rodríguez',
    role: 'Director y entrenador de fuerza',
    image: team1,
    bio: 'Licenciado en CAFyD. Fundó el gimnasio en 2016 y dirige los programas de fuerza e hipertrofia.',
  },
  {
    name: 'Ana Beltrán',
    role: 'CrossTraining y acondicionamiento',
    image: team2,
    bio: 'Entrenadora nivel 2 y ex atleta de halterofilia. Lleva las clases de alta intensidad.',
  },
  {
    name: 'Miguel Torres',
    role: 'Boxeo y preparación física',
    image: team3,
    bio: 'Doce años compitiendo en boxeo amateur. Especialista en trabajo de técnica y cardio.',
  },
  {
    name: 'Lucía Fernández',
    role: 'Yoga, pilates y movilidad',
    image: team4,
    bio: 'Formada en pilates terapéutico. Diseña los planes de recuperación y trabajo postural.',
  },
];

export const plans: Plan[] = [
  {
    name: 'Básica',
    price: 29,
    period: 'mes',
    features: [
      'Acceso libre a sala de musculación',
      'Zona de cardio y peso libre',
      'Horario completo',
      'Taquilla de uso diario',
    ],
    highlighted: false,
  },
  {
    name: 'Plus',
    price: 45,
    period: 'mes',
    features: [
      'Todo lo de la cuota Básica',
      'Clases dirigidas ilimitadas',
      'Acceso a sauna y zona de recuperación',
      'Plan de entrenamiento trimestral',
    ],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 75,
    period: 'mes',
    features: [
      'Todo lo de la cuota Plus',
      '4 sesiones de entrenamiento personal',
      'Consulta mensual de nutrición',
      'Invitaciones para acompañantes',
    ],
    highlighted: false,
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'Marta Gil',
    role: 'Socia desde 2021',
    image: testimonial1,
    quote:
      'Llegué sin haber pisado un gimnasio en mi vida y nunca me sentí fuera de lugar. Los entrenadores te corrigen sin agobiar y el ambiente es muy sano.',
  },
  {
    name: 'Javier Ortega',
    role: 'Socio desde 2019',
    image: testimonial2,
    quote:
      'La sala está siempre impecable y nunca tengo que esperar por una máquina, ni siquiera a las ocho de la tarde. Para mí eso lo es todo.',
  },
  {
    name: 'Nuria Sanz',
    role: 'Socia desde 2023',
    image: testimonial3,
    quote:
      'Las clases de yoga de Lucía me han quitado el dolor de espalda que arrastraba desde hacía años. Vengo tres veces por semana y lo noto.',
  },
];
