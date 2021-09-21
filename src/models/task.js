const mongoose = require("mongoose");
const validator = require("validator");

//Asi creamos un modelo
//Un modelo vendria siendo una coleccion donde le decimos que campos va a tener esa coleccion y que tipo de dato va a tener cada campo
//si el nombre que le ponemos a la coleccion no termina en s mongoose le agrega la s automaticamente y pone el nombre en minuscula
//Con mongoose.model no podemos crear timestamps asi que lo hacemos con mongoose.Schema
// const Task = mongoose.model("Task", {
//   description: {
//     type: String,
//     required: true,
//     tirm: true,
//     required: true,
//   },
//   completed: {
//     type: Boolean,
//     default: false,
//   },
//   owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "User",
//   },
// });

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      tirm: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

//tenemos dos maneras de establecer una relacion entre un usuario y una tarea
// una manera es que el usuario podria almacenar el id de todas las tareas que ha creado
// La otra manera es que la tarea individual podria guardar el id de quien la creo
//En este caso vamos a implementar la segunda manera
// Con ref creamos una referencia a otro modelo de la BD

module.exports = Task;
