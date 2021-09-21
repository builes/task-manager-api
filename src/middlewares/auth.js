//middlewares allow us customize the behaviour of the server when a request is made
//
//Without middleware: new request --> run route handler
//
//With middleare: new request --> do something --> run route handler
//

//Los miodlewares deben de ir por encima de app.use()
//para registrar una nueva funcion de middlewarelo hacemos asi
// app.use((req, res, next) => {
//   //console.log(req.method, req.path);

//   if (req.method === "GET") {
//     res.send("Get request are disabled");
//   } else {
//     next();
//   }
// });

//middleware para cuando la pagina este en mantenimiento
// app.use((req, res, next) => {
//   res.status(503).send("Maintenance");
// });

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }

    //Podemos asignar valores con req que luego podremos usar en la funcion que llama a esta funcion
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
