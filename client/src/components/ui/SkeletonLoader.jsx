const SkeletonLoader = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  lines = 1,
  className = '',
}) => {
  if (lines > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              width: i === lines - 1 ? '60%' : width,
              height,
              borderRadius,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-card p-6 space-y-4 ${className}`}>
    <SkeletonLoader height="160px" borderRadius="12px" />
    <SkeletonLoader height="14px" width="40%" />
    <SkeletonLoader height="20px" width="80%" />
    <SkeletonLoader height="14px" lines={2} />
    <div className="flex gap-3 mt-4">
      <SkeletonLoader height="36px" width="100px" borderRadius="12px" />
      <SkeletonLoader height="36px" width="100px" borderRadius="12px" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="glass-card p-8 h-48">
      <SkeletonLoader height="32px" width="40%" className="mb-4" />
      <SkeletonLoader height="16px" width="60%" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} height="100px" borderRadius="16px" />)}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="glass-card p-6 h-96"><SkeletonLoader height="24px" width="30%" className="mb-6" /><div className="space-y-4">{[1, 2, 3].map(i => <SkeletonLoader key={i} height="60px" borderRadius="12px" />)}</div></div>
      <div className="glass-card p-6 h-96"><SkeletonLoader height="24px" width="30%" className="mb-6" /><div className="space-y-4">{[1, 2, 3].map(i => <SkeletonLoader key={i} height="60px" borderRadius="12px" />)}</div></div>
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><SkeletonLoader height="40px" width="200px" /><SkeletonLoader height="40px" width="300px" /></div>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => <SkeletonLoader key={i} height="80px" borderRadius="16px" />)}
    </div>
  </div>
);

export default SkeletonLoader;
