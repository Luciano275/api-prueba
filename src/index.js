const express = require('express');
const PORT = process.env.PORT || 54321
const app = express()
const movies = require('./movies.json')
const crypto = require('crypto')
const z = require('zod');
const { validateScheme, validatePartialMovie } = require('./schemas/movies')
const morgan = require('morgan')
const cors = require('cors');

const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:27017'
]

app.disable('x-powered-by')

app.set('port', PORT)

app.use(express.json())

app.use(morgan('dev'))

app.use(cors({
  origin: [...ALLOWED_ORIGINS],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
}))

app.get('/movies', (req,res) => {

  const { genre } = req.query;

  if (genre) {
    const filteredMovies = movies.filter((movie) => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase()))

    if (!filteredMovies.length) return res.json({message: `No hay peliculas del genero ${genre}`})

    return res.json({
      message: `Peliculas del genero ${genre}`,
      totalResults: filteredMovies.length,
      movies: filteredMovies,
    })

  }

  res.json(movies)
})

app.get('/movies/:id', (req,res) => {
  const movie = movies.find(({id}) => id === req.params.id) // undefined if not exists
  if (!movie) return res.status(404).json({message: 'No existe esa pelicula.'})
  
  res.json({
    message: 'Pelicula recuperada.',
    movie
  })
})

app.post('/movies', (req,res) => {

  const results = validateScheme(req.body);

  if(!results.success) {
    return res.status(400).json({error: results.error})
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...results.data
  }

  movies.push(newMovie) // Esto no es REST

  res.status(201).json(newMovie)

})

app.patch('/movies/:id', (req,res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if(movieIndex < 0) return res.status(404).json({message: 'No se encontro la pelicula.'})

  const results = validatePartialMovie(req.body)

  if(!results.success) return res.status(400).json({error: results.error})

  const updateMovie = {
    ...movies[movieIndex],
    ...results.data
  }

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie)
  

})

app.delete('/movies/:id', (req,res) => {

  const { id } = req.params;
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if (movieIndex < 0) return res.status(404).json({message: 'No se encontro la pelicula.'})

  movies.splice(movieIndex, 1);

  return res.json({message: 'Deleted'})

})

app.listen(app.get('port'), () => {
  console.log(`Server running on http://localhost:${PORT}`)
})