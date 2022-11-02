/*************************************************************************
* WEB322- Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source.
* (including 3rd party web sites) or distributed to other students.
*
* Name: Het patel || Student ID: 154671218 || Date: 30/10/2022
*
* Your app’s URL (from Cyclic Heroku) that I can click to see your application:
* ______________________________________________
*
*************************************************************************/
var data_service = require("./data-service.js");
var port = process.env.PORT || 8080;
var express = require("express");
var app = express();
const path = require('path');
const multer = require("multer");
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

//function for start app on 8080 port
function Start() {
  return new Promise(function (reslove, reject) {
    data_service
      .initialize()
      .then(function (data) {
        console.log(data);
      })
      .catch(function (reason) {
        console.log(reason);
      });
  });
}

app.use(express.static("public"));
//dfault path route Home page
app.get("/", function (rqust, res) {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});
// aboute bage file foute
app.get("/about", function (rqust, res) {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});
//department file route and url created departments
app.get("/departments", function (rqust, res) {
  data_service
    .getDepartments()
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});
// employee file route and url employees

app.get("/employees", async function (rqust, res) {
  try {
    let dataReq;
    if (rqust.query.status) {
      dataReq = await data_service.getEmployeesByStatus(rqust.query.status);
    } else if (rqust.query.department) {
      dataReq = await data_service.getEmployeesByDepartment(rqust.query.department);
    } else if (rqust.query.manager) {
      dataReq = await data_service.getEmployeeByManager(rqust.query.manager);
    } else {
      dataReq = await data_service.getAllEmployees();
    }
    res.json(dataReq);
  } catch (error) {
    res.json({ message: error });
  }
});
app.get("/employee/:value", function (rqust, res) {
  data_service
    .getEmployeeByNum(rqust.params.value)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});
// manager file route and url managers
app.get("/managers", function (rqust, res) {
  data_service
    .getManagers()
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

app.get("/employees/add", function (rqust, res) {
  res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});

app.post("/employees/add", function (rqust, res) {
  data_service
    .addEmployee(rqust.body)
    .then(function (data) {
      res.redirect("/employees");
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

app.get("/images/add", function (rqust, res) {
  res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/images", function (rqust, res) {
  fs.readdir("./public/images/uploaded", function (err, items) {
    res.json(items);
  });
});

app.use(function (rqust, res) {
  res.status(404).send("Page Error");
});

app.listen(port, Start);
