require("./db/mongoose");
const express = require("express");

//Routers
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

//Asi creamos un middleware que aplica para todas las rutas
// app.use((req, res, next) => {
//   if (req.method === "GET") {
//     res.send("GET request are disabled");
//   } else {
//     next();
//   }
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => console.log(`Port runing on server ${port}`));

//-----------------------------------------------//------------------------------------------//

// const bcrypt = require("bcryptjs");

// const myFunction = async () => {
//   const password = "1234";
//   const hashPassword = await bcrypt.hash(password, 8);

//   console.log(hashPassword);

//   //con el metodo compare comparamos si un texto plano coincide con el hash de ese texto
//   const isMatch = await bcrypt.compare(password, hashPassword);
//   console.log(isMatch);
// };

// myFunction();

//No es lo mismo hash que cifrado o criptografia

//-----------------------------------------------//------------------------------------------//

// const jwt = require("jsonwebtoken");

// async function myFunction() {
//   //Asi podemos crear toquens de autenticacion
//   //sign retorna el usuario que intenta iniciar sesion
//   const token = jwt.sign({ _id: "abc123" }, "secretword", {
//     expiresIn: "7 days",
//   });

//   //asi vemos a que id pertenece el token
//   const data = jwt.verify(token, "secretword");
//   console.log(data);
// }

// myFunction();

//-----------------------------------------------//------------------------------------------//

//aca miraremos que hace la funcio toJSON
// const pet = { name: "hall" };

// pet.toJSON = function () {
//   //console.log(this);
//   return {};
// };

// //Asi convertimos a formate JSON
// console.log(JSON.stringify(pet));

//-----------------------------------------------//------------------------------------------//

// const Task = require("./models/task");
// const User = require("./models/user");

// const findOwner = async () => {
//   const task = await Task.findById("6147a0b8b01e37d2bdb2575b");

//   //Esta linea encontrara al usuario que esta asociado con esta tarea
//   //para poder hacer el paso anterior debimos haber puesto en el modelo de task ref: 'User'
//   await task.populate(["owner"]);
//   console.log(task.owner);
// };

// // findOwner();

// //Asi encontramos todas las tareas para un usuario
// const findTask = async () => {
//   const user = await User.findById("61479eb92aac86b7a8834d85");
//   await user.populate(["tasks"]);
//   console.log(user.tasks);
// };
// findTask();

//----------------------------------------------------//------------------------------------------------

//upload files

// const multer = require("multer");

// // en dest ponemos la carpeta donde queremos que se guarden los archivos subidos
// const upload = multer({
//   dest: "images",
//   limits: {
//     //Aca el tamano debemos ponerlo en bytes
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     //esto retorna true si el archivo que se quiere subir es de tipo pdf
//     // if (!file.originalname.endsWith(".pdf")) {
//     //   return cb(new Error("File must be a PDF"));
//     // }
//     // cb(undefined, true);

//     //Asi le decimos que aceptamos difierentes tipos de formatos
//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       return cb(new Error("Please upload a word document"));
//     }
//     cb(undefined, true);

//     //Asi podemos enviar un error a la persona que subio el archivo
//     // cb(new Error("File must be a PDF"));
//     //Si el archivo fue correcto continua asi
//     // cb(undefined, true)
//     // cb(undefined, false)
//   },
// });

// //Para enviar los datos por postman de una imagen vamos a body/form-data
// //como key en postman debemos de poner lo que le pasamos como argumento a upload.single()
// app.post(
//   "/upload",
//   upload.single("upload"),
//   (req, res) => {
//     res.send();
//   },
//   (error, req, res, next) => {
//     res.status(400).send({ error: error.message });
//   }
// );
