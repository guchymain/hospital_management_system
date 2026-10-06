'use strict';
const { Model } = require('sequelize');

const schema = process.env.DB_SCHEMA;

module.exports = (sequelize, DataTypes) => {
  class Medical_records extends Model {
    static associate(models) {
      Medical_records.belongsTo(models.Patients, {
        foreignKey: 'patientId',
        as: 'patient',
        onDelete: 'CASCADE'
      });

      Medical_records.belongsTo(models.Doctors, {
        foreignKey: 'doctorId',
        as: 'doctor',
        onDelete: 'RESTRICT'
      });
    }
  }

  Medical_records.init({
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
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    symptoms: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    treatment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Medical_records',
    tableName: 'medical_records',
    schema
  });

  return Medical_records;
};
