export interface NavLink {
  label: string;
  href: string;
}

export interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  text: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Service {
  icon: string;
  title: string;
  text: string;
}

export interface GymClass {
  name: string;
  image: string;
  days: string;
  time: string;
  duration: string;
  level: 'Iniciación' | 'Intermedio' | 'Avanzado' | 'Todos los niveles';
}

export interface Trainer {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface Plan {
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
}

export interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
}

export interface ScheduleEntry {
  days: string;
  hours: string;
}

export interface Sede {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  horario: string;
  servicios: string[];
  principal: boolean;
}

export interface GymInfo {
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  schedule: ScheduleEntry[];
  social: { label: string; href: string; icon: string }[];
}
