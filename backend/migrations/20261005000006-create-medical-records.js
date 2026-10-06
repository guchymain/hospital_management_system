'use strict';

const schema = process.env.DB_SCHEMA;
const table = (name) => (schema && schema !== 'public' ? { tableName: name, schema } : name);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(table('medical_records'), {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      patientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: table('patients'),
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      doctorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: table('doctors'),
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      symptoms: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      treatment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(table('medical_records'));
  }
};
