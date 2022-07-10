require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person') 

const morganLogger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    (
      (tokens.method(req, res) === 'POST')
        ? JSON.stringify(req.body)
        : null
    )
  ].join(' ')
})

app.use(express.json())
app.use(morganLogger)
app.use(cors())

const generateID = () => {
  return Math.floor(Math.random() * 1000)
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.post('/api/persons', async (request, response, next) => {
  const body = request.body

  if (!body.name) {
    console.log("name missing")
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  if (!body.number) {
    console.log("number missing")
    return response.status(400).json({
      error: 'number missing'
    })
  }
  if (await Person.exists({name:body.name})){
    return response.status(400).json({
      error:'name must be unique'
    })
  }
  const newPerson = new Person({
    id: generateID(),
    name: body.name,
    number: body.number,
  })
  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(immu => {
    response.send(
      `<div>
        Phonebook has info for ${immu} people
        <p>
          ${Date()}
        <p/>
      </div>`)
  })
  
})

app.get('/api/persons/:id', (request, response, next) => {
  console.log(request.params.id)
  Person.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  
  const updatedPerson = {
    name: body.name,
    number: body.number,
  }
  console.log(request.params)
  console.log(body)
  console.log(request.params.id)
  Person.findByIdAndUpdate(request.params.id, updatedPerson, { new: true })
    .then(updated => {
      response.json(updated)
    })
    .catch(error => next(error))
})

app.use(express.static('build'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})