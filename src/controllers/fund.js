const { fund, donate, user } = require("../../models");
const fs = require("fs");

exports.getAllFunds = async (req, res) => {
  try {
    const dataFund = await fund.findAll({
      order: [["id", "DESC"]],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    const usersDonate = await donate.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    const data = dataFund.map((fund) => {
      return {
        id: fund.id,
        title: fund.title,
        thumbnail: fund.thumbnail,
        goal: fund.goal,
        description: fund.description,
        idUser: fund.idUser,
        donationObtained: usersDonate.reduce((total, donation) => {
          if (donation.idFund == fund.id) {
            if (donation.status == "success") {
              return total + donation.donateAmount;
            } else {
              return total;
            }
          } else {
            return total;
          }
        }, 0),
        usersDonate: usersDonate.map((donate) => {
          if (donate.idFund == fund.id) {
            return donate;
          } else {
            return "";
          }
        }),
      };
    });
    res.status(200).send({
      status: "success",
      data: {
        funds: data,
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

exports.getFund = async (req, res) => {
  try {
    const { id } = req.params;
    const dataFund = await fund.findOne({
      where: { id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    const usersDonate = await donate.findAll({
      where: { idFund: id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    const data = {
      id: dataFund.id,
      title: dataFund.title,
      thumbnail: dataFund.thumbnail,
      goal: dataFund.goal,
      description: dataFund.description,
      idUser: dataFund.idUser,
      donationObtained: usersDonate.reduce((total, donation) => {
        if (donation.idFund == dataFund.id) {
          if (donation.status == "success") {
            return total + donation.donateAmount;
          } else {
            return total;
          }
        } else {
          return total;
        }
      }, 0),
      usersDonate: usersDonate.map((donate) => {
        if (donate.idFund == dataFund.id) {
          return donate;
        } else {
          return "";
        }
      }),
    };
    res.status(200).send({
      status: "success",
      data: {
        fund: data,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.addFund = async (req, res) => {
  console.log(req.users);
  try {
    const data = await fund.create({
      ...req.body,
      idUser: req.users.id,
      thumbnail: req.file.filename,
    });
    const value = data.dataValues;
    const response = {
      id: value.id,
      title: value.title,
      thumbnail: value.thumbnail,
      goal: value.goal,
      description: value.description,
    };
    res.status(200).send({
      status: "success",
      data: {
        fund: { ...response, usersDonate: [] },
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

exports.editFund = async (req, res) => {
  try {
    const { id } = req.params;
    const compareImg = await fund.findOne({ where: { id } });
    const body = {
      ...req.body,
      idUser: req.users.id,
    };
    await fund.update(body, { where: { id } });
    const data = await fund.findOne({
      where: { id },
      include: [
        {
          model: donate,
          as: "usersDonate",
          attributes: { exclude: ["idUser", "idFund", "createdAt", "updatedAt"] },
        },
      ],
      attributes: { exclude: ["idUser", "createdAt", "updatedAt"] },
    });
    res.status(200).send({
      status: "success",
      data: {
        fund: data,
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

exports.deleteFund = async (req, res) => {
  try {
    const { id } = req.params;

    //delete proof attachment
    const dataDonate = await donate.findAll({
      where: {
        idFund: id,
      },
    });

    if (dataDonate) {
      dataDonate.map((donate) => {
        fs.unlink("uploads/" + donate.proofAttachment, (err) => {
          if (err) throw err;
          return console.log("Delete proof donate image");
        });
      });
    }

    //delete thumbnail fund
    const dataFund = await fund.findOne({
      where: {
        id,
      },
    });
    fs.unlink("uploads/" + dataFund.thumbnail, (err) => {
      if (err) throw err;
      console.log("Delete fund thumbnail");
    });

    //delete fund
    await fund.destroy({ where: { id } });
    res.status(200).send({
      status: "success",
      data: {
        id,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.addUserDonate = async (req, res) => {
  const { fundId } = req.params;
  const userData = await user.findOne({
    where: { id: req.users.id },
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  const data = { ...req.body, fullname: userData.fullname, email: userData.email, proofAttachment: req.file.filename, idUser: userData.id, idFund: fundId };

  try {
    const userDonate = await donate.create(data);
    res.status(200).send({
      status: "success",
      data: {
        userDonate,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.getUserDonateByFund = async (req, res) => {
  const { fundId } = req.params;
  try {
    const data = await donate.findAll({
      where: { idFund: fundId },
      attributes: { exclude: [ "updatedAt"] },
    });
    res.status(200).send({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.editUserDonateByFund = async (req, res) => {
  try {
    const { fundId, userId } = req.params;

    await donate.update(req.body, { where: { idFund: fundId, id: userId } });

    const data = await fund.findOne({
      where: { id: fundId },
      include: [
        {
          model: donate,
          as: "usersDonate",
          attributes: { exclude: ["idUser", "idFund", "createdAt", "updatedAt"] },
        },
      ],
      attributes: { exclude: ["idUser", "createdAt", "updatedAt"] },
    });
    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};
