import React from 'react';
import { Card, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface MatchingErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const MatchingErrorState: React.FC<MatchingErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Card className="border-rose-200 bg-rose-50/50">
      <CardBody className="p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-rose-950">Matching Engine Notice</h4>
          <p className="text-xs text-rose-800 font-medium max-w-md mx-auto">{error}</p>
        </div>
        {onRetry && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry Matching Search
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
