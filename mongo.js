const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://joo:${password}@round3.qw53lvw.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {

  console.log("Phonebook:")
  Person.find({}).then(result => {
    result.forEach(each => {
      console.log(`${each.name} ${each.number}`)
    })
    mongoose.connection.close()
  })

} else if (process.argv.length === 5) {
  
  const person = new Person({
    name: `${process.arvg[3]}`,
    number: `${process.arvg[4]}`
  })

  person.save().then(result => {
    console.log(`Added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}

// const person = new Person({
//   content: 'HTML is Easy',
//   date: new Date(),
//   important: true,
// })

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })

