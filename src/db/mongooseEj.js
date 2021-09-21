const mongoose = require("mongoose");
const validator = require("validator");

//Asi nos conectamos a la BD, en caso de que no esxista crea una nueva
mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", {
  useNewUrlParser: true,
});

//Asi creamos un modelo
//Un modelo vendria siendo una coleccion donde le decimos que campos va a tener esa coleccion y que tipo de dato va a tener cada campo
//si el nombre que le ponemos a la coleccion no termina en s mongoose le agrega la s automaticamente
const User = mongoose.model("User", {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error("Age must be a positive number");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 7,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("password must be different to password");
      }
    },
  },
});

//Asi creamos una instancia del modelo creado anteriormente
const user = new User({
  name: "    Mauricio  ",
  email: "BUILES@UTP.EDU.CO",
  age: 28,
  password: "1234567",
});

// Asi guardamos la instancia en la BD
// __v es la version del documento
// user
//   .save()
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.log(error);
//   });

const Task = mongoose.model("Task", {
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
});

const task1 = new Task({ description: "Clean the house", completed: false });

// task1
//   .save()
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.log(error);
//   });
