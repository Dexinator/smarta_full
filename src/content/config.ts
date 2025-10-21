import { defineCollection, z } from 'astro:content';

const virtualOfficesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    // Configuración general
    title: z.string(),
    description: z.string(),
    lang: z.string().default('es'),

    // Sección 1: Video Hero
    hero: z.object({
      visible: z.boolean().default(true),
      videoUrl: z.string().optional(),
      posterUrl: z.string().optional(),
      title: z.string(),
      subtitle: z.string(),
    }).optional(),

    // Sección 2: Lectura Fácil
    lecturaFacil: z.object({
      visible: z.boolean().default(true),
      title: z.string().default('Lectura Fácil'),
      subtitle: z.string().optional(),
      subtitleLecturaFacil: z.string().optional(),
      pdfUrl: z.string().optional(),
      buttonText: z.string().default('Ir a lectura fácil'),
      content: z.string().optional(),
    }).optional(),

    // Sección 3: Mapa
    mapa: z.object({
      visible: z.boolean().default(true),
      title: z.string().default('¿Dónde estamos?'),
      subtitle: z.string().optional(),
      locations: z.array(z.object({
        name: z.string(),
        description: z.string(),
        coordinates: z.tuple([z.number(), z.number()]),
      })),
      direccion: z.object({
        calle: z.string(),
        codigoPostal: z.string(),
        ciudad: z.string(),
      }).optional(),
      comoLlegar: z.array(z.object({
        emoji: z.string(),
        text: z.string(),
      })).optional(),
    }).optional(),

    // Sección 4: Banner CTA (Audioguía u otro)
    bannerCTA: z.object({
      visible: z.boolean().default(true),
      link: z.string().optional(),
      emoji: z.string().default('🎧').optional(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      bgGradient: z.string().default('from-SM-blue to-blue-700').optional(),
    }).optional(),

    // Sección 5: Información y Horarios
    infoHorarios: z.object({
      visible: z.boolean().default(true),
      title: z.string().default('Información y Horarios'),
      subtitle: z.string().optional(),
      horarios: z.object({
        temporadaAlta: z.object({
          periodo: z.string(),
          horario: z.array(z.string()),
        }).optional(),
        temporadaBaja: z.object({
          periodo: z.string(),
          horario: z.array(z.string()),
        }).optional(),
        festivos: z.string().optional(),
      }).optional(),
      servicios: z.array(z.object({
        emoji: z.string(),
        title: z.string(),
        description: z.string(),
      })).optional(),
      contacto: z.object({
        telefono: z.string().optional(),
        email: z.string().optional(),
      }).optional(),
    }).optional(),

    // Sección 6: Actividades
    actividades: z.object({
      visible: z.boolean().default(true),
      title: z.string().default('Conoce las Actividades Turísticas'),
      subtitle: z.string().optional(),
      items: z.array(z.object({
        emoji: z.string(),
        title: z.string(),
        subtitle: z.string(),
        link: z.string(),
        gradient: z.string(),
      })),
    }).optional(),

    // Burbujas personalizadas (opcional)
    burbujas: z.array(z.string()).optional(),
  }),
});

export const collections = {
  'virtual-offices': virtualOfficesCollection,
};
