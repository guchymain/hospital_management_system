'use strict';
const { Model } = require('sequelize');

const schema = process.env.DB_SCHEMA;

module.exports = (sequelize, DataTypes) => {
  class Patients extends Model {
    static associate(models) {
      Patients.hasMany(models.Appointments, {
        foreignKey: 'patientId',
        as: 'appointments',
        onDelete: 'CASCADE'
      });

      Patients.hasMany(models.Medical_records, {
        foreignKey: 'patientId',
        as: 'medicalRecords',
        onDelete: 'CASCADE'
      });

      Patients.hasMany(models.Prescriptions, {
        foreignKey: 'patientId',
        as: 'prescriptions',
        onDelete: 'CASCADE'
      });
    }
  }

  Patients.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['male', 'female', 'other']]
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Patients',
    tableName: 'patients',
    schema
  });

  return Patients;
};
