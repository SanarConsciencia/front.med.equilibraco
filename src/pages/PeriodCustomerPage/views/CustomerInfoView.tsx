import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface CustomerInfoViewProps {
  complianceData: BulkComplianceResponse
}

export const CustomerInfoView: React.FC<CustomerInfoViewProps> = ({ complianceData }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Información del Customer</h2>
      <div className="space-y-2 text-gray-900 dark:text-gray-100">
        <p><strong>Nombre:</strong> {complianceData.customer_info.customer_full_name}</p>
        <p><strong>Email:</strong> {complianceData.customer_info.customer_email}</p>
        <p>
          <strong>UUID:</strong>{' '}
          <span className="font-mono text-sm">{complianceData.customer_info.customer_uuid}</span>
        </p>
        <p><strong>Estado:</strong> {complianceData.customer_info.subscription_status}</p>
      </div>
    </div>
  )
}
