import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, Button, Space, Card, Input, Select, Modal, message, Tag, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ShoppingCartOutlined, ArrowLeftOutlined, HeartOutlined, SearchOutlined } from '@ant-design/icons';
import { useParrot } from '../context/ParrotContext';
import type { Parrot } from '../types/parrot';
import ParrotForm from '../components/ParrotForm';
import ParrotDetail from '../components/ParrotDetail';
import { calculateAge, calculateAgeDays } from '../utils/dateUtils';

const { Search } = Input;
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

  // 监听路由变化，当进入鹦鹉列表页面时重置筛选条件
  useEffect(() => {
    if (location.pathname === '/parrots') {
      clearFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // 路由变化时执行

  useEffect(() => {
    fetchParrots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters]);

  const handleAddParrot = () => {
    setEditingParrot(null);
    setIsFormVisible(true);
  };

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

  const handleSellParrot = async (id: number) => {
    try {
      await updateStatus(id, 'sold');
      message.success('标记售出成功');
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

  const statusMap: Record<string, string> = {
    'available': '待售',
    'sold': '已售',
    'returned': '退货',
    'breeding': '种鸟',
  };

  const statusColors: Record<string, string> = {
    'available': 'blue',
    'sold': 'green',
    'returned': 'red',
    'breeding': 'purple',
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
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{statusMap[status] || status}</Tag>
      ),
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
      render: (_: any, record: Parrot) => (
        <Space size={4}>
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
          {record.status === 'available' && (
            <>
              <Popconfirm
                title="确认售出"
                description="确定要将此鹦鹉标记为已售吗？"
                onConfirm={() => handleSellParrot(record.id)}
                okText="确认"
                cancelText="取消"
              >
                <Button type="link" size="small" icon={<ShoppingCartOutlined />} style={{ padding: '0 4px' }}>
                  售出
                </Button>
              </Popconfirm>
              <Button type="link" size="small" icon={<HeartOutlined />} onClick={() => handleSetAsBreeding(record)} style={{ padding: '0 4px' }}>
                种鸟
              </Button>
            </>
          )}
          {record.status === 'breeding' && (
            <Button type="link" size="small" disabled title="种鸟不能售卖" style={{ padding: '0 4px' }}>
              种鸟
            </Button>
          )}
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
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Space size="large" align="center">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/dashboard')}
                style={{
                  fontSize: '16px',
                  padding: '4px 8px',
                  height: 'auto',
                  color: '#1890ff',
                  fontWeight: 500,
                }}
              >
                返回仪表板
              </Button>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>鹦鹉列表</h2>
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddParrot} size="large">
              添加鹦鹉
            </Button>
          </div>

          <Space size="middle" wrap>
            <Search
              placeholder="搜索品种或圈号"
              onSearch={handleSearch}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="选择品种"
              style={{ width: 150 }}
              onChange={handleBreedFilter}
              allowClear
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
            >
              <Option value="available">待售</Option>
              <Option value="sold">已售</Option>
              <Option value="returned">退货</Option>
              <Option value="breeding">种鸟</Option>
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
        destroyOnClose
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
        destroyOnClose
      >
        {selectedParrot && <ParrotDetail parrot={selectedParrot} />}
      </Modal>
    </div>
  );
};

export default ParrotListPage;
