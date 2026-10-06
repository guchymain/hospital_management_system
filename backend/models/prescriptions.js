'use strict';
const { Model } = require('sequelize');

const schema = process.env.DB_SCHEMA;

module.exports = (sequelize, DataTypes) => {
  class Prescriptions extends Model {
    static associate(models) {
      Prescriptions.belongsTo(models.Patients, {
        foreignKey: 'patientId',
        as: 'patient',
        onDelete: 'CASCADE'
      });

      Prescriptions.belongsTo(models.Doctors, {
        foreignKey: 'doctorId',
        as: 'doctor',
        onDelete: 'RESTRICT'
      });

      Prescriptions.belongsTo(models.Appointments, {
        foreignKey: 'appointmentId',
        as: 'appointment',
        onDelete: 'SET NULL'
      });

      Prescriptions.hasMany(models.Prescription_items, {
        foreignKey: 'prescriptionId',
        as: 'items',
        onDelete: 'CASCADE'
      });
    }
  }

  Prescriptions.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    prescriptionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Prescriptions',
    tableName: 'prescriptions',
    schema
  });

  return Prescriptions;
};
