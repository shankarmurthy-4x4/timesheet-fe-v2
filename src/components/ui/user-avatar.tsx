import React from 'react';
import { Avatar } from './avatar';
import { useNavigate } from 'react-router-dom';

interface UserAvatarProps {
  user: {
    id?: string;
    name: string;
    email?: string;
    avatar: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  navigable?: boolean;
}

export function UserAvatar({ 
  user, 
  size = 'md', 
  showDetails = true,
  navigable = true
}: UserAvatarProps) {
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };
  
  const handleClick = () => {
    if (navigable && user.id) {
      navigate(`/users/${user.id}`);
    }
  };
  
  return (
    <div 
      className={`flex items-center gap-2 ${navigable && user.id ? 'cursor-pointer hover:bg-gray-50 p-1 rounded' : ''}`}
      onClick={handleClick}
    >
      <Avatar className={sizeClasses[size]}>
        <img src={user.avatar} alt={user.name} />
      </Avatar>
      {showDetails && (
        <div>
          <p className={`${navigable && user.id ? 'text-blue-600' : 'text-gray-900'} font-medium text-sm`}>
            {user.name}
          </p>
          {user.email && (
            <p className="text-xs text-gray-500">{user.email}</p>
          )}
        </div>
      )}
    </div>
  );
}