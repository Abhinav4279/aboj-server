const mongoose  = require('mongoose')

const JobSchema = mongoose.Schema({
  statement: {
    type: String,
    required: true,
  },
  testspath: {
    type: String,
    required: true
  }
});

const Job = new mongoose.model('job', JobSchema)

module.exports = Job;