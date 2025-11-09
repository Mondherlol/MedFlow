import React from 'react';
import AdminTemplate from '../../components/Admin/AdminTemplate';
import { useClinic } from '../../context/clinicContext';
import ClinicInfoCard from '../../components/Admin/ManageClinic/ClinicInfoCard';
import ThemeCustomizer from '../../components/Admin/ManageClinic/ThemeCustomizer';
import DeleteClinicCard from '../../components/Admin/ManageClinic/DeleteClinicCard';
import CustomHomeCard from '../../components/Admin/ManageClinic/CustomHomeCard';

const Clinique = () => {
  const { clinic } = useClinic();

  if (!clinic) {
    return (
      <AdminTemplate title="Clinique">
        <div className="py-8 flex items-center justify-center">Chargement…</div>
      </AdminTemplate>
    );
  }

  const brandPrimary = clinic?.theme?.primary || 'indigo';

  return (
    <AdminTemplate title="Infos clinique">
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClinicInfoCard clinic={clinic} brandPrimary={brandPrimary} />
          <ThemeCustomizer clinic={clinic} />
          <CustomHomeCard clinic={clinic} brandPrimary={brandPrimary} />
        </div>

        <aside className="space-y-6">
          <DeleteClinicCard clinic={clinic} />
        </aside>
      </div>
    </AdminTemplate>
  );
};

export default Clinique;
