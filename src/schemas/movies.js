const z = require('zod');

const movieSchema = z.object({
  title: z.string({
    required_error: 'Se require el titulo de la pelicula.'
  }),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int().min(0).max(360),
  poster: z.string().url(),
  rate: z.number().min(0).max(10).default(5),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'], {
      required_error: 'Se requiere el genero de la pelicula.'
    })
  )
})

exports.validateScheme = (obj) => movieSchema.safeParse(obj)
exports.validatePartialMovie = (obj) => movieSchema.partial().safeParse(obj) // Todas las propiedades las hace opcionales. Si encuentra una, la valida como corresponda.