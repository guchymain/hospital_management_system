'use strict';
const { Model } = require('sequelize');

const schema = process.env.DB_SCHEMA;

module.exports = (sequelize, DataTypes) => {
  class Appointments extends Model {
    static associate(models) {
      Appointments.belongsTo(models.Patients, {
        foreignKey: 'patientId',
        as: 'patient',
        onDelete: 'CASCADE'
      });

      Appointments.belongsTo(models.Doctors, {
        foreignKey: 'doctorId',
        as: 'doctor',
        onDelete: 'RESTRICT'
      });

      Appointments.hasOne(models.Prescriptions, {
        foreignKey: 'appointmentId',
        as: 'prescription',
        onDelete: 'SET NULL'
      });
    }
  }

  Appointments.init({
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
    appointmentDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'scheduled',
      validate: {
        isIn: [['scheduled', 'completed', 'cancelled']]
      }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    }
  }, {
    sequelize,
    modelName: 'Appointments',
    tableName: 'appointments',
    schema
  });

  return Appointments;
};
