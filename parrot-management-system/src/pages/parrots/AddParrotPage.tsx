import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, message, DatePicker, Upload, Space, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useParrot } from '../../context/ParrotContext';
import ParrotForm from '../../components/ParrotForm';
import type { Parrot } from '../../types/parrot';

const { Option } = Select;

const AddParrotPage: React.FC = () => {
  const navigate = useNavigate();
  const { createParrot, loading } = useParrot();
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await createParrot(values);
      message.success('添加鹦鹉成功！');
      navigate('/parrots/list');
    } catch (error) {
      console.error('添加鹦鹉失败:', error);
      message.error('添加鹦鹉失败，请重试');
    }
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
          form={form}
          onSubmit={handleSubmit}
          loading={loading}
          submitButtonText="添加鹦鹉"
        />
      </Card>
    </div>
  );
};

export default AddParrotPage;
