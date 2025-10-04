
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HealthMetric } from "@/lib/health-data";

interface EditMetricDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metric: HealthMetric;
  currentValue: string;
  onSave: (metricId: string, newValue: string) => void;
}

export function EditMetricDialog({
  isOpen,
  onClose,
  metric,
  currentValue,
  onSave,
}: EditMetricDialogProps) {
  
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  
  useEffect(() => {
    const parts = currentValue.split(' ');
    const numericValue = parts[0];
    const unitPart = parts.slice(1).join(' ');
    setValue(numericValue);
    setUnit(unitPart);
  }, [currentValue]);


  const handleSave = () => {
    const newValueWithUnit = `${value.trim()} ${unit}`.trim();
    onSave(metric.id, newValueWithUnit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {metric.title}</DialogTitle>
          <DialogDescription>
            Update your {metric.title.toLowerCase()} for today.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="metric-value">{metric.title}</Label>
            <div className="flex items-center gap-2">
                <Input
                  id="metric-value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={metric.defaultValue.split(' ')[0]}
                />
                {unit && <span className="text-muted-foreground">{unit}</span>}
            </div>
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">
                    Cancel
                </Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
