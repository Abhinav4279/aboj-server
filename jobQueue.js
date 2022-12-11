const Queue = require('bull');
const { executeCpp } = require("./executeCpp");
const { executeAsm } = require("./executeAsm")

const jobQueue = new Queue('job-queue');
const NUM_WORKERS = 5;
const Job = require('./models/Job');

jobQueue.process(NUM_WORKERS, async ({ data }) => {
  console.log(data);
  const { id: jobId } = data;
  //query db
  const job = await Job.findById(jobId);

  if (job === undefined) {
    throw Error("Job not found");
  }
  // console.log('Job fetched', job);

  try {
    job["startedAt"] = new Date();
    switch (job.language) {
      case 'cpp':
        output = await executeCpp(job.filepath);
        break;
      case 'asm':
        output = await executeAsm(job.filepath);
    }

    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;

    // console.log(output);
    await job.save();
  } catch (err) {
    const { error } = err;
    // console.log(error.code)
    job['completedAt'] = new Date();
    job['status'] = 'error';
    job['output'] = JSON.stringify(err);

    if(error.code === 124)
      job['status'] = 'timeout';

    await job.save();
  }

  return true;
})

jobQueue.on('failed', (error) => {
  console.log(error.data.id, 'failed', error.failedReason);
})

const addJobToQueue = async (jobId) => {
  await jobQueue.add({ id: jobId });
};

module.exports = {
  addJobToQueue
}