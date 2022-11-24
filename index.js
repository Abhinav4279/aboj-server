const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose')

const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executeAsm } = require("./executeAsm")
const Job = require('./models/Job');

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
    console.log(job)

    res.status(201).json({success: true, jobId});

    let output;

    job["startedAt"] = new Date();
    switch(language) {
      case 'cpp':
        output = await executeCpp(filepath);
        break;
      case 'asm':
        output = await executeAsm(filepath);
    }

    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;

    await job.save();

    console.log({file, output});
    // return res.json({ filepath, output });
  } catch (err) {
    job['completedAt'] = new Date();
    job['status'] = 'error';
    job['output'] = JSON.stringify(err);
    await job.save();
    console.log(err);
    // res.status(500).json({err});
  }
});

app.listen(5000, () => {
  console.log(`Listening on port 5000!`);
});
