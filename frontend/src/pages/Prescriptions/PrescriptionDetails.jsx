import React from 'react'
import { Pill, Printer } from 'lucide-react'
import { Modal } from '../../components/Modal/Modal'
import { Button } from '../../components/Button/Button'
import { formatDate } from '../../utils/formatters'

export const PrescriptionDetails = ({ isOpen, onClose, prescription }) => {
  if (!prescription) return null

  const items = prescription.items || []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Prescription #${prescription.id}`}
      subtitle={`Prescribed on ${formatDate(prescription.prescriptionDate)}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Patient</p>
            <p className="font-bold text-slate-900 mt-0.5">{prescription.patient?.name || `Patient #${prescription.patientId}`}</p>
            {prescription.patient?.phone && (
              <p className="text-xs text-slate-500">{prescription.patient.phone}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Prescribing Physician</p>
            <p className="font-bold text-slate-900 mt-0.5">{prescription.doctor?.name || `Doctor #${prescription.doctorId}`}</p>
            <p className="text-xs text-teal-700 font-medium">{prescription.doctor?.specialization || ''}</p>
          </div>
        </div>

        {/* Medication Line Items */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Medication Items ({items.length})
            </h4>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
            {items.map((it, idx) => (
              <div key={it.id || idx} className="p-4 space-y-1 text-sm hover:bg-slate-50/60 transition">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900 text-base">
                    {it.medicationName}
                  </span>
                  <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    Qty: {it.quantity}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                  <span><strong>Dosage:</strong> {it.dosage}</span>
                  <span><strong>Frequency:</strong> {it.frequency}</span>
                  <span><strong>Duration:</strong> {it.duration}</span>
                </div>

                {it.instructions && (
                  <p className="text-xs text-slate-500 italic pt-1">
                    Directions: {it.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* General Notes */}
        {prescription.notes && (
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-sm">
            <p className="text-xs font-bold uppercase text-amber-800 mb-1">Doctor's Clinical Notes</p>
            <p className="text-xs text-amber-900 leading-relaxed">{prescription.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={() => window.print()} icon={Printer}>
            Print Chart
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
