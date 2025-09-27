import React from 'react';
import { Shield, ShieldCheck, Eye, Edit3, Crown } from 'lucide-react';

interface PermissionStatusBadgeProps {
  permission: 'owner' | 'edit' | 'view' | 'none';
  isPrimary?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function PermissionStatusBadge({ 
  permission, 
  isPrimary = false, 
  size = 'md', 
  showText = true 
}: PermissionStatusBadgeProps) {
  const getConfig = () => {
    switch (permission) {
      case 'owner':
        return {
          icon: isPrimary ? Crown : ShieldCheck,
          label: isPrimary ? 'Primary Therapist' : 'Full Access',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-200'
        };
      case 'edit':
        return {
          icon: Edit3,
          label: 'Edit Access',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case 'view':
        return {
          icon: Eye,
          label: 'View Only',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'none':
      default:
        return {
          icon: Shield,
          label: 'No Access',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      spacing: 'gap-1'
    },
    md: {
      container: 'px-2.5 py-1.5 text-sm',
      icon: 'w-4 h-4',
      spacing: 'gap-1.5'
    },
    lg: {
      container: 'px-3 py-2 text-base',
      icon: 'w-5 h-5',
      spacing: 'gap-2'
    }
  }[size];

  if (permission === 'none' && !showText) {
    return null;
  }

  return (
    <div className={`
      inline-flex items-center font-medium rounded-full border
      ${config.bgColor} ${config.textColor} ${config.borderColor}
      ${sizeClasses.container} ${sizeClasses.spacing}
    `}>
      <Icon className={sizeClasses.icon} />
      {showText && (
        <span>{config.label}</span>
      )}
    </div>
  );
}