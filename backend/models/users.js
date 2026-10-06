'use strict';
const { Model } = require('sequelize');

const schema = process.env.DB_SCHEMA;

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasOne(models.Doctors, {
        foreignKey: 'userId',
        as: 'doctorProfile',
        onDelete: 'CASCADE'
      });
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  Users.init({
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'receptionist',
      validate: {
        isIn: [['admin', 'doctor', 'nurse', 'receptionist']]
      }
    }
  }, {
    sequelize,
    modelName: 'Users',
    tableName: 'users',
    schema
  });

  return Users;
};
