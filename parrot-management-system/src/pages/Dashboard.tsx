import { useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import { ShoppingOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, HeartOutlined } from '@ant-design/icons';
import { useParrot } from '../context/ParrotContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { statistics, fetchStatistics, loading, updateFilters } = useParrot();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset filters when entering dashboard
    updateFilters({});
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>鹦鹉管理系统仪表板</h1>
        <Space>
          <Button type="primary" onClick={() => navigate('/parrots')}>
            管理鹦鹉
          </Button>
          <Button type="default" icon={<HeartOutlined />} onClick={() => navigate('/breeding')}>
            种鸟管理
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总鹦鹉数"
              value={statistics?.total_parrots || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="在售鹦鹉"
              value={statistics?.available_parrots || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="已售鹦鹉"
              value={statistics?.sold_parrots || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总销售额"
              value={statistics?.total_revenue || 0}
              precision={2}
              valueStyle={{ color: '#faad14' }}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      {statistics?.breed_counts && Object.keys(statistics.breed_counts).length > 0 && (
        <Card title="品种分布统计" style={{ marginTop: '24px' }}>
          <Row gutter={[16, 16]}>
            {Object.entries(statistics.breed_counts).map(([breed, count]) => (
              <Col xs={24} sm={12} md={8} lg={6} key={breed}>
                <Card size="small">
                  <Statistic
                    title={breed}
                    value={count}
                    suffix="只"
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
