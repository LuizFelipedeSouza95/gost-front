import React from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'delete' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  type = 'delete',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      case 'warning':
        return <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />;
      default:
        return <AlertTriangle className="w-16 h-16 text-blue-500 mx-auto mb-4" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <Card 
        className="p-6 bg-gray-800 border-amber-600/30 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          {getIcon()}
          <h3 className="text-2xl text-white mb-2 font-bold">
            {title}
          </h3>
          <p className="text-gray-400 whitespace-pre-line">
            {message}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            {cancelText || 'Cancelar'}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${getConfirmButtonClass()}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              confirmText || (type === 'delete' ? 'Excluir' : 'Confirmar')
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

