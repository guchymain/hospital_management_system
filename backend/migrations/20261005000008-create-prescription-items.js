'use strict';

const schema = process.env.DB_SCHEMA;
const table = (name) => (schema && schema !== 'public' ? { tableName: name, schema } : name);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(table('prescription_items'), {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      prescriptionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: table('prescriptions'),
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      medicationName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dosage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      frequency: {
        type: Sequelize.STRING,
        allowNull: false
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
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
    await queryInterface.dropTable(table('prescription_items'));
  }
};
