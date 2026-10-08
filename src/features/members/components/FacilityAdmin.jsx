import React from 'react';
import AdminCard from './AdminCard';

export default function FacilityAdminSection({ adminData }) {
  return (
    <div className="w-full">
      <AdminCard admin={adminData} type="facility" />
    </div>
  );
}