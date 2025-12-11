import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Space,
  Modal,
  message,
  Row,
  Col,
  InputNumber,
  Typography,
  Divider
} from 'antd';
import {
  PlusOutlined,
  Up
};

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Parrot {
  id?: string;
  breed: string;
  gender: string;
  birthDate: string;
  age?: string; // 前端计算显示用
  price: number;
  cageNumber?: string;
  photos: string[];
  description?: string;
  status: 'available' | 'sold' | 'returned';
  createdAt?: number;
}

interface ParrotFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Partial<Parrot>;
  mode?: 'add' | 'edit';
}

interface ParrotFormData {
  breed: string;
  gender: string;
  birthDate?: moment.Moment;
  price: number;
  cageNumber?: string;
  description?: string;
  photos: any[];
  status?: 'available' | 'sold' | 'returned';
}

const ParrotForm: React.FC<ParrotFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  mode = 'add'
}) => {
  const [form] = Form.useForm<ParrotFormData>();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // 颜色方案
  const primaryColor = '#10b981';
  const primaryBg = '#f0fdf4';

  // 常用品种列表
  const commonBreeds = [
    {
      id: 'cockatoo',
      name: '葵花鹦鹉',
      description: '体型中等，羽毛黄色',
      icon: '🦜',
      color: '#f59e0b'
    },
    {
      id: 'macaw',
      name: '金刚鹦鹉',
      description: '体型较大，羽毛鲜艳',
      icon: '💎',
      color: '#ef4444'
    },
    {
      id: 'budgie',
      name: '虎皮鹦鹉',
      description: '体型小巧，易饲养',
      icon: '⚡',
      color: '#10b981'
    },
    {
      id: 'lovebird',
      name: '牡丹鹦鹉',
      description: '体型小巧，色彩多样',
      icon: '❤️',
      color: '#ec4899'
    },
    {
      id: 'conure',
      name: '锥尾鹦鹉',
      description: '活泼好动，学语能力强',
      icon: '🎭',
      color: '#8b5cf6'
    }
  ];

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        // 编辑模式
        const birthDateMoment = initialValues.birthDate ? moment(initialValues.birthDate) : undefined;

        form.setFieldsValue({
          ...initialValues,
          birthDate: birthDateMoment
        });

        // 设置照片列表
        if (initialValues.photos && initialValues.photos.length > 0) {
          const processedFileList = initialValues.photos.map((photo, index) => {
            if (typeof photo === 'string') {
              // 如果是URL字符串
              return {
                uid: `${Date.now()}-${index}`,
                name: `photo-${index}.jpg`,
                status: 'done',
                url: photo,
                type: 'image/jpeg'
              };
            } else if (photo.uid) {
              // 如果已经是fileList中的对象
              return photo;
            } else {
              // 新增的照片
              return photo;
            }
          });
          setFileList(processedFileList);
        }
      } else {
        // 新增模式
        form.resetFields();
        setFileList([]);
        form.setFieldsValue({
          status: 'available'
        });
      }
    }
  }, [visible, initialValues]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 检查是否至少上传了一张照片
      if (fileList.length === 0) {
        Modal.error({
          title: '提示',
          content: '请至少上传一张照片'
        });
        return;
      }

      // 处理照片数据
      const processedValues = {
        ...values,
        photos: fileList
          .filter(file => file.url || file.originFileObj)
          .map(file => {
            // 如果已经有url（已上传的图片），直接返回
            if (file.url) {
              return file.url;
            }
            // 如果是新上传的文件，返回File对象
            return file.originFileObj || file;
          }),
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : ''
      };

      onSubmit(processedValues);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    console.log('上传文件变化:', newFileList);
    setFileList(newFileList);
  };

  const handleBeforeUpload = (file: any) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('请上传图片文件!');
      return Upload.LIST_IGNORE;
    }
    return false; // 阻止自动上传
  };

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleRemove = (file: any) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    return false;
  };

  const getBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadButton = (
    <div style={{ padding: '20px 0' }}>
      <PlusOutlined style={{ fontSize: 32, color: '#ccc' }} />
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 'bold' }}>上传照片</div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>点击或拖拽上传</div>
      </div>
    </div>
  );

  const validateMessages = {
    required: '必填项',
    types: {
      number: '请输入有效的数字'
    }
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {mode === 'edit' ? `编辑鹦鹉 #${initialValues?.id}` : '新增鹦鹉'}
        </Title>
      }
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={800}
      okText={mode === 'edit' ? '保存' : '创建'}
      cancelText="取消"
      okButtonProps={{ style: { backgroundColor: primaryColor, borderColor: primaryColor } }}
    >
      <Form
        form={form}
        layout="vertical"
        validateMessages={validateMessages}
        initialValues={{
          gender: 'male',
          status: 'available'
        }}
      >
        {/* 照片上传区域 */}
        <div style={{ marginBottom: 24 }}>
          <Divider orientation="left" style={{ borderColor: primaryColor }}>
            <span style={{ color: primaryColor, fontWeight: 'bold' }}>📸 照片上传（必填）</span>
          </Divider>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            onPreview={handlePreview}
            beforeUpload={handleBeforeUpload}
            onRemove={handleRemove}
            multiple
            maxCount={5}
          >
            {fileList.length >= 5 ? null : uploadButton}
          </Upload>
        </div>

        {/* 基本信息 */}
        <div style={{ marginBottom: 24 }}>
          <Divider orientation="left" style={{ borderColor: primaryColor }}>
            <span style={{ color: primaryColor, fontWeight: 'bold' }}>🦜 基本信息（必填）</span>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="breed"
                label="品种"
                rules={[{ required: true, message: '请选择鹦鹉品种' }]}
              >
                <Select
                  placeholder="请选择品种"
                  size="large"
                  dropdownRender={menu => (
                    <div style={{ padding: 8 }}>
                      <div style={{ padding: 8 }}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>常用品种</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {commonBreeds.map(breed => (
                            <div
                              key={breed.id}
                              onClick={() => form.setFieldsValue({ breed: breed.name })}
                              style={{
                                padding: '8px 12px',
                                border: '1px solid #e0e0e0',
                                borderRadius: 6,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12
                              }}
                            >
                              <span>{breed.icon}</span>
                              <span>{breed.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Divider style={{ margin: '8px 0' }} />
                      {menu}
                    </div>
                  )}
                >
                  {commonBreeds.map(breed => (
                    <Option key={breed.id} value={breed.name}>
                      <span style={{ marginRight: 8 }}>{breed.icon}</span>
                      <span>{breed.name}</span>
                      <span style={{ color: '#999', marginLeft: 8 }}>({breed.description})</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="gender"
                label="公母"
                rules={[{ required: true, message: '请选择公母' }]}
              >
                <Select
                  placeholder="请选择公母"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Option value="male" style={{ fontSize: 16 }}>♂️ 公</Option>
                  <Option value="female" style={{ fontSize: 16 }}>♀️ 母</Option>
                  <Option value="unknown" style={{ fontSize: 16 }}>⚧️ 未知</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="price"
            label="价格（元）"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              size="large"
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="¥"
              placeholder="请输入价格"
            />
          </Form.Item>
        </div>

        {/* 详细信息 */}
        <div style={{ marginBottom: 24 }}>
          <Divider orientation="left" style={{ borderColor: primaryColor }}>
            <span style={{ color: primaryColor, fontWeight: 'bold' }}>📋 详细信息（选填）</span>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item name="birthDate" label="出生日期">
                <DatePicker
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="选择出生日期"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item name="cageNumber" label="圈号">
                <Input
                  size="large"
                  placeholder="如：A-12"
                  addonBefore="笼号"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="备注说明">
            <TextArea
              rows={3}
              placeholder="记录其他重要信息，如特殊标记、健康状况、来源等"
            />
          </Form.Item>
        </div>

        {/* 提示信息 */}
        <div style={{ backgroundColor: '#f0fdf4', padding: 12, borderRadius: 8, marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            📝 提示：
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 12, color: '#666' }}>
            <li>建议上传清晰的照片，至少1张，最多5张</li>
            <li>出生日期选填，但填写后可以自动计算年龄</li>
            <li>价格为必填，可以后期调整</li>
            <li>照片越清晰，客户越容易产生购买兴趣</li>
          </ul>
        </div>
      </Form>

      {/* 预览模态框 */}
      <Modal
        visible={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Modal>
  );
};

export default ParrotForm;
