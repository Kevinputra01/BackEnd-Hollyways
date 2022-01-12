"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class fund extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      fund.belongsTo(models.user, {
        foreignKey: {
          name: "idUser",
        },
      });
      fund.hasMany(models.donate, {
        as: "usersDonate",
        foreignKey: {
          name: "idFund",
        },
      });
    }
  }
  fund.init(
    {
      title: DataTypes.STRING,
      thumbnail: DataTypes.STRING,
      goal: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      idUser: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "fund",
    }
  );
  return fund;
};
