const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const { title } = require("process");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  fs.readdir(`./files`, (err, files) => {
    if (err) {
      console.error("Error reading files:", err);
      return res.status(500).send("Internal Server Error");
    }

    const tasks = files.map((file) => {
      const content = fs.readFileSync(`./files/${file}`, "utf8");
      return { title: file, details: content };
    });
    res.render("index", { files: tasks });
  });
});

app.get("/file/:filename", (req, res) => {
  fs.readFile(
    `./files/${req.params.filename}`,
    "utf-8",
    function (err, filedata) {
      res.render("show", {
        filename: req.params.filename,
        filedata: filedata,
      });
    }
  );
});

app.post("/create", (req, res) => {
  fs.writeFile(
    `./files/${req.body.title.split(" ").join("")}.txt`,
    req.body.details,
    function (err) {
      if (err) {
        console.error("Error creating task:", err);
        return res.status(500).send("Internal Server Error");
      }
      res.redirect("/");
    }
  );
});

app.get("/edit/:filename", (req, res) => {
  const filedata = req.params.filename;
  res.render("edit", { filename: filedata });
});

app.post("/edit", (req, res) => {
  fs.rename(
    `./files/${req.body.previous}`,
    `./files/${req.body.new}`,
    (err) => {
      res.redirect("/");
    }
  );
});

app.get("/delete/:filename", (req, res) => {
  const filePath = `./files/${req.params.filename}`;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).send("Internal Server Error");
    }
    console.log("File deleted successfully:", filePath);

    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on Port ${PORT}`);
});
