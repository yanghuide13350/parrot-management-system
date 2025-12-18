import React from 'react';
import { Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ParrotForm from '../../components/ParrotForm';

const AddParrotPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/parrots/list');
  };

  const handleCancel = () => {
    navigate('/parrots/list');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusOutlined />
            添加新鹦鹉
          </div>
        }
        style={{ maxWidth: 1200, margin: '0 auto' }}
      >
        <ParrotForm
          parrot={null}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
};

export default AddParrotPage;
