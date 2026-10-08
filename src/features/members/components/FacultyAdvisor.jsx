import React, { useState } from 'react';
import AdminCard from './AdminCard';

export default function FacultyAdvisorSection({ AdvisorData }) {
  return (
    <div className="w-full">
      <AdminCard admin={AdvisorData} type="faculty" />
    </div>
  );
}