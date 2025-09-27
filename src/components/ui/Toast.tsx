import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, X, RefreshCw, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  details?: string;
  onClose: () => void;
  onRetry?: () => void;
  duration?: number;
}

export function Toast({ 
  type, 
  message, 
  details, 
  onClose, 
  onRetry,
  duration = 5000 
}: ToastProps) {
  useEffect(() => {
    if (!onRetry) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, onRetry]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={cn(
        'fixed bottom-4 right-4 max-w-sm rounded-lg shadow-lg p-4',
        type === 'success' ? 'bg-green-50 text-green-900' : 
        type === 'warning' ? 'bg-yellow-50 text-yellow-900' :
        'bg-red-50 text-red-900'
      )}
    >
      <div className="flex items-start gap-3">
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        ) : type === 'warning' ? (
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
          {details && <p className="mt-1 text-sm opacity-90">{details}</p>}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className={cn(
            'flex-shrink-0 rounded-lg p-1 transition-colors',
            type === 'success' 
              ? 'hover:bg-green-100 text-green-600' 
              : type === 'warning'
              ? 'hover:bg-yellow-100 text-yellow-600'
              : 'hover:bg-red-100 text-red-600'
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}