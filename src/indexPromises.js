//no asignamos una constante a este archivo ya que no vamos a tomar nada de el, solo queremos que se conecte a la BD
//Cuando llamos a un archivo asi este se ejecuta automaticamente
require("./db/mongoose");
const express = require("express");

//importamos los modelos de las colecciones que tenemos
const User = require("./models/user");
const Task = require("./models/task");

const app = express();
const port = process.env.PORT || 3000;

//Con esto decimos que los datos enviados al servidor seran en formato json
app.use(express.json());

app.post("/users", (req, res) => {
  //Asi accedemos a los datos enviados por el usaurio
  console.log(req.body);

  //luego creamos una instancia del modelo user
  const user = new User(req.body);

  //luego guardamos la instancia en la BD
  user
    .save()
    .then(() => {
      res.status(201).send(user);
    })
    .catch((error) => {
      //asi enviamos un status en particular de la respuesta
      res.status(400).send(error);
    });
});

app.get("/users", (req, res) => {
  //asi mostramos todos los documentos(registros) que tenga una coleccion(tabla)
  //como primer argumento pasamos por que vamos a buscar
  //si pasamos un objeto vacio nos retorna todos los documentos de la coleccion
  User.find({})
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.get("/users/:id", (req, res) => {
  //asi obteemos los parametros enviados por la url
  //el parametro seria cualquier cosa que se envie despuese de user/cualquierCosa
  console.log(req.params);

  const _id = req.params.id;

  //si no encuentra ningun usuario con el id genera error
  User.findById(_id)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/tasks", (req, res) => {
  const task = new Task(req.body);

  task
    .save()
    .then(() => {
      res.status(201).send(task);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.get("/tasks", (req, res) => {
  Task.find({})
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.get("/tasks/:id", (req, res) => {
  const _id = req.params.id;
  Task.findById(_id)
    .then((result) => {
      if (!result) {
        return res.status(404).send();
      }
      res.send(result);
    })
    .catch(() => {
      res.status(500).send();
    });
});

app.listen(port, () => console.log("Port runing on server 3000"));

//en esta pagina vemos que significa cada response
//https://httpstatuses.com/
