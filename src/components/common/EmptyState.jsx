import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmptyState({
  Icon,
  title,
  message,
  actionText,
  onAction
}) {
  return (
    <Card className="w-full">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center text-gray-500">
          {Icon && <Icon className="w-16 h-16 text-gray-300 mb-6" />}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="mb-6">{message}</p>
          {actionText && onAction && (
            <Button onClick={onAction} variant="outline">
              {actionText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}