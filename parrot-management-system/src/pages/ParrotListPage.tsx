import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, Button, Space, Card, Input, Select, Modal, message, Tag, Popconfirm, InputNumber, Form } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, ShoppingCartOutlined, ArrowLeftOutlined, HeartOutlined, SearchOutlined, CustomerServiceOutlined, RollbackOutlined, PlusOutlined } from '@ant-design/icons';
import { useParrot } from '../context/ParrotContext';
import type { Parrot } from '../types/parrot';
import ParrotForm from '../components/ParrotForm';
import ParrotDetail from '../components/ParrotDetail';
import { calculateAge, calculateAgeDays } from '../utils/dateUtils';
import { api } from '../services/api';

const { Option } = Select;

const ParrotListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    parrots,
    breeds,
    loading,
    total,
    page,
    pageSize,
    filters,
    fetchParrots,
    fetchBreeds,
    updateFilters,
    clearFilters,
    setPage,
    setPageSize,
    deleteParrot,
    setSelectedParrot,
    selectedParrot,
    updateStatus,
  } = useParrot();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [editingParrot, setEditingParrot] = useState<Parrot | null>(null);
  const [isSaleModalVisible, setIsSaleModalVisible] = useState(false);
  const [saleParrot, setSaleParrot] = useState<Parrot | null>(null);
  const [saleForm] = Form.useForm();
  const [isFollowUpModalVisible, setIsFollowUpModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [followUpParrot, setFollowUpParrot] = useState<Parrot | null>(null);
  const [returnParrot, setReturnParrot] = useState<Parrot | null>(null);
  const [followUpForm] = Form.useForm();
  const [returnForm] = Form.useForm();

  // 价格区间筛选状态
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});

  // Minimum age for breeding (in days) - 5个月
  const MIN_BREEDING_AGE_DAYS = 150;

  const formatPriceRange = (record: Parrot) => {
    if (record.min_price != null && record.max_price != null) {
      return `¥${Number(record.min_price).toFixed(2)} - ¥${Number(record.max_price).toFixed(2)}`;
    }
    if (record.min_price != null) {
      return `最低 ¥${Number(record.min_price).toFixed(2)}`;
    }
    if (record.max_price != null) {
      return `最高 ¥${Number(record.max_price).toFixed(2)}`;
    }
    if (record.price != null) {
      return `¥${Number(record.price).toFixed(2)}`;
    }
    return '-';
  };

  useEffect(() => {
    fetchBreeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 组件挂载时执行一次

  // 监听路由变化，当进入鹦鹉列表页面时检查是否有从Dashboard传来的筛选条件
  useEffect(() => {
    if (location.pathname === '/parrots') {
      // 检查是否有从Dashboard传来的筛选条件
      const stateFilters = (location.state as any)?.filters;
      // 检查是否有实际的筛选条件（非空对象）
      if (stateFilters && Object.keys(stateFilters).length > 0) {
        // 应用从Dashboard传来的筛选条件
        updateFilters(stateFilters);
      } else {
        // 没有传入筛选条件或空对象时清除所有筛选
        clearFilters();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state]); // 路由变化时执行

  useEffect(() => {
    fetchParrots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters]);

  const handleEditParrot = (parrot: Parrot) => {
    setEditingParrot(parrot);
    setIsFormVisible(true);
  };

  const handleViewDetail = (parrot: Parrot) => {
    setSelectedParrot(parrot);
    setIsDetailVisible(true);
  };

  const handleDeleteParrot = async (id: number) => {
    try {
      await deleteParrot(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSellParrot = (parrot: Parrot) => {
    setSaleParrot(parrot);
    setIsSaleModalVisible(true);
  };

  const handleSaleSubmit = async (values: any) => {
    try {
      if (saleParrot) {
        // 调用API保存销售信息
        await api.put(`/parrots/${saleParrot.id}/sale-info`, {
          seller: values.seller,
          buyer_name: values.buyerName,
          sale_price: values.salePrice,
          contact: values.contact,
          follow_up_status: values.followUpStatus || 'pending',
          notes: values.notes
        });
        message.success('销售信息保存成功');
        setIsSaleModalVisible(false);
        saleForm.resetFields();
        fetchParrots(); // 重新加载数据
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleFollowUp = (parrot: Parrot) => {
    setFollowUpParrot(parrot);
    setIsFollowUpModalVisible(true);
  };

  const handleFollowUpSubmit = async (values: any) => {
    try {
      if (followUpParrot) {
        await api.post(`/parrots/${followUpParrot.id}/follow-ups`, {
          parrot_id: followUpParrot.id,
          follow_up_status: values.followUpStatus,
          notes: values.notes
        });
        message.success('回访信息保存成功');
        setIsFollowUpModalVisible(false);
        followUpForm.resetFields();
        fetchParrots();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleReturnParrot = (parrot: Parrot) => {
    setReturnParrot(parrot);
    setIsReturnModalVisible(true);
  };

  const handleReturnSubmit = async (values: any) => {
    try {
      if (returnParrot) {
        await api.put(`/parrots/${returnParrot.id}/return`, {
          return_reason: values.returnReason
        });
        message.success('退货处理成功');
        setIsReturnModalVisible(false);
        returnForm.resetFields();
        fetchParrots();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSetAsBreeding = async (parrot: Parrot) => {
    console.log('=== Breeding Button Clicked ===');
    console.log('Parrot data:', parrot);
    console.log('Parrot status:', parrot.status);
    console.log('Parrot ID:', parrot.id);

    // 立即检查基本数据
    if (!parrot.id) {
      console.error('Error: Parrot ID is missing');
      message.error('鹦鹉ID缺失，无法设置种鸟');
      return;
    }

    if (parrot.status !== 'available') {
      console.error('Error: Parrot status is not available:', parrot.status);
      message.error('只有待售状态的鹦鹉才能设置为种鸟');
      return;
    }

    try {
      const ageDays = calculateAgeDays(parrot.birth_date);
      const ageText = calculateAge(parrot.birth_date);
      const hasAgeWarning = ageDays < MIN_BREEDING_AGE_DAYS;

      console.log('Age calculation:', { ageDays, ageText, hasAgeWarning });

      // 使用浏览器原生的confirm代替Modal.confirm
      const confirmText = hasAgeWarning
        ? `当前鹦鹉年龄为 ${ageText}，未满1年，仍要设为种鸟吗？`
        : `确定要将 ${parrot.breed} 设为种鸟吗？`;

      if (window.confirm(confirmText)) {
        console.log('User confirmed, starting API call...');
        try {
          await updateStatus(parrot.id, 'breeding');
          message.success(`${parrot.breed}已设置为种鸟`);
          console.log('API call successful');
        } catch (error) {
          console.error('API call failed:', error);
          message.error('设置失败：' + ((error as any)?.response?.data?.detail || '未知错误'));
        }
      } else {
        console.log('User cancelled the operation');
      }
    } catch (error) {
      console.error('Error in breeding setup:', error);
      message.error('设置种鸟时出错：' + (error as Error).message);
    }
  };

  // const handleReturnParrot = async (parrot: Parrot) => {
  //   Modal.confirm({
  //     title: '确认退货',
  //     content: (
  //       <div>
  //         <p style={{ marginBottom: '8px' }}>确定要将售出的鹦鹉退货吗？</p>
  //         <p style={{ color: '#999', fontSize: '14px', marginBottom: '16px' }}>请输入退货原因：</p>
  //         <Input.TextArea
  //           placeholder="请输入退货原因（客户不满意、健康问题等）"
  //           rows={3}
  //           id="returnReason"
  //         />
  //       </div>
  //     ),
  //     icon: null,
  //     okText: '确认退货',
  //     cancelText: '取消',
  //     width: 500,
  //     onOk: async () => {
  //       const textArea = document.getElementById('returnReason') as HTMLTextAreaElement;
  //       const returnReason = textArea?.value?.trim();

  //       if (!returnReason) {
  //         message.error('请输入退货原因');
  //         return Promise.reject();
  //       }

  //       try {
  //         // 调用退货API（需要新建API）
  //         await returnParrot(parrot.id, returnReason);
  //         message.success('退货成功，鹦鹉已回到库存');
  //         fetchParrots();
  //       } catch (error) {
  //         message.error('退货失败');
  //         return Promise.reject();
  //       }
  //     },
  //   });
  // };

  // const handleRelistParrot = async (parrot: Parrot) => {
  //   Modal.confirm({
  //     title: '确认重新上架',
  //     content: '确定要将退货的鹦鹉重新上架销售吗？',
  //     okText: '确认上架',
  //     cancelText: '取消',
  //     onOk: async () => {
  //       try {
  //         await relistParrot(parrot.id);
  //         message.success('重新上架成功');
  //         fetchParrots();
  //       } catch (error) {
  //         message.error('操作失败');
  //       }
  //     },
  //   });
  // };

  const handleSearch = (value: string) => {
    updateFilters({ keyword: value || undefined });
  };

  const handleBreedFilter = (value: string) => {
    updateFilters({ breed: value || undefined });
  };

  const handleStatusFilter = (value: string) => {
    updateFilters({ status: value as any });
  };

  const handleGenderFilter = (value: string) => {
    updateFilters({ gender: value as any });
  };

  const handlePriceRangeFilter = (type: 'min' | 'max', value: number | null) => {
    const newRange = { ...priceRange };
    if (value === null || value === undefined || isNaN(value)) {
      delete newRange[type];
    } else {
      newRange[type] = value;
    }
    setPriceRange(newRange);
  };

  const handleSearchWithFilters = () => {
    const newFilters: any = { ...filters };

    // 添加价格区间筛选
    if (priceRange.min !== undefined) {
      newFilters.min_price = priceRange.min;
    }
    if (priceRange.max !== undefined) {
      newFilters.max_price = priceRange.max;
    }

    updateFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setPriceRange({});
    clearFilters();
  };

  // 获取鹦鹉的实际状态（包括配对状态）
  const getParrotStatus = (parrot: Parrot): string => {
    if (parrot.mate_id) {
      return 'paired'; // 配对中
    }
    return parrot.status;
  };

  const statusMap: Record<string, string> = {
    'available': '待售',
    'sold': '已售',
    'returned': '退货',
    'breeding': '种鸟',
    'paired': '配对中',
    'incubating': '孵化中',
  };

  const statusColors: Record<string, string> = {
    'available': '#52B788',  // 鲜绿色
    'sold': '#E56B6F',       // 珊瑚红
    'returned': '#8D99AE',   // 蓝灰色
    'breeding': '#F4A261',   // 橙黄色
    'paired': '#00BBF9',     // 天蓝色
    'incubating': '#9B5DE5', // 紫色
  };

  const columns = [
    {
      title: '圈号',
      dataIndex: 'ring_number',
      key: 'ring_number',
      width: 120,
      render: (val: string | null) => val || '-',
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
      width: 150,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
    },
    {
      title: '价格区间',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (_: number, record: Parrot) => formatPriceRange(record),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: string, record: Parrot) => {
        const status = getParrotStatus(record);
        return (
          <Tag color={statusColors[status] || 'default'}>{statusMap[status] || status}</Tag>
        );
      },
    },
    {
      title: '出生日期',
      dataIndex: 'birth_date',
      key: 'birth_date',
      width: 120,
      render: (val: string | null) => val || '-',
    },
    {
      title: '年龄',
      key: 'age',
      width: 120,
      render: (record: Parrot) => calculateAge(record.birth_date),
    },
    {
      title: '照片数',
      dataIndex: 'photo_count',
      key: 'photo_count',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 320,
      render: (_: any, record: Parrot) => {
        const actualStatus = getParrotStatus(record);

        return (
          <Space size={4}>
            {actualStatus === 'paired' && (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
                  style={{ padding: '0 4px' }}
                >
                  查看
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  disabled
                  title="配对中的鹦鹉不能编辑"
                  style={{ padding: '0 4px' }}
                >
                  编辑
                </Button>
                <Button type="link" size="small" icon={<ShoppingCartOutlined />} disabled title="配对中的鹦鹉不能售卖" style={{ padding: '0 4px' }}>
                  售出
                </Button>
              </>
            )}
            {actualStatus === 'available' && (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
                  style={{ padding: '0 4px' }}
                >
                  查看
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditParrot(record)}
                  style={{ padding: '0 4px' }}
                >
                  编辑
                </Button>
                <Button type="link" size="small" icon={<ShoppingCartOutlined />} onClick={() => handleSellParrot(record)} style={{ padding: '0 4px' }}>
                  售出
                </Button>
                <Button type="link" size="small" icon={<HeartOutlined />} onClick={() => handleSetAsBreeding(record)} style={{ padding: '0 4px' }}>
                  种鸟
                </Button>
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这只鹦鹉吗？此操作不可恢复。"
                  onConfirm={() => handleDeleteParrot(record.id)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ padding: '0 4px' }}>
                    删除
                  </Button>
                </Popconfirm>
              </>
            )}
            {actualStatus === 'breeding' && (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
                  style={{ padding: '0 4px' }}
                >
                  查看
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditParrot(record)}
                  style={{ padding: '0 4px' }}
                >
                  编辑
                </Button>
                <Button type="link" size="small" icon={<ShoppingCartOutlined />} disabled title="种鸟不能售卖" style={{ padding: '0 4px' }}>
                  售出
                </Button>
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这只鹦鹉吗？此操作不可恢复。"
                  onConfirm={() => handleDeleteParrot(record.id)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ padding: '0 4px' }}>
                    删除
                  </Button>
                </Popconfirm>
              </>
            )}
            {actualStatus === 'sold' && (
              <>
                <Button type="link" size="small" icon={<CustomerServiceOutlined />} onClick={() => handleFollowUp(record)} style={{ padding: '0 4px' }}>
                  回访
                </Button>
                <Button type="link" size="small" danger icon={<RollbackOutlined />} onClick={() => handleReturnParrot(record)} style={{ padding: '0 4px' }}>
                  退回
                </Button>
              </>
            )}
            {actualStatus === 'returned' && (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
                  style={{ padding: '0 4px' }}
                >
                  查看
                </Button>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditParrot(record)} style={{ padding: '0 4px' }}>
                  编辑
                </Button>
                <Button type="link" size="small" icon={<ShoppingCartOutlined />} onClick={() => handleSellParrot(record)} style={{ padding: '0 4px' }}>
                  重新售出
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 固定标题栏 */}
      <div style={{
        position: 'sticky',
        top: 64,
        zIndex: 50,
        background: '#F5F2ED',
        margin: '-24px -24px 0 -24px',
        padding: '24px 24px 0 24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fff',
          padding: '16px 24px',
          borderRadius: '8px 8px 0 0',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>鹦鹉管理</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingParrot(null);
              setIsFormVisible(true);
            }}
          >
            添加鹦鹉
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: '0 0 8px 8px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space size="middle" wrap>
            <Space.Compact>
              <Input
                placeholder="搜索品种或圈号"
                style={{ width: 200 }}
                allowClear
                onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
                onChange={(e) => {
                  if (!e.target.value) handleSearch('');
                }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={(e) => {
                  const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                  handleSearch(input?.value || '');
                }}
              />
            </Space.Compact>
            <Select
              placeholder="选择品种"
              style={{ width: 150 }}
              onChange={handleBreedFilter}
              allowClear
              value={filters.breed || undefined}
            >
              {breeds.map((breed) => (
                <Option key={breed.name} value={breed.name}>
                  {breed.name} ({breed.count})
                </Option>
              ))}
            </Select>
            <Select
              placeholder="选择性别"
              style={{ width: 120 }}
              onChange={handleGenderFilter}
              allowClear
              value={filters.gender || undefined}
            >
              <Option value="公">公</Option>
              <Option value="母">母</Option>
              <Option value="未验卡">未验卡</Option>
            </Select>
            <Select
              placeholder="选择状态"
              style={{ width: 120 }}
              onChange={handleStatusFilter}
              allowClear
              value={filters.status || undefined}
            >
              <Option value="available">待售</Option>
              <Option value="sold">已售</Option>
              <Option value="returned">退货</Option>
              <Option value="breeding">种鸟</Option>
              <Option value="paired">配对中</Option>
              <Option value="incubating">孵化中</Option>
            </Select>
            <InputNumber
              placeholder="最低价格"
              style={{ width: 120 }}
              min={0}
              precision={2}
              value={priceRange.min}
              onChange={(value) => handlePriceRangeFilter('min', value)}
            />
            <InputNumber
              placeholder="最高价格"
              style={{ width: 120 }}
              min={0}
              precision={2}
              value={priceRange.max}
              onChange={(value) => handlePriceRangeFilter('max', value)}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearchWithFilters}
            >
              查询
            </Button>
            <Button onClick={handleClearAllFilters}>
              清空
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={parrots}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (newPage, newPageSize) => {
                if (newPageSize !== pageSize) {
                  setPageSize(newPageSize);
                  setPage(1); // Reset to first page when page size changes
                } else {
                  setPage(newPage);
                }
              },
            }}
          />
        </Space>
      </Card>

      <Modal
        title={editingParrot ? '编辑鹦鹉' : '添加鹦鹉'}
        open={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <ParrotForm
          parrot={editingParrot}
          onSuccess={() => {
            setIsFormVisible(false);
            fetchParrots();
          }}
          onCancel={() => setIsFormVisible(false)}
        />
      </Modal>

      <Modal
        title="鹦鹉详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        {selectedParrot && <ParrotDetail parrot={selectedParrot} />}
      </Modal>

      <Modal
        title="销售信息"
        open={isSaleModalVisible}
        onCancel={() => {
          setIsSaleModalVisible(false);
          saleForm.resetFields();
        }}
        onOk={() => saleForm.submit()}
        okText="确认销售"
        cancelText="取消"
      >
        <Form
          form={saleForm}
          layout="vertical"
          onFinish={handleSaleSubmit}
        >
          <Form.Item
            label="售卖人"
            name="seller"
            rules={[{ required: true, message: '请选择售卖人' }]}
          >
            <Select placeholder="请选择售卖人">
              <Option value="杨慧德">杨慧德</Option>
              <Option value="杨慧艳">杨慧艳</Option>
              <Option value="贾号号">贾号号</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="购买者姓名"
            name="buyerName"
            rules={[{ required: true, message: '请输入购买者姓名' }]}
          >
            <Input placeholder="请输入购买者姓名" />
          </Form.Item>
          <Form.Item
            label="出售价格"
            name="salePrice"
            rules={[{ required: true, message: '请输入出售价格' }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <div style={{
                width: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5',
                border: '1px solid #d9d9d9',
                borderRight: 'none',
                borderRadius: '6px 0 0 6px',
                fontSize: '14px',
                color: '#6D7A8D'
              }}>
                ¥
              </div>
              <InputNumber
                style={{ width: 'calc(100% - 60px)' }}
                placeholder="请输入出售价格"
                min={0}
                precision={2}
              />
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label="联系方式"
            name="contact"
            rules={[
              { required: true, message: '请输入联系方式' }
            ]}
          >
            <Input placeholder="请输入微信号或电话号码" />
          </Form.Item>
          <Form.Item
            label="回访状态"
            name="followUpStatus"
            initialValue="pending"
          >
            <Select placeholder="请选择回访状态">
              <Option value="pending">待回访</Option>
              <Option value="completed">已回访</Option>
              <Option value="no_contact">无法联系</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="备注"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="回访信息"
        open={isFollowUpModalVisible}
        onCancel={() => {
          setIsFollowUpModalVisible(false);
          followUpForm.resetFields();
        }}
        onOk={() => followUpForm.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={followUpForm}
          layout="vertical"
          onFinish={handleFollowUpSubmit}
        >
          <Form.Item
            label="回访状态"
            name="followUpStatus"
            rules={[{ required: true, message: '请选择回访状态' }]}
          >
            <Select placeholder="请选择回访状态">
              <Option value="pending">待回访</Option>
              <Option value="completed">已回访</Option>
              <Option value="no_contact">无法联系</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="回访备注"
            name="notes"
          >
            <Input.TextArea rows={4} placeholder="请输入回访情况备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="退货处理"
        open={isReturnModalVisible}
        onCancel={() => {
          setIsReturnModalVisible(false);
          returnForm.resetFields();
        }}
        onOk={() => returnForm.submit()}
        okText="确认退货"
        cancelText="取消"
      >
        <Form
          form={returnForm}
          layout="vertical"
          onFinish={handleReturnSubmit}
        >
          <Form.Item
            label="退货原因"
            name="returnReason"
            rules={[{ required: true, message: '请输入退货原因' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入退货原因（客户不满意、健康问题等）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ParrotListPage;
