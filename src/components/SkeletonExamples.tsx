import React, { useState, useEffect } from 'react';
import { 
  Skeleton, 
  SkeletonAvatar, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonTable 
} from './SkeletonLoader';
import { useSkeleton } from '../hooks/useSkeleton';

// Example: Store List with Skeleton
export const StoreListExample: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useSkeleton(isLoading);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStores([
        { id: 1, name: 'Store 1', city: 'Mumbai' },
        { id: 2, name: 'Store 2', city: 'Delhi' },
      ]);
      setIsLoading(false);
    }, 2000);
  }, []);

  if (showSkeleton) {
    return <SkeletonList items={5} />;
  }

  return (
    <div>
      {stores.map(store => (
        <div key={store.id} className="store-item">
          <h3>{store.name}</h3>
          <p>{store.city}</p>
        </div>
      ))}
    </div>
  );
};

// Example: User Profile with Skeleton
export const UserProfileExample: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useSkeleton(isLoading);

  useEffect(() => {
    setTimeout(() => {
      setUser({ name: 'John Doe', email: 'john@example.com' });
      setIsLoading(false);
    }, 1500);
  }, []);

  if (showSkeleton) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <SkeletonAvatar size={64} />
        <div>
          <Skeleton width="150px" height="20px" />
          <Skeleton width="200px" height="16px" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img src="/avatar.jpg" alt="Avatar" width={64} height={64} />
      <div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

// Example: Data Table with Skeleton
export const DataTableExample: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useSkeleton(isLoading);

  useEffect(() => {
    setTimeout(() => {
      setData([
        { id: 1, name: 'Item 1', status: 'Active' },
        { id: 2, name: 'Item 2', status: 'Inactive' },
      ]);
      setIsLoading(false);
    }, 2500);
  }, []);

  if (showSkeleton) {
    return <SkeletonTable rows={8} columns={3} />;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};