const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

//Como segundo argumento podemos pasarle un objeto y poner timestamps
//esto nos muestra cuando se crea y se actualiza el objeto
//Creo que el Schema se crea para poder usar la opcion validate que no se usa en el model
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
    //Token sera una matriz de objetos
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

//Asi creamos una relacion entre dos colecciones(entidades)
// En este caso sera entre nuestro usuario y las tareas
//esto no se almacena en la BD
//Esto seria como establecer un Fk en BD relacionales
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

//metodos del objeto
//asi podemos crear funciones que pueden ser utilizados por las instancias de User()
userSchema.methods.generateAuthToken = async function () {
  //Asi creamos el token para un usuario
  const token = jwt.sign({ _id: this.id.toString() }, process.env.JWT_SECRET);

  //cada que se genere el token lo guardamos en el campo token de la BD
  this.tokens = this.tokens.concat({ token });
  await this.save();

  return token;
};

//Manera 1 de eliminar password y tokens
//Con arrow functions no podemos usar this
// userSchema.methods.getPublicProfile = async (user) => {
//   delete user._doc.password;
//   delete user._doc.tokens;
//   delete user._doc.tokens;
//   delete user._doc.__v;

//   return user;
// };

//Manera2 de eliminar password y tokens
// userSchema.methods.getPublicProfile = function () {
//   delete this._doc.password;
//   delete this._doc.tokens;
//   delete this._doc.__v;

//   return this;
// };

//manera 3 de eliminar password y tokens
//este metodo no tiene que ser llamado
//se ejecuta automaticamente en todas las instancias de User
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.__v;
  delete userObject.avatar;

  return userObject;
};

//metodo que solo puede ser usado por la clase
//Este metodo no puede ser usado por la instancias de User solo por User
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }
  //Aca validamos si la password ingresada por el usuario concuerda con la que tenemos como hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

//el metodo pre lo usamos para que haga algo antes de guardar algo en la BD
//este metodo recibe dos argumentos, el primero es el nombre del evento y el segundo es una funcion
//debe ser una funcion normal
//El objetivo principal de esto es ejecutar algo de cdigo antes de que se guarde el usuario
//en este caso cifraremos la contraseña
userSchema.pre("save", async function (next) {
  //Asi vemos si un campo fue modificado, esto es cierto cuando se crea la password por primera vez
  //tambien es cierto  si el usuario actualiza la contraseña
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  //next() lo usuamos para decir que ya finalizamos nuestra funcion, siempre debemos de ponerlo
  next();
});

//Delete user tasks when user is deleted
userSchema.pre("remove", async function (next) {
  await Task.deleteMany({ owner: this._id });
  next();
});

// cuando pasamos un modelo a esta funcion detras de bambalinas lo convierte en un schema
// asi que le podemos pasar un schema directamente
const User = mongoose.model("User", userSchema);

module.exports = User;
