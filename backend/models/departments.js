'use strict';
const { Model } = require('sequelize');

const schema = process.env.DB_SCHEMA;

module.exports = (sequelize, DataTypes) => {
  class Departments extends Model {
    static associate(models) {
      Departments.hasMany(models.Doctors, {
        foreignKey: 'departmentId',
        as: 'doctors',
        onDelete: 'RESTRICT'
      });
    }
  }

  Departments.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    }
  }, {
    sequelize,
    modelName: 'Departments',
    tableName: 'departments',
    schema
  });

  return Departments;
};
