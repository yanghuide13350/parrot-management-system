import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Card, Tag, Modal, Divider, message } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, EyeOutlined, DeleteOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useParrot } from '../context/ParrotContext';
import { api } from '../services/api';
import type { Parrot } from '../types/parrot';
import ParrotDetail from '../components/ParrotDetail';
import { calculateAge } from '../utils/dateUtils';

const BreedingManagementPage = () => {
  const navigate = useNavigate();
  const {
    parrots,
    loading,
    total,
    page,
    pageSize,
    filters,
    fetchParrots,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    // updateStatus,
  } = useParrot();

  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedMaleBreeding, setSelectedMaleBreeding] = useState<Parrot | null>(null);
  const [compatibleFemales, setCompatibleFemales] = useState<Parrot[]>([]);
  const [showFemalesModal, setShowFemalesModal] = useState(false);
  const [selectedParrot, setSelectedParrotLocal] = useState<Parrot | null>(null);
  // 新增：母鸟配对相关状态
  const [selectedFemaleBreeding, setSelectedFemaleBreeding] = useState<Parrot | null>(null);
  const [compatibleMales, setCompatibleMales] = useState<Parrot[]>([]);
  const [showMalesModal, setShowMalesModal] = useState(false);

  // Minimum age for breeding (in days) - 1 year
  // const MIN_BREEDING_AGE_DAYS = 365;

  useEffect(() => {
    // Only show breeding birds while on this page
    setFilters({ status: 'breeding' });
    setIsInitialized(true);

    return () => {
      setIsInitialized(false);
      clearFilters();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    fetchParrots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters, isInitialized]);

  const handleViewDetail = (parrot: Parrot) => {
    setSelectedParrotLocal(parrot);
    setIsDetailVisible(true);
  };

  // const handlePromoteToBreeding = async (parrot: Parrot) => {
  //   try {
  //     await updateStatus(parrot.id, 'breeding');
  //     message.success(`${parrot.breed}已设置为种鸟`);
  //     fetchParrots();
  //   } catch (error) {
  //     message.error('设置失败');
  //   }
  // };

  const handleViewCompatibleFemales = async (maleParrot: Parrot) => {
    try {
      // Check if male is already paired
      if (maleParrot.mate_id) {
        message.warning('该公鹦鹉已经配对，无法再次配对');
        return;
      }
      // Fetch all eligible females from API (not limited by breed)
      const females = await api.get<Parrot[]>(`/parrots/eligible-females/${maleParrot.id}`);
      setSelectedMaleBreeding(maleParrot);
      setCompatibleFemales(females);
      setShowFemalesModal(true);
    } catch (error) {
      console.error('Failed to fetch eligible females:', error);
      message.error('获取可配对母鸟失败');
    }
  };

  // 新增：为母鸟查找可配对的公鸟
  const handleViewCompatibleMales = async (femaleParrot: Parrot) => {
    try {
      // Check if female is already paired
      if (femaleParrot.mate_id) {
        message.warning('该母鹦鹉已经配对，无法再次配对');
        return;
      }
      // Fetch all breeding parrots with pagination to get all males
      // First, get a larger page size to fetch more breeding birds
      const allBreedingResponse = await api.get('/parrots', {
        params: {
          status: 'breeding',
          size: 1000, // Get a large number to include all breeding birds
        },
      });

      const allBreedingParrots = allBreedingResponse.items || [];
      const eligibleMales = allBreedingParrots.filter(
        (p: Parrot) => p.gender === '公' && !p.mate_id && p.id !== femaleParrot.id
      );

      setSelectedFemaleBreeding(femaleParrot);
      setCompatibleMales(eligibleMales);
      setShowMalesModal(true);
    } catch (error) {
      console.error('Failed to fetch eligible males:', error);
      message.error('获取可配对公鸟失败');
    }
  };

  const handleConfirmPairing = async (female: Parrot) => {
    if (!selectedMaleBreeding) {
      message.error('未选择公鸟');
      return;
    }

    try {
      await api.post('/parrots/pair', {
        male_id: selectedMaleBreeding.id,
        female_id: female.id,
      });

      message.success(`配对成功：${selectedMaleBreeding.breed} (圈号: ${selectedMaleBreeding.ring_number || '无'}) 与 ${female.breed} (圈号: ${female.ring_number || '无'})`);
      setShowFemalesModal(false);
      fetchParrots(); // Refresh the list
    } catch (error: any) {
      console.error('Pairing failed:', error);
      const errMessage = error.response?.data?.detail || error.response?.data?.message || '配对失败';
      message.error(errMessage);
    }
  };

  // 新增：通过母鸟选择的公鸟进行配对
  const handleConfirmPairingFromFemale = async (male: Parrot) => {
    if (!selectedFemaleBreeding) {
      message.error('未选择母鸟');
      return;
    }

    try {
      await api.post('/parrots/pair', {
        male_id: male.id,
        female_id: selectedFemaleBreeding.id,
      });

      message.success(`配对成功：${male.breed} (圈号: ${male.ring_number || '无'}) 与 ${selectedFemaleBreeding.breed} (圈号: ${selectedFemaleBreeding.ring_number || '无'})`);
      setShowMalesModal(false);
      fetchParrots(); // Refresh the list
    } catch (error: any) {
      console.error('Pairing failed:', error);
      const errMessage = error.response?.data?.detail || error.response?.data?.message || '配对失败';
      message.error(errMessage);
    }
  };

  const handleRemoveFromBreeding = async (parrot: Parrot) => {
    const confirmed = window.confirm(
      `确定要将 "${parrot.breed}" (圈号: ${parrot.ring_number || '无'}) 从种鸟状态移除吗？\n\n移除后将变为待售状态。`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(`/parrots/${parrot.id}/status`, { status: 'available' });
      message.success(`已移除种鸟状态：${parrot.breed} (圈号: ${parrot.ring_number || '无'})`);
      fetchParrots(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to remove from breeding:', error);
      const errMessage = error.response?.data?.detail || error.response?.data?.message || '操作失败';
      message.error(errMessage);
    }
  };

  const handleUnpairParrot = async (parrot: Parrot) => {
    const confirmed = window.confirm(
      `确定要取消 "${parrot.breed}" (圈号: ${parrot.ring_number || '无'}) 的配对吗？\n\n取消后两只鹦鹉都可以重新配对。`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.post(`/parrots/unpair/${parrot.id}`);
      message.success(`已取消配对：${parrot.breed} (圈号: ${parrot.ring_number || '无'})`);
      fetchParrots(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to unpair:', error);
      const errMessage = error.response?.data?.detail || error.response?.data?.message || '取消配对失败';
      message.error(errMessage);
    }
  };

  const handleViewAllEligible = () => {
    // Navigate to all parrots page with no status filter to see eligible birds
    navigate('/parrots');
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
      render: (gender: string) => (
        <Tag color={gender === '公' ? 'blue' : 'pink'}>{gender}</Tag>
      ),
    },
    {
      title: '配对状态',
      key: 'pairing_status',
      width: 100,
      render: (record: Parrot) => {
        if (record.mate_id) {
          return (
            <Tag color="success" icon={<HeartOutlined />}>
              已配对
            </Tag>
          );
        }
        return <Tag color="default">未配对</Tag>;
      },
    },
    {
      title: '配偶信息',
      key: 'mate_info',
      width: 120,
      render: (record: Parrot) => {
        if (record.mate_id) {
          return <span style={{ color: '#52c41a', fontSize: '12px' }}>ID: {record.mate_id}</span>;
        }
        return '-';
      },
    },
    {
      title: '年龄',
      key: 'age',
      width: 120,
      render: (record: Parrot) => calculateAge(record.birth_date),
    },
    {
      title: '出生日期',
      dataIndex: 'birth_date',
      key: 'birth_date',
      width: 120,
      render: (val: string | null) => val || '-',
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
      width: 420,
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
          {/* 如果未配对且是公鸟，显示配对按钮 */}
          {!record.mate_id && record.gender === '公' && (
            <Button
              type="link"
              size="small"
              icon={<HeartOutlined />}
              onClick={() => handleViewCompatibleFemales(record)}
              style={{ padding: '0 4px' }}
            >
              配对
            </Button>
          )}
          {/* 如果未配对且是母鸟，显示配对按钮 */}
          {!record.mate_id && record.gender === '母' && (
            <Button
              type="link"
              size="small"
              icon={<HeartOutlined />}
              onClick={() => handleViewCompatibleMales(record)}
              style={{ padding: '0 4px', color: '#eb2f96' }}
            >
              配对
            </Button>
          )}
          {/* 如果已配对，显示取消配对按钮 */}
          {record.mate_id && (
            <Button
              type="link"
              size="small"
              icon={<DisconnectOutlined />}
              onClick={() => handleUnpairParrot(record)}
              style={{ padding: '0 4px', color: '#fa8c16' }}
            >
              取消配对
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleRemoveFromBreeding(record)}
            style={{ padding: '0 4px' }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const femaleColumns = [
    {
      title: '圈号',
      dataIndex: 'ring_number',
      key: 'ring_number',
      render: (val: string | null) => val || '-',
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: '年龄',
      key: 'age',
      render: (record: Parrot) => calculateAge(record.birth_date),
    },
    {
      title: '出生日期',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (val: string | null) => val || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: any, record: Parrot) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setShowFemalesModal(false);
              handleViewDetail(record);
            }}
            style={{ padding: '0 4px' }}
          >
            查看详情
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<HeartOutlined />}
            onClick={() => handleConfirmPairing(record)}
            style={{ padding: '0 4px' }}
          >
            确认配对
          </Button>
        </Space>
      ),
    },
  ];

  // 新增：公鸟列表的列定义
  const maleColumns = [
    {
      title: '圈号',
      dataIndex: 'ring_number',
      key: 'ring_number',
      render: (val: string | null) => val || '-',
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: '年龄',
      key: 'age',
      render: (record: Parrot) => calculateAge(record.birth_date),
    },
    {
      title: '出生日期',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (val: string | null) => val || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: any, record: Parrot) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setShowMalesModal(false);
              handleViewDetail(record);
            }}
            style={{ padding: '0 4px' }}
          >
            查看详情
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<HeartOutlined />}
            onClick={() => handleConfirmPairingFromFemale(record)}
            style={{ padding: '0 4px' }}
          >
            确认配对
          </Button>
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
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>种鸟管理</h2>
            </Space>
            <Button type="primary" onClick={handleViewAllEligible}>
              查看可设为种鸟的鹦鹉
            </Button>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <div style={{ background: '#f0f5ff', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#1890ff' }}>
              <strong>提示：</strong>
              种鸟是用于繁殖的鹦鹉。点击"查看可设为种鸟的鹦鹉"按钮可以查看所有鹦鹉，并将符合年龄要求的鹦鹉设置为种鸟。
              对于未配对的公种鸟和母种鸟，都可以点击"配对"按钮查看可配对的配偶。公鸟点击会显示可配对的母鸟，母鸟点击会显示可配对的公鸟。
              已经配对的鹦鹉会显示配对状态和配偶信息，可以点击"取消配对"按钮来解除配对关系。
            </p>
          </div>

          <Table
            columns={columns}
            dataSource={parrots}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 只种鸟`,
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
              },
            }}
          />
        </Space>
      </Card>

      {/* Parrot Detail Modal */}
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

      {/* Compatible Females Modal */}
      <Modal
        title={`为 ${selectedMaleBreeding?.breed} (圈号: ${selectedMaleBreeding?.ring_number || '无'}) 查找配对母鸟`}
        open={showFemalesModal}
        onCancel={() => setShowFemalesModal(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {compatibleFemales.length > 0 ? (
          <>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              找到 {compatibleFemales.length} 只可配对的母鸟（不局限于同品种）：
            </p>
            <Table
              columns={femaleColumns}
              dataSource={compatibleFemales}
              rowKey="id"
              pagination={false}
              scroll={{ x: 600 }}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>暂无可配对的母鸟</p>
            <p style={{ fontSize: '14px' }}>请先将符合条件的母鸟设置为种鸟</p>
          </div>
        )}
      </Modal>

      {/* 新增：Compatible Males Modal */}
      <Modal
        title={`为 ${selectedFemaleBreeding?.breed} (圈号: ${selectedFemaleBreeding?.ring_number || '无'}) 查找配对公鸟`}
        open={showMalesModal}
        onCancel={() => setShowMalesModal(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {compatibleMales.length > 0 ? (
          <>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              找到 {compatibleMales.length} 只可配对的公鸟（不局限于同品种）：
            </p>
            <Table
              columns={maleColumns}
              dataSource={compatibleMales}
              rowKey="id"
              pagination={false}
              scroll={{ x: 600 }}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>暂无可配对的公鸟</p>
            <p style={{ fontSize: '14px' }}>请先将符合条件的公鸟设置为种鸟</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BreedingManagementPage;
