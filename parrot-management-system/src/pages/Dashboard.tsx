import { useEffect, useState } from 'react';
import { Card, Row, Col, Space, Tag, Empty } from 'antd';
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  FireOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';
import { useParrot } from '../context/ParrotContext';
import { useNavigate } from 'react-router-dom';
import type { MonthlySales, MonthlySalesData } from '../types/parrot';
import { api } from '../services/api';

const Dashboard = () => {
  const { statistics, fetchStatistics, updateFilters } = useParrot();
  const navigate = useNavigate();
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'column'>('line');

  useEffect(() => {
    // Reset filters when entering dashboard
    updateFilters({});
    fetchStatistics();
    fetchMonthlySales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMonthlySales = async () => {
    setLoadingChart(true);
    try {
      const response = await api.get<MonthlySales>('/statistics/monthly-sales');
      setMonthlySales(response.monthly_sales || []);
    } catch (error) {
      console.error('获取月度销售数据失败:', error);
    } finally {
      setLoadingChart(false);
    }
  };

  const handleCardClick = (type: string, value?: string) => {
    const params: any = {};

    if (type === 'available') {
      params.status = 'available';
    } else if (type === 'sold') {
      params.status = 'sold';
    } else if (type === 'returned') {
      params.status = 'returned';
    } else if (type === 'breed' && value) {
      params.breed = value;
    }

    // 传递筛选参数到列表页
    navigate('/parrots', { state: { filters: params } });
  };

  // 计算总销售额
  const totalRevenue = statistics?.total_revenue || 0;

  // 获取最后一个月的销售额
  const lastMonthRevenue = monthlySales.length > 0
    ? monthlySales[monthlySales.length - 1].revenue
    : 0;

  // 计算环比增长
  const monthOverMonthGrowth = monthlySales.length > 1
    ? ((lastMonthRevenue - monthlySales[monthlySales.length - 2].revenue) / monthlySales[monthlySales.length - 2].revenue * 100).toFixed(1)
    : '0.0';

  // 图表配置
  const lineConfig = {
    data: monthlySales,
    xField: 'month_name',
    yField: 'revenue',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 2000,
      },
    },
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#1890ff',
        lineWidth: 2,
      },
    },
    color: '#1890ff',
    yAxis: {
      label: {
        formatter: (v: any) => `¥${Number(v).toLocaleString()}`,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: '销售额',
          value: `¥${Number(datum.revenue).toLocaleString()}`,
        };
      },
    },
  };

  const columnConfig = {
    data: monthlySales,
    xField: 'month_name',
    yField: 'count',
    color: '#52c41a',
    animation: {
      appear: {
        animation: 'grow-in-x',
        duration: 1500,
      },
    },
    columnWidthRatio: 0.6,
    label: {
      position: 'top' as const,
    },
    yAxis: {
      label: {
        formatter: (v: any) => `${v}只`,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: '销售数量',
          value: `${datum.count}只`,
        };
      },
    },
  };

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* 标题区域 */}
      <div style={{ marginBottom: '32px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
          🦜 鹦鹉管理系统仪表板
        </h1>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
          数据驱动决策，洞察业务趋势
        </p>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => handleCardClick('total')}
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  总鹦鹉数
                </div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: 'white' }}>
                  {statistics?.total_parrots || 0}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                  <Tag color="cyan">总数统计</Tag>
                </div>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                <ShoppingOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => handleCardClick('available')}
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  在售鹦鹉
                </div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: 'white' }}>
                  {statistics?.available_parrots || 0}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                  <Tag color="green">可售</Tag>
                </div>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                <CheckCircleOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => handleCardClick('sold')}
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  已售鹦鹉
                </div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: 'white' }}>
                  {statistics?.sold_parrots || 0}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                  <Tag color="volcano">已售出</Tag>
                </div>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                <CloseCircleOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              color: 'white',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  总销售额
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>
                  ¥{totalRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                  <Space>
                    {Number(monthOverMonthGrowth) >= 0 ? (
                      <RiseOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <FallOutlined style={{ color: '#ff4d4f' }} />
                    )}
                    <span style={{ color: Number(monthOverMonthGrowth) >= 0 ? '#52c41a' : '#ff4d4f' }}>
                      {Number(monthOverMonthGrowth) >= 0 ? '+' : ''}{monthOverMonthGrowth}%
                    </span>
                  </Space>
                </div>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                <DollarOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 月度销售趋势图表 */}
      <Card
        style={{
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrophyOutlined style={{ color: '#faad14' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>月度销售趋势</span>
            <Space>
              <Tag
                color={chartType === 'line' ? 'blue' : 'default'}
                style={{ cursor: 'pointer' }}
                onClick={() => setChartType('line')}
              >
                销售额
              </Tag>
              <Tag
                color={chartType === 'column' ? 'blue' : 'default'}
                style={{ cursor: 'pointer' }}
                onClick={() => setChartType('column')}
              >
                销售量
              </Tag>
            </Space>
          </div>
        }
        bodyStyle={{ padding: '24px' }}
      >
        {loadingChart ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : monthlySales.length > 0 ? (
          <div style={{ minHeight: '350px' }}>
            {chartType === 'line' ? (
              <Line {...lineConfig} height={320} />
            ) : (
              <Column {...columnConfig} height={320} />
            )}
          </div>
        ) : (
          <Empty description="暂无销售数据" />
        )}
      </Card>

      {/* 品种统计 */}
      {statistics?.breed_counts && Object.keys(statistics.breed_counts).length > 0 && (
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FireOutlined style={{ color: '#ff4d4f' }} />
              <span style={{ fontSize: '18px', fontWeight: 600 }}>品种分布统计</span>
            </div>
          }
          bodyStyle={{ padding: '24px' }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(statistics.breed_counts)
              .sort(([, a], [, b]) => b - a)
              .map(([breed, count], index) => {
                const total = statistics?.total_parrots || 1;
                const percentage = ((count / total) * 100).toFixed(1);
                const colors = [
                  'magenta', 'red', 'volcano', 'orange', 'gold',
                  'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'
                ];
                const color = colors[index % colors.length];

                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={breed}>
                    <Card
                      hoverable
                      onClick={() => handleCardClick('breed', breed)}
                      style={{
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                            {breed}
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1890ff' }}>
                            {count}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            占比 {percentage}%
                          </div>
                        </div>
                        <Tag color={color} style={{ fontSize: '12px' }}>
                          品种
                        </Tag>
                      </div>
                    </Card>
                  </Col>
                );
              })}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
