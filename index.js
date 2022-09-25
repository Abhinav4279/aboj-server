const express = require("express");
const cors = require("cors");

const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executeAsm } = require("./executeAsm")

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

  try {
    const filepath = await generateFile(language, code);

    let output;
    switch(language) {
      case 'cpp':
        output = await executeCpp(filepath);
        break;
      case 'asm':
        output = await executeAsm(filepath);
    }

    return res.json({ filepath, output });
  } catch (err) {
    res.status(500).json({err});
  }
});

app.listen(5000, () => {
  console.log(`Listening on port 5000!`);
});
