const express = require("express");
const Task = require("../models/task");
const router = new express.Router();
const auth = require("../middlewares/auth");

// //esta ruta crea tareas pero no tiene ningun usuario asociado
// router.post("/tasks", async (req, res) => {
//   const task = new Task(req.body);

//   try {
//     await task.save();
//     res.status(201).send(task);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });
router.post("/tasks", auth, async (req, res) => {
  //const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user.id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// router.get("/tasks", async (req, res) => {
//   try {
//     const tasks = await Task.find({});
//     res.send(tasks);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });
// router.get("/tasks", auth, async (req, res) => {
//   try {
//     // Forma numero 1 de mostrar todoas las tareas por ususario
//     const tasks = await Task.find({ owner: req.user._id });
//     //Forma numero 2 de mostrar todas las tareas por usuario
//     // await req.user.populate("tasks");

//     res.send(tasks);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

//GET /tasks?completed
//GET /tasks?limit=10&skip=10
//GET /tasks?sortBy=createdAt_desc
router.get("/tasks", auth, async (req, res) => {
  //Asi obtenemos una value pasada como parametro por la URL
  const match = {};
  const sort = {};
  const completed = req.query.completed;
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });

    res.send(req.user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// router.get("/tasks/:id", async (req, res) => {
//   const _id = req.params.id;

//   try {
//     const task = await Task.findById(_id);
//     if (!task) {
//       res.status(404).send;
//     }
//     res.send(task);
//   } catch (error) {
//     res.status(500).send();
//   }
// });

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      res.status(404).send;
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

// router.patch("/tasks/:id", async (req, res) => {
//   const updateFields = Object.keys(req.body);

//   const allowedUpdates = ["description", "completed"];

//   //every retorna true si todos los elementos que retorna son true, si alguno es false retorna false
//   const isValidOperation = updateFields.every((field) =>
//     allowedUpdates.includes(field)
//   );

//   if (!isValidOperation) {
//     return res.status(400).send({ error: "Invalid updates fields" });
//   }

//   try {
//     // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
//     //   new: true,
//     //   runValidators: true,
//     // });

//     //Asi hacemos para que podamos usar middlewares
//     const task = await Task.findById(req.params.id);
//     updateFields.forEach((field) => (task[field] = req.body[field]));
//     await task.save();

//     res.send(task);
//   } catch (error) {
//     if (error.errors) {
//       //Este error ocurre cuando no se envia informacion de un campo requerido
//       return res.status(400).send();
//     } else if (error.path) {
//       //Este error ocurre cuando el id no se encuentra en la BD
//       return res.status(404).send();
//     }
//     res.send(error);
//   }
// });

router.patch("/tasks/:id", auth, async (req, res) => {
  const updateFields = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updateFields.every((field) =>
    allowedUpdates.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates fields" });
  }

  try {
    //Asi solo podemos consultar por id tareas mias y no de otro usuario
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    updateFields.forEach((field) => (task[field] = req.body[field]));
    await task.save();

    res.send(task);
  } catch (error) {
    if (error.errors) {
      //Este error ocurre cuando no se envia informacion de un campo requerido
      return res.status(400).send();
    } else if (error.path) {
      //Este error ocurre cuando el id no se encuentra en la BD
      return res.status(404).send();
    }
    res.send(error);
  }
});

// router.delete("/tasks/:id", async (req, res) => {
//   try {
//     const task = await Task.findByIdAndDelete(req.params.id);
//     if (!task) {
//       return res.status(404).send();
//     }
//     res.send(task);
//   } catch (error) {
//     res.status(500).send();
//   }
// });

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;

//lista de codigos
//200 todo salio bien
//201 algo fue creado
//400 bad request
//404 not found
