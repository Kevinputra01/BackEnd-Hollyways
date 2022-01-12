const { user } = require("../../models");

exports.getAllUsers = async (req, res) => {
  try {
    const data = await user.findAll({ attributes: { exclude: ["password", "createdAt", "updatedAt"] } });
    res.status(200).send({
      status: "success",
      data: {
        user: data,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.editUser = async (req, res) => {
  console.log(req.users);
  console.log(req.file.filename);
  try {
    const data = { image: req.file.filename };
    await user.update(data, { where: { id: req.users.id } });
    const response = await user.findOne({
      where: { id: req.users.id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    res.status(200).send({
      status: "success",
      data: {
        user: response,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await user.destroy({ where: { id } });
    if (result == 1) {
      res.status(200).send({
        status: "success",
        data: {
          id,
        },
      });
    } else {
      res.status(400).send({
        status: "error",
        message: "User doesn't exist",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};
