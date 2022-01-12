"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class donate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      donate.belongsTo(models.user, {
        foreignKey: {
          name: "idUser",
        },
      });
      donate.belongsTo(models.fund, {
        foreignKey: {
          name: "idFund",
        },
      });
    }
  }
  donate.init(
    {
      fullname: DataTypes.STRING,
      email: DataTypes.STRING,
      donateAmount: DataTypes.INTEGER,
      status: DataTypes.STRING,
      proofAttachment: DataTypes.STRING,
      idUser: DataTypes.INTEGER,
      idFund: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "donate",
    }
  );
  return donate;
};
