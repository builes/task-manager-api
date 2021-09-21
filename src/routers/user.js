const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middlewares/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, deletedAccount } = require("../emails/account");

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    sendWelcomeEmail(user);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    // const publicUser = await user.getPublicProfile();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

//Si queremos que el middleware funcione solo para algunas rutas en especifico lo pasamos como segundo argumento de la funcion
//Para acceder a la ruta primero debe estar autenticado
router.get("/users/me", auth, async (req, res) => {
  //Asi mostramos a todos los usuarios, pero como so deseamos mostrar un usario cambiamos el codigo
  // try {
  //   const users = await User.find({});
  //   res.send(users);
  // } catch (error) {
  //   res.status(500).send(error);
  // }

  res.send(req.user);
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return req.token !== token.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    // req.user.tokens = []
    //la diferncia entre slice y splice es que splice modifica el array original y slace retorna una copia
    req.user.tokens.splice(0);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//Comentamos esta ruta ya que ningun usuario debe de ver los perfiles de otro
// router.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;

//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       res.status(404).send();
//     }
//     res.send(user);
//   } catch (error) {
//     res.status(500).send();
//   }
// });

//usamos patch para actualizar
//Comentamos esta ruta ya que solo deseamos actualizar mi perfil y no cualquier perfil
// router.patch("/users/:id", async (req, res) => {
//   //aca obtenemos el objeto con los campos que el usuario desea modificar
//   //luego obtenemos en un array las keys del objeto
//   const updateFields = Object.keys(req.body);

//   //aca creamos un array con los campos que se pueden modificar del usuario
//   const allowedUpdates = ["name", "email", "password", "age"];

//   //every retorna true si todos los elementos que retorna son true, si alguno es false retorna false
//   const isValidOperation = updateFields.every((field) =>
//     allowedUpdates.includes(field)
//   );

//   if (!isValidOperation) {
//     return res.status(400).send({ error: "Invalid updates fields" });
//   }

//   try {
//     // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//     //   new: true,
//     //   runValidators: true,
//     // });

//     //Asi nos aseguramos que un middleware se ejecute corrrectamente
//     const user = await User.findById(req.params.id);
//     updateFields.forEach((field) => (user[field] = req.body[field]));
//     await user.save();

//     res.send(user);
//   } catch (error) {
//     res.status(400).send();
//   }
// });
router.patch("/users/me", auth, async (req, res) => {
  const updateFields = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updateFields.every((field) =>
    allowedUpdates.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates fields" });
  }

  try {
    updateFields.forEach((field) => (req.user[field] = req.body[field]));
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Vamos a confugurar un anueva ruta para que el usuario se pueda solo eliminar a si mismo
// router.delete("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   } catch (error) {
//     res.status(500).send();
//   }
// });

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    deletedAccount(req.user);
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

//si vamos a guardar las imagenes en la base de datos no ponemos dest: fileLocation
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("You must upload an Image"));
    }
    cb(undefined, true);
  },
});

//Podemos poner varios middleware en una ruta
//Aca primero ponemos auth ya que queremos que el usuario este auntenticado
//Si esta autenticado puede subir la imagen
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    //Asi guardamos la imagen en el formato y tamano original que la sube el usuario
    // req.user.avatar = req.file.buffer;

    //podemos modificar el tamano y el formato de la imagen(en este caso png) con sharp
    const buffer = await sharp(req.file.buffer)
      .png()
      .resize({ width: 250, height: 250 })
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
    //la funcion de abajo la creamos para manejar los errores
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();

  res.send();
});

//Asi hacemos para que se puedan visualizar las imagenes en el navegador
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    //Asi configuramos un encabezado
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;

//lista de codigos
//200 todo salio bien
//201 algo fue creado
//400 bad request
//404 not found
