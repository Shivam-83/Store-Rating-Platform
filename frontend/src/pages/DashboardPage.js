import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/common/Layout';
import AdminDashboard from '../components/dashboard/admin/AdminDashboard';
import UserDashboard from '../components/dashboard/user/UserDashboard';
import OwnerDashboard from '../components/dashboard/owner/OwnerDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'System Administrator':
        return <AdminDashboard />;
      case 'Normal User':
        return <UserDashboard />;
      case 'Store Owner':
        return <OwnerDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <Layout title="Dashboard">
      {renderDashboard()}
    </Layout>
  );
};

export default DashboardPage;
