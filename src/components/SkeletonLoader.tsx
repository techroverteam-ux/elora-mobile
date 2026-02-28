import React from 'react';
import './SkeletonLoader.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '4px',
  className = '',
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  };

  return <div className={`skeleton ${className}`} style={style} />;
};

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <Skeleton width={size} height={size} borderRadius="50%" />
);

export const SkeletonText: React.FC<{ lines?: number; width?: string }> = ({ 
  lines = 1, 
  width = '100%' 
}) => (
  <div className="skeleton-text">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 ? '75%' : width}
        height="16px"
        className="skeleton-text-line"
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="skeleton-card">
    <div className="skeleton-card-header">
      <SkeletonAvatar size={48} />
      <div className="skeleton-card-info">
        <Skeleton width="120px" height="18px" />
        <Skeleton width="80px" height="14px" />
      </div>
    </div>
    <div className="skeleton-card-content">
      <SkeletonText lines={3} />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="skeleton-list">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="skeleton-list-item">
        <SkeletonAvatar size={32} />
        <div className="skeleton-list-content">
          <Skeleton width="140px" height="16px" />
          <Skeleton width="200px" height="14px" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} width="100px" height="20px" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="skeleton-table-row">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} width="80px" height="16px" />
        ))}
      </div>
    ))}
  </div>
);