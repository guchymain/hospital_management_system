'use strict';
const { Model } = require('sequelize');

const schema = process.env.DB_SCHEMA;

module.exports = (sequelize, DataTypes) => {
  class Prescription_items extends Model {
    static associate(models) {
      Prescription_items.belongsTo(models.Prescriptions, {
        foreignKey: 'prescriptionId',
        as: 'prescription',
        onDelete: 'CASCADE'
      });
    }
  }

  Prescription_items.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    prescriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    medicationName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    }
  }, {
    sequelize,
    modelName: 'Prescription_items',
    tableName: 'prescription_items',
    schema
  });

  return Prescription_items;
};
