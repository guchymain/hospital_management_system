'use strict';
const { Model } = require('sequelize');

const schema = process.env.DB_SCHEMA;

module.exports = (sequelize, DataTypes) => {
  class Doctors extends Model {
    static associate(models) {
      Doctors.belongsTo(models.Departments, {
        foreignKey: 'departmentId',
        as: 'department',
        onDelete: 'RESTRICT'
      });

      Doctors.belongsTo(models.Users, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      });

      Doctors.hasMany(models.Appointments, {
        foreignKey: 'doctorId',
        as: 'appointments',
        onDelete: 'RESTRICT'
      });

      Doctors.hasMany(models.Medical_records, {
        foreignKey: 'doctorId',
        as: 'medicalRecords',
        onDelete: 'RESTRICT'
      });

      Doctors.hasMany(models.Prescriptions, {
        foreignKey: 'doctorId',
        as: 'prescriptions',
        onDelete: 'RESTRICT'
      });
    }

    toJSON() {
      const values = { ...this.get() };
      if (this.user) {
        values.name = this.user.name;
        values.email = this.user.email;
        values.phone = this.user.phone;
      }
      return values;
    }
  }

  Doctors.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.user ? this.user.name : undefined;
      }
    },
    email: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.user ? this.user.email : undefined;
      }
    },
    phone: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.user ? this.user.phone : undefined;
      }
    }
  }, {
    sequelize,
    modelName: 'Doctors',
    tableName: 'doctors',
    schema
  });

  return Doctors;
};
