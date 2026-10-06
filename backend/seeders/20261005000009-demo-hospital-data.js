'use strict';
const bcrypt = require('../src/utils/bcrypt');

const schema = process.env.DB_SCHEMA;
const table = (name) => (schema && schema !== 'public' ? { tableName: name, schema } : name);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = Number(process.env.SALT_ROUNDS);
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];

    // 1. Users
    await queryInterface.bulkInsert(table('users'), [
      {
        id: 1,
        name: 'Admin Manager',
        email: 'admin@hospital.com',
        phone: '08010000001',
        password: bcrypt.hashSync('Admin@123', saltRounds),
        role: 'admin',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Dr. Sarah Smith',
        email: 'doctor.smith@hospital.com',
        phone: '08020000001',
        password: bcrypt.hashSync('Doctor@123', saltRounds),
        role: 'doctor',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Dr. James Johnson',
        email: 'doctor.johnson@hospital.com',
        phone: '08020000002',
        password: bcrypt.hashSync('Doctor@123', saltRounds),
        role: 'doctor',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Dr. Emily Lee',
        email: 'doctor.lee@hospital.com',
        phone: '08020000003',
        password: bcrypt.hashSync('Doctor@123', saltRounds),
        role: 'doctor',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        name: 'Nurse Florence',
        email: 'nurse@hospital.com',
        phone: '08030000001',
        password: bcrypt.hashSync('Nurse@123', saltRounds),
        role: 'nurse',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        name: 'Receptionist David',
        email: 'receptionist@hospital.com',
        phone: '08040000001',
        password: bcrypt.hashSync('Receptionist@123', saltRounds),
        role: 'receptionist',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 2. Departments
    await queryInterface.bulkInsert(table('departments'), [
      {
        id: 1,
        name: 'Cardiology',
        description: 'Diagnosis and treatment of heart and cardiovascular disorders',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Pediatrics',
        description: 'Comprehensive medical care for infants, children, and adolescents',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Surgery',
        description: 'Advanced surgical care and operative procedures',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'General Medicine',
        description: 'Primary medical care and comprehensive disease management',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 3. Doctors
    await queryInterface.bulkInsert(table('doctors'), [
      {
        id: 1,
        userId: 2,
        departmentId: 1,
        specialization: 'Cardiologist',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        userId: 3,
        departmentId: 2,
        specialization: 'Pediatrician',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        userId: 4,
        departmentId: 3,
        specialization: 'General Surgeon',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 4. Patients
    await queryInterface.bulkInsert(table('patients'), [
      {
        id: 1,
        name: 'John Doe',
        dateOfBirth: '1985-06-15',
        gender: 'male',
        phone: '08050000001',
        email: 'johndoe@example.com',
        address: '123 Health Ave, Metro City',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Jane Roe',
        dateOfBirth: '1992-09-24',
        gender: 'female',
        phone: '08050000002',
        email: 'janeroe@example.com',
        address: '456 Blossom Lane, Metro City',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Michael Brown',
        dateOfBirth: '2010-03-12',
        gender: 'male',
        phone: '08050000003',
        email: 'michaelbrown@example.com',
        address: '789 Pine Street, Metro City',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 5. Appointments
    await queryInterface.bulkInsert(table('appointments'), [
      {
        id: 1,
        patientId: 1,
        doctorId: 1,
        appointmentDate: new Date(Date.now() + 86400000), // tomorrow
        status: 'scheduled',
        reason: 'Routine cardiac checkup and blood pressure monitoring',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        patientId: 2,
        doctorId: 1,
        appointmentDate: new Date(Date.now() - 86400000), // yesterday
        status: 'completed',
        reason: 'Chest discomfort consultation',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        patientId: 3,
        doctorId: 2,
        appointmentDate: new Date(Date.now() - 7 * 86400000), // last week
        status: 'completed',
        reason: 'Pediatric seasonal flu assessment',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 6. Medical Records
    await queryInterface.bulkInsert(table('medical_records'), [
      {
        id: 1,
        patientId: 1,
        doctorId: 1,
        diagnosis: 'Essential Hypertension',
        symptoms: 'Mild headaches, elevated systolic reading (142/90)',
        treatment: 'Prescribed lifestyle adjustments and ACE inhibitor therapy',
        notes: 'Follow up in 4 weeks with weekly BP diary',
        date: today,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        patientId: 2,
        doctorId: 1,
        diagnosis: 'Sinus Tachycardia',
        symptoms: 'Transient palpitations following aerobic exercises',
        treatment: 'Advised hydration and temporary caffeine restriction',
        notes: 'ECG normal, monitor symptoms over next 14 days',
        date: today,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        patientId: 3,
        doctorId: 2,
        diagnosis: 'Acute Viral Bronchitis',
        symptoms: 'Dry cough, low-grade fever, mild sore throat',
        treatment: 'Adequate hydration, paracetamol for fever, and rest',
        notes: 'Chest clear upon auscultation. Symptoms resolving.',
        date: today,
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 7. Prescriptions
    await queryInterface.bulkInsert(table('prescriptions'), [
      {
        id: 1,
        patientId: 1,
        doctorId: 1,
        appointmentId: 1,
        notes: 'Take all medications strictly as directed after meals.',
        prescriptionDate: today,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        patientId: 3,
        doctorId: 2,
        appointmentId: 3,
        notes: 'Keep child hydrated and follow dosage timings.',
        prescriptionDate: today,
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 8. Prescription Items
    await queryInterface.bulkInsert(table('prescription_items'), [
      {
        id: 1,
        prescriptionId: 1,
        medicationName: 'Paracetamol',
        dosage: '500mg',
        frequency: '3 times daily',
        duration: '5 days',
        quantity: 20,
        instructions: 'Take 1 tablet every 8 hours after meals',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        prescriptionId: 1,
        medicationName: 'Amoxicillin',
        dosage: '250mg',
        frequency: 'Twice daily',
        duration: '7 days',
        quantity: 14,
        instructions: 'Take 1 capsule every 12 hours with a full glass of water',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        prescriptionId: 1,
        medicationName: 'Vitamin C',
        dosage: '1000mg',
        frequency: 'Once daily',
        duration: '30 days',
        quantity: 30,
        instructions: 'Dissolve 1 effervescent tablet in water each morning',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        prescriptionId: 2,
        medicationName: 'Ibuprofen Suspension',
        dosage: '100mg/5ml',
        frequency: 'Twice daily',
        duration: '3 days',
        quantity: 1,
        instructions: 'Give 5ml if temperature exceeds 38.5C',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // Reset sequences to prevent auto-increment ID collisions
    const tablesToReset = [
      'users',
      'departments',
      'doctors',
      'patients',
      'appointments',
      'medical_records',
      'prescriptions',
      'prescription_items'
    ];

    for (const tName of tablesToReset) {
      const fullTable = schema && schema !== 'public' ? `"${schema}"."${tName}"` : `"${tName}"`;
      await queryInterface.sequelize.query(
        `SELECT setval(pg_get_serial_sequence('${fullTable}', 'id'), coalesce(max(id), 1)) FROM ${fullTable};`
      ).catch(() => {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(table('prescription_items'), null, {});
    await queryInterface.bulkDelete(table('prescriptions'), null, {});
    await queryInterface.bulkDelete(table('medical_records'), null, {});
    await queryInterface.bulkDelete(table('appointments'), null, {});
    await queryInterface.bulkDelete(table('patients'), null, {});
    await queryInterface.bulkDelete(table('doctors'), null, {});
    await queryInterface.bulkDelete(table('departments'), null, {});
    await queryInterface.bulkDelete(table('users'), null, {});
  }
};
