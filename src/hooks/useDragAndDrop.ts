import { DragEndEvent } from '@dnd-kit/core';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { Event } from '../types';

type PendingDragEvent = {
  event: Event;
  newDate: string;
} | null;

type UseDragAndDropParams = {
  events: Event[];
  saveEvent?: (event: Event) => Promise<void>;
  updateEvent?: (event: Event) => Promise<void>;
  handleRecurringEdit: (event: Event, editSingleOnly: boolean) => Promise<void>;
};

export const useDragAndDrop = ({
  events,
  saveEvent,
  updateEvent,
  handleRecurringEdit,
}: UseDragAndDropParams) => {
  // Use updateEvent if provided, otherwise fall back to saveEvent
  const eventUpdater = updateEvent || saveEvent;

  if (!eventUpdater) {
    throw new Error('Either updateEvent or saveEvent must be provided');
  }
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [pendingDragEvent, setPendingDragEvent] = useState<PendingDragEvent>(null);

  const { enqueueSnackbar } = useSnackbar();

  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
  };

  const handleDragEnd = async (dragEvent: DragEndEvent) => {
    const { active, over } = dragEvent;

    if (!over) return;

    // Extract eventId from data.current or use active.id directly
    const eventId = (active.data.current?.eventId as string) || (active.id as string);
    const targetDate = over.data.current?.targetDate as string;

    if (!targetDate) return;

    const eventToMove = events.find((e) => e.id === eventId);
    if (!eventToMove) return;

    // 같은 날짜로 드롭하면 무시
    if (eventToMove.date === targetDate) return;

    // 반복 일정인 경우 다이얼로그 표시
    if (isRecurringEvent(eventToMove)) {
      setPendingDragEvent({ event: eventToMove, newDate: targetDate });
      setIsRecurringDialogOpen(true);
      return;
    }

    // 일반 일정은 즉시 저장
    try {
      const updatedEvent = {
        ...eventToMove,
        date: targetDate,
      };
      await eventUpdater(updatedEvent);
      enqueueSnackbar('일정이 수정되었습니다', { variant: 'success' });
    } catch (error) {
      console.error('Failed to save dragged event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const handleRecurringConfirm = async (editSingleOnly: boolean) => {
    if (!pendingDragEvent) return;

    const { event, newDate } = pendingDragEvent;

    try {
      const updatedEvent = {
        ...event,
        date: newDate,
      };

      await handleRecurringEdit(updatedEvent, editSingleOnly);
      enqueueSnackbar('일정이 수정되었습니다', { variant: 'success' });
    } catch (error) {
      console.error('Failed to save recurring event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }

    setIsRecurringDialogOpen(false);
    setPendingDragEvent(null);
  };

  const handleRecurringCancel = () => {
    setIsRecurringDialogOpen(false);
    setPendingDragEvent(null);
  };

  return {
    handleDragEnd,
    isRecurringDialogOpen,
    pendingDragEvent,
    handleRecurringConfirm,
    handleRecurringCancel,
  };
};
