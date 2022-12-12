const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");
const testsPath = path.join(__dirname, "tests");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);
  const testPath = path.join(testsPath, `${probId}.in`);

  return new Promise((resolve, reject) => {
    exec(
      `timeout 8s g++ ${filepath} -o ${outPath} && cd ${outputPath} && timeout 8s ./${jobId}.out`,
      (error, stdout, stderr) => {
        error && reject({ error, stderr });
        stderr && reject(stderr);
        resolve(stdout);
      }
    );
  });
};

module.exports = {
  executeCpp,
};
