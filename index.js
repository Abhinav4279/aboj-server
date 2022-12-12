const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose')

const { generateFile } = require("./generateFile");
const Job = require('./models/Job');
const { addJobToQueue } = require('./jobQueue')

mongoose.connect("mongodb://localhost/compilerapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if(err) {
    console.error(err);
    process.exit(1);
  }
  console.log("MongoDB connected");
}); 

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/status', async(req, res) => {
  const jobId = req.query.id;
  if(jobId === undefined) {
    return res.status(400).json({success: false, error: 'id missing'});
  }

  try {
    const job = await Job.findById(jobId);
    
    if(job === undefined) {
      return res.status(404).json({success: false, error: "job id doesn't exist"})
    }

    return res.status(200).json({success: true, job});
  } catch(err) {
    return res.status(400).json({success: false, error: JSON.stringify(err)});
  }

})

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  console.log(language, "Length:", code.length);

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }

  let job;
  try {
    const filepath = await generateFile(language, code);
    
    job = await new Job({language, filepath}).save()
    const jobId = job["_id"];
    addJobToQueue(jobId)

    res.status(201).json({success: true, jobId});
  } catch(err) {
    return res.status(500).json({success: false, err: JSON.stringify(err)})
  }
});

app.post('/submit', async (req, res) => {
  const { language = "cpp", code } = req.body;
  console.log(language, "Length:", code.length);

  //------TODO: modularize from /run
  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }

  let job;
  try {
    const filepath = await generateFile(language, code);
    
    job = await new Job({language, filepath}).save()
    const jobId = job["_id"];
    addJobToQueue(jobId)

    res.status(201).json({success: true, jobId});
  } catch(err) {
    return res.status(500).json({success: false, err: JSON.stringify(err)})
  }
  //-----


});

app.listen(5000, () => {
  console.log(`Listening on port 5000!`);
});
