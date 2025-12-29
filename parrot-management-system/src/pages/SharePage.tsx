import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Image, Result, Tag } from 'antd';
import { LoadingOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface ParrotShareInfo {
  id: number;
  breed: string;
  gender: string;
  price: number | null;
  birth_date: string | null;
  ring_number: string | null;
  health_notes: string | null;
  status: string;
}

interface PhotoInfo {
  id: number;
  file_path: string;
  file_name: string;
  file_type: string;
}

interface ShareData {
  status: 'valid' | 'expired' | 'invalid';
  parrot?: ParrotShareInfo;
  photos?: PhotoInfo[];
  message?: string;
}

// 计算年龄
const calculateAge = (birthDate: string | null): string => {
  if (!birthDate) return '-';
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays}天`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return days > 0 ? `${months}个月${days}天` : `${months}个月`;
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return months > 0 ? `${years}年${months}个月` : `${years}年`;
  }
};

const statusMap: Record<string, string> = {
  'available': '待售',
  'sold': '已售',
  'returned': '退货',
  'breeding': '种鸟',
  'paired': '已配对',
};

const statusColors: Record<string, string> = {
  'available': '#1890ff',
  'sold': '#52c41a',
  'returned': '#ff4d4f',
  'breeding': '#722ed1',
  'paired': '#eb2f96',
};

const SharePage = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ShareData | null>(null);

  useEffect(() => {
    const fetchShareData = async () => {
      try {
        const response = await fetch(`/api/share/${token}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('获取分享数据失败:', error);
        setData({
          status: 'invalid',
          message: '加载失败，请稍后重试'
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchShareData();
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />} />
      </div>
    );
  }

  // 过期页面
  if (data?.status === 'expired') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <Result
          icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          title={<span style={{ color: '#fff' }}>链接已过期</span>}
          subTitle={<span style={{ color: 'rgba(255,255,255,0.8)' }}>该分享链接已超过有效期，请联系卖家获取新链接</span>}
          style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px' }}
        />
      </div>
    );
  }

  // 无效页面
  if (data?.status === 'invalid' || !data?.parrot) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <Result
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          title={<span style={{ color: '#fff' }}>链接无效</span>}
          subTitle={<span style={{ color: 'rgba(255,255,255,0.8)' }}>{data?.message || '该链接不存在或已失效'}</span>}
          style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px' }}
        />
      </div>
    );
  }

  const { parrot, photos = [] } = data;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* 头部 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '30px 20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
            {parrot.breed}
          </h1>
          {parrot.price && (
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
              ¥{parrot.price.toFixed(2)}
            </div>
          )}
        </div>

        {/* 基本信息 */}
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <InfoCard label="圈号" value={parrot.ring_number || '-'} />
            <InfoCard label="性别" value={parrot.gender} />
            <InfoCard label="年龄" value={calculateAge(parrot.birth_date)} />
            <InfoCard label="出生日期" value={parrot.birth_date || '-'} />
            <InfoCard 
              label="状态" 
              value={
                <Tag color={statusColors[parrot.status] || 'default'}>
                  {statusMap[parrot.status] || parrot.status}
                </Tag>
              } 
            />
            <InfoCard label="媒体数量" value={`${photos.length} 个`} />
          </div>

          {/* 健康备注 */}
          {parrot.health_notes && (
            <div style={{
              background: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>健康备注</div>
              <div style={{ color: '#333' }}>{parrot.health_notes}</div>
            </div>
          )}

          {/* 提示 */}
          <div style={{
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#1890ff'
          }}>
            💡 提示：长按图片可以保存到手机相册
          </div>

          {/* 照片和视频 */}
          {photos.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
                照片和视频 ({photos.length})
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {photos.map((photo) => (
                  <div 
                    key={photo.id}
                    style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      background: '#f5f5f5'
                    }}
                  >
                    {photo.file_type === 'video' ? (
                      <video
                        controls
                        playsInline
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          display: 'block',
                          background: '#000'
                        }}
                        src={`/uploads/${photo.file_path}`}
                      >
                        您的浏览器不支持视频播放
                      </video>
                    ) : (
                      <Image
                        src={`/uploads/${photo.file_path}`}
                        alt={photo.file_name}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        preview={{
                          mask: '查看大图'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {photos.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999'
            }}>
              暂无照片和视频
            </div>
          )}
        </div>

        {/* 底部 */}
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          textAlign: 'center',
          color: '#999',
          fontSize: '12px'
        }}>
          鹦鹉管理系统 · 分享页面
        </div>
      </div>
    </div>
  );
};

// 信息卡片组件
const InfoCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div style={{
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '12px'
  }}>
    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '15px', fontWeight: 500, color: '#333' }}>{value}</div>
  </div>
);

export default SharePage;
