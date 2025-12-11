import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Space, message, Alert } from 'antd';
import { useParrot } from '../context/ParrotContext';
import { api } from '../services/api';
import type { Parrot } from '../types/parrot';
import dayjs from 'dayjs';
import DatePickerWithShortcuts from './DatePickerWithShortcuts';

const { Option } = Select;
const { TextArea } = Input;

interface ParrotFormProps {
  parrot?: Parrot | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ParrotForm = ({ parrot, onSuccess, onCancel }: ParrotFormProps) => {
  const [form] = Form.useForm();
  const { createParrot, updateParrot, loading } = useParrot();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ringNumberExists, setRingNumberExists] = useState<string | null>(null);

  useEffect(() => {
    if (parrot) {
      form.setFieldsValue({
        ...parrot,
        birth_date: parrot.birth_date ? dayjs(parrot.birth_date) : null,
      });
    } else {
      form.resetFields();
    }
    setErrorMsg(null);
    setRingNumberExists(null);
  }, [parrot, form]);

  // 检查圈号是否存在
  const checkRingNumber = async (ringNumber: string) => {
    if (!ringNumber || ringNumber.trim() === '') {
      setRingNumberExists(null);
      return;
    }

    try {
      const response = await api.get<{ exists: boolean }>(`/parrots/ring-number/${ringNumber}/exists`);
      if (response.exists) {
        setRingNumberExists(ringNumber);
        message.warning(`圈号 ${ringNumber} 已存在，请使用其他圈号`);
      } else {
        setRingNumberExists(null);
      }
    } catch (error) {
      console.error('检查圈号失败:', error);
      setRingNumberExists(null);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    setErrorMsg(null);

    // 如果圈号已存在，不允许提交
    if (ringNumberExists && values.ring_number === ringNumberExists) {
      setErrorMsg(`圈号 ${ringNumberExists} 已存在，请使用其他圈号`);
      setSubmitting(false);
      return;
    }

    try {
      // 格式化数据
      const data = {
        breed: values.breed,
        gender: values.gender,
        price: values.price,
        ring_number: values.ring_number || null,
        birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
        health_notes: values.health_notes || null,
      };

      if (parrot) {
        await updateParrot(parrot.id, data);
        message.success('更新成功');
      } else {
        await createParrot(data);
        message.success('添加成功');
      }
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      // 提取错误信息
      let errMessage = '操作失败，请检查输入信息';

      console.log('=== Form Error ===');
      console.log('Error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);

      // 优先使用后端返回的具体错误信息
      if (error.response?.data?.detail) {
        errMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED' || error.message === 'timeout') {
        errMessage = '请求超时，请稍后重试';
      } else if (error.message === 'Network Error') {
        errMessage = '网络连接错误，请检查后端服务是否正常运行';
      } else if (error.response?.status === 500) {
        errMessage = '服务器内部错误，请联系管理员';
      } else if (error.response?.status === 400) {
        errMessage = error.response?.data?.detail || '请求参数错误';
      } else if (error.message && error.message !== 'Network Error') {
        errMessage = error.message;
      }

      console.log('Final error message:', errMessage);

      setErrorMsg(errMessage);
      message.error(errMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        gender: '公',
      }}
    >
      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <Form.Item
        label="品种"
        name="breed"
        rules={[{ required: true, message: '请输入品种' }]}
      >
        <Input placeholder="请输入品种名称" />
      </Form.Item>

      <Form.Item
        label="圈号"
        name="ring_number"
        extra={ringNumberExists ? `圈号 ${ringNumberExists} 已存在，请使用其他圈号` : "圈号必须唯一，不能与已有鹦鹉重复"}
        rules={[
          () => ({
            validator(_: any, value: string) {
              if (ringNumberExists && ringNumberExists === value) {
                return Promise.reject(new Error(`圈号 ${ringNumberExists} 已存在，请使用其他圈号`));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input
          placeholder="请输入圈号（可选）"
          onChange={(e) => checkRingNumber(e.target.value)}
        />
      </Form.Item>

      <Form.Item
        label="性别"
        name="gender"
        rules={[{ required: true, message: '请选择性别' }]}
      >
        <Select placeholder="请选择性别">
          <Option value="公">公</Option>
          <Option value="母">母</Option>
          <Option value="未验卡">未验卡</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="价格"
        name="price"
        rules={[{ required: true, message: '请输入价格' }]}
      >
        <InputNumber
          min={0}
          precision={2}
          placeholder="请输入价格"
          style={{ width: '100%' }}
          prefix="¥"
        />
      </Form.Item>

      <Form.Item
        label="出生日期"
        name="birth_date"
      >
        <DatePickerWithShortcuts placeholder="选择出生日期" />
      </Form.Item>

      <Form.Item
        label="健康备注"
        name="health_notes"
      >
        <TextArea rows={4} placeholder="请输入健康备注信息" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={submitting || loading}>
            {parrot ? '更新' : '添加'}
          </Button>
          <Button onClick={onCancel}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ParrotForm;
