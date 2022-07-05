const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

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
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
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
  if (persons.map(each => each.name).includes(body.name)) {
    console.log("duplicate name")
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const newPerson = {
    id: generateID(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(newPerson)

  response.json(newPerson)
})

app.get('/info', (request, response) => {
  response.send(`<div>
                  Phonebook has info for ${persons.length} people
                  <p>
                    ${Date()}
                  <p/>
                </div>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(note => note.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(note => note.id !== id)

  response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})