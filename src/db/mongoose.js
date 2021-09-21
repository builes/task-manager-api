const mongoose = require("mongoose");
//Asi nos conectamos a la BD, en caso de que no esxista crea una nueva
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
});
