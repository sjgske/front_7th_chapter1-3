import { act, renderHook, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { ReactNode } from 'react';

import {
  setupMockHandlerRecurringListUpdate,
  setupMockHandlerUpdating,
  setupMockHandlerWithRequestCapture,
} from '../../__mocks__/handlersUtils';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useRecurringEventOperations } from '../../hooks/useRecurringEventOperations';

type CapturedRequest = { method: string; url: string; body: any };

type DragEndEvent = {
  active: {
    id: string | number;
    data: { current?: { eventId: string; sourceDate: string } };
  };
  over: {
    id: string | number;
    data: { current?: { targetDate: string } };
  } | null;
};

// 테스트용 wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <SnackbarProvider>{children}</SnackbarProvider>
);

// MockDragEndEvent 생성 헬퍼
const createMockDragEndEvent = (
  eventId: string,
  sourceDate: string,
  targetDate: string
): DragEndEvent => ({
  active: {
    id: `event-${eventId}`,
    data: { current: { eventId, sourceDate } },
  },
  over: {
    id: `cell-${targetDate}`,
    data: { current: { targetDate } },
  },
});

// Test hook that provides useDragAndDrop with dependencies
const useTestDragAndDrop = () => {
  const { events, updateEvent, fetchEvents } = useEventOperations(false, () => {});
  const { handleRecurringEdit } = useRecurringEventOperations(events, async () => {
    await fetchEvents();
  });

  const dragAndDropResult = useDragAndDrop({ events, updateEvent, handleRecurringEdit });

  return {
    ...dragAndDropResult,
    events,
  };
};

describe('useDragAndDrop - 일반 일정 드래그 앤 드롭', () => {
  it('일반 일정을 다른 날짜로 드래그 시 날짜가 변경되고 대화상자 없이 즉시 저장된다', async () => {
    // Arrange: 일반 일정이 있는 상태로 MSW 설정
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '일반 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '일반 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });

    // Wait for initial load
    await act(() => Promise.resolve());

    // Act: 일반 일정을 2025-10-16으로 드래그
    const mockEvent = createMockDragEndEvent('1', '2025-10-15', '2025-10-16');

    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    // Assert: 대화상자가 열리지 않고, 일정이 즉시 저장됨
    expect(result.current.isRecurringDialogOpen).toBe(false);
    expect(result.current.pendingDragEvent).toBe(null);
  });

  it('일정을 같은 날짜 셀로 드래그 시 아무 동작도 수행되지 않는다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '일반 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '일반 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });
    await act(() => Promise.resolve());

    // Act: 같은 날짜로 드래그
    const mockEvent = createMockDragEndEvent('1', '2025-10-15', '2025-10-15');

    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    // Assert: 아무 변화 없음
    expect(result.current.isRecurringDialogOpen).toBe(false);
    expect(result.current.pendingDragEvent).toBe(null);
  });

  it('드롭 대상이 유효하지 않은 경우 (over가 null) 아무 동작도 수행되지 않는다', async () => {
    setupMockHandlerUpdating();

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });
    await act(() => Promise.resolve());

    // Act: over가 null인 경우
    const mockEvent: DragEndEvent = {
      active: {
        id: 'event-1',
        data: { current: { eventId: '1', sourceDate: '2025-10-15' } },
      },
      over: null,
    };

    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    // Assert: 아무 동작 없음
    expect(result.current.isRecurringDialogOpen).toBe(false);
    expect(result.current.pendingDragEvent).toBe(null);
  });
});

describe('useDragAndDrop - 반복 일정 드래그 앤 드롭', () => {
  it('반복 일정을 다른 날짜로 드래그 시 확인 대화상자가 표시된다', async () => {
    // Arrange: 반복 일정 설정
    setupMockHandlerRecurringListUpdate([
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복 회의',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
    ]);

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });
    await act(() => Promise.resolve());

    // Act: 반복 일정을 다른 날짜로 드래그
    const mockEvent = createMockDragEndEvent('1', '2025-10-15', '2025-10-17');

    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    // Assert: 대화상자가 열리고 pendingDragEvent가 설정됨
    expect(result.current.isRecurringDialogOpen).toBe(true);
    expect(result.current.pendingDragEvent).not.toBe(null);
    expect(result.current.pendingDragEvent?.newDate).toBe('2025-10-17');
  });

  it('반복 일정 대화상자에서 "예" (단일 수정) 선택 시 해당 일정만 날짜가 변경된다', async () => {
    // Arrange
    setupMockHandlerRecurringListUpdate([
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
    ]);

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });
    await act(() => Promise.resolve());

    // 반복 일정 드래그
    const mockEvent = createMockDragEndEvent('1', '2025-10-15', '2025-10-17');
    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    expect(result.current.isRecurringDialogOpen).toBe(true);

    // Act: "예" 선택 (단일 수정)
    await act(async () => {
      await result.current.handleRecurringConfirm(true);
    });

    // Assert: 대화상자가 닫히고 pendingDragEvent가 초기화됨
    await waitFor(() => {
      expect(result.current.isRecurringDialogOpen).toBe(false);
    });
    expect(result.current.pendingDragEvent).toBe(null);
  });

  it('반복 일정 대화상자에서 "아니오" (전체 수정) 선택 시 모든 반복 일정의 날짜가 변경된다', async () => {
    // Arrange
    setupMockHandlerRecurringListUpdate([
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복 회의',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
    ]);

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });
    await act(() => Promise.resolve());

    const mockEvent = createMockDragEndEvent('1', '2025-10-15', '2025-10-17');
    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    // Act: "아니오" 선택 (전체 수정)
    await act(async () => {
      await result.current.handleRecurringConfirm(false);
    });

    // Assert: 대화상자가 닫히고 pendingDragEvent가 초기화됨
    await waitFor(() => {
      expect(result.current.isRecurringDialogOpen).toBe(false);
    });
    expect(result.current.pendingDragEvent).toBe(null);
  });

  it('반복 일정 대화상자에서 "취소" 선택 시 드래그 작업이 취소된다', async () => {
    // Arrange
    setupMockHandlerRecurringListUpdate([
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
    ]);

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });
    await act(() => Promise.resolve());

    const mockEvent = createMockDragEndEvent('1', '2025-10-15', '2025-10-17');
    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    expect(result.current.isRecurringDialogOpen).toBe(true);

    // Act: "취소" 선택
    act(() => {
      result.current.handleRecurringCancel();
    });

    // Assert: 대화상자가 닫히고 pendingDragEvent가 초기화됨 (일정은 변경되지 않음)
    expect(result.current.isRecurringDialogOpen).toBe(false);
    expect(result.current.pendingDragEvent).toBe(null);
  });
});

describe('useDragAndDrop - 버그 수정 검증: API 요청 메소드', () => {
  it('[TC-BUG-001] 일반 일정을 드래그 앤 드롭하면 PUT 요청이 전송된다', async () => {
    // Arrange: MSW 핸들러에서 요청 정보 캡처
    let capturedRequest: CapturedRequest | null = null;

    setupMockHandlerWithRequestCapture(
      [
        {
          id: '1',
          title: '일반 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '일반 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ],
      (request) => {
        capturedRequest = request;
      }
    );

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });
    await act(() => Promise.resolve());

    // Act: 일반 일정을 2025-10-16으로 드래그
    const mockEvent = createMockDragEndEvent('1', '2025-10-15', '2025-10-16');
    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    // Assert: PUT 요청이 전송되었는지 확인
    expect(capturedRequest).not.toBe(null);
    expect(capturedRequest!.method).toBe('PUT');
    expect(capturedRequest!.url).toContain('/api/events/1');

    // 요청 본문에 업데이트된 날짜가 포함되어 있는지 확인
    expect(capturedRequest!.body.date).toBe('2025-10-16');
    expect(capturedRequest!.body.id).toBe('1');
  });

  it('[TC-BUG-002] 일반 일정을 드래그 앤 드롭해도 일정이 중복 생성되지 않는다', async () => {
    // Arrange
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '일반 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '일반 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });

    // Wait for initial events to load
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    // 드래그 전 일정 개수 확인
    const eventsCountBefore = result.current.events.length;

    // Act: 일반 일정을 2025-10-16으로 드래그
    const mockEvent = createMockDragEndEvent('1', '2025-10-15', '2025-10-16');
    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    // Wait for events to be fetched
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    // Assert: 일정 개수가 증가하지 않았는지 확인 (1개 유지)
    const { events: eventsAfter } = result.current;
    expect(eventsAfter.length).toBe(eventsCountBefore);

    // 일정이 새 날짜로 이동했는지 확인 (중복이 아닌 이동)
    const movedEvent = eventsAfter.find((e) => e.id === '1');
    expect(movedEvent).toBeDefined();
    expect(movedEvent!.date).toBe('2025-10-16');

    // 원본 날짜에 같은 제목의 일정이 없는지 확인
    const eventsOnOriginalDate = eventsAfter.filter(
      (e) => e.date === '2025-10-15' && e.title === '일반 회의'
    );
    expect(eventsOnOriginalDate.length).toBe(0);
  });

  it('[TC-BUG-003] 일반 일정을 드래그 앤 드롭하면 원본 위치에서 일정이 사라진다', async () => {
    // Arrange
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '이동할 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '이동할 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '다른 회의',
        date: '2025-10-16',
        startTime: '11:00',
        endTime: '12:00',
        description: '다른 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { result } = renderHook(() => useTestDragAndDrop(), { wrapper });

    // Wait for initial events to load
    await waitFor(() => {
      expect(result.current.events.length).toBe(2);
    });

    // Act: id='1' 일정을 2025-10-15에서 2025-10-17로 드래그
    const mockEvent = createMockDragEndEvent('1', '2025-10-15', '2025-10-17');
    await act(async () => {
      await result.current.handleDragEnd(mockEvent);
    });

    await waitFor(() => {
      expect(result.current.events.length).toBe(2);
    });

    // Assert
    const { events } = result.current;

    // 1. 원본 날짜(2025-10-15)에 '이동할 회의'가 없는지 확인
    const eventsOnOriginalDate = events.filter((e) => e.date === '2025-10-15');
    expect(eventsOnOriginalDate.length).toBe(0);

    // 2. 새 날짜(2025-10-17)에 '이동할 회의'가 있는지 확인
    const eventsOnNewDate = events.filter((e) => e.date === '2025-10-17');
    expect(eventsOnNewDate.length).toBe(1);
    expect(eventsOnNewDate[0].id).toBe('1');
    expect(eventsOnNewDate[0].title).toBe('이동할 회의');

    // 3. 다른 일정(id='2')은 영향받지 않았는지 확인
    const otherEvent = events.find((e) => e.id === '2');
    expect(otherEvent).toBeDefined();
    expect(otherEvent!.date).toBe('2025-10-16');
  });
});
