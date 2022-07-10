const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: { // interpered as the whole string having a minimum of 8 characters (so 7 numbers and " - ")
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{2,3}[-]{1}[0-9]{4,15}$/.test(v); // "enough characters" implemented as at most 15 characters in the second part of the number
      },
      message: props => `${props.value} is not a valid phone number`
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)