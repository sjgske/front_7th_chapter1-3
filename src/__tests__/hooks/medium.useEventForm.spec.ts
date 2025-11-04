import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';

import { useEventForm } from '../../hooks/useEventForm';
import { Event } from '../../types';

describe('useEventForm - fillFormWithDate 기능', () => {
  it('fillFormWithDate 호출 시 date 필드가 전달된 날짜로 설정된다', () => {
    // Arrange
    const { result } = renderHook(() => useEventForm());

    // Act: fillFormWithDate 호출
    act(() => {
      result.current.fillFormWithDate('2025-10-20');
    });

    // Assert: date가 설정됨
    expect(result.current.date).toBe('2025-10-20');
  });

  it('fillFormWithDate 호출 시 다른 모든 폼 필드가 초기값으로 리셋된다', () => {
    // Arrange: 기존 데이터로 폼을 채움
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setTitle('기존 제목');
      result.current.setStartTime('09:00');
      result.current.setEndTime('10:00');
      result.current.setDescription('기존 설명');
      result.current.setLocation('기존 위치');
      result.current.setCategory('개인');
    });

    // Act: fillFormWithDate 호출
    act(() => {
      result.current.fillFormWithDate('2025-10-25');
    });

    // Assert: date만 설정되고 나머지는 초기값
    expect(result.current.date).toBe('2025-10-25');
    expect(result.current.title).toBe('');
    expect(result.current.startTime).toBe('09:00');
    expect(result.current.endTime).toBe('10:00');
    expect(result.current.description).toBe('');
    expect(result.current.location).toBe('');
    expect(result.current.category).toBe('업무');
  });

  it('fillFormWithDate 호출 시 editingEvent가 null로 설정된다', () => {
    // Arrange: editingEvent가 있는 상태
    const mockEvent: Event = {
      id: '1',
      title: '편집 중인 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.editEvent(mockEvent);
    });

    expect(result.current.editingEvent).not.toBe(null);

    // Act: fillFormWithDate 호출
    act(() => {
      result.current.fillFormWithDate('2025-10-20');
    });

    // Assert: editingEvent가 null로 초기화됨
    expect(result.current.editingEvent).toBe(null);
  });

  it('fillFormWithDate 호출 시 반복 일정 관련 필드가 초기값으로 리셋된다', () => {
    // Arrange: 반복 일정 설정
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setIsRepeating(true);
      result.current.setRepeatType('daily');
      result.current.setRepeatInterval(3);
      result.current.setRepeatEndDate('2025-10-30');
    });

    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('daily');

    // Act: fillFormWithDate 호출
    act(() => {
      result.current.fillFormWithDate('2025-10-18');
    });

    // Assert: 반복 일정 필드가 초기값으로 리셋
    expect(result.current.date).toBe('2025-10-18');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.repeatEndDate).toBe('');
  });

  it('fillFormWithDate 호출 시 알림 시간이 기본값(10분)으로 리셋된다', () => {
    // Arrange: 알림 시간을 변경
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setNotificationTime(30);
    });

    expect(result.current.notificationTime).toBe(30);

    // Act: fillFormWithDate 호출
    act(() => {
      result.current.fillFormWithDate('2025-10-22');
    });

    // Assert: notificationTime이 기본값 10으로 리셋
    expect(result.current.notificationTime).toBe(10);
    expect(result.current.date).toBe('2025-10-22');
  });

  it('fillFormWithDate 호출 시 시간 에러 상태가 초기화된다', () => {
    // Arrange: 시간 에러 발생 상태
    const { result } = renderHook(() => useEventForm());

    act(() => {
      // 잘못된 시간 입력으로 에러 발생 (종료 시간이 시작 시간보다 빠름)
      result.current.handleStartTimeChange({
        target: { value: '10:00' },
      } as ChangeEvent<HTMLInputElement>);
      result.current.handleEndTimeChange({
        target: { value: '09:00' },
      } as ChangeEvent<HTMLInputElement>);
    });

    // // 에러 상태가 있는지 확인 (시작/종료 시간 검증에 따라 에러 발생 가능)
    // const hasError = result.current.startTimeError !== null || result.current.endTimeError !== null;

    // Act: fillFormWithDate 호출
    act(() => {
      result.current.fillFormWithDate('2025-10-23');
    });

    // Assert: 시간 필드가 리셋되어 에러도 사라짐
    expect(result.current.startTime).toBe('09:00');
    expect(result.current.endTime).toBe('10:00');
    expect(result.current.startTimeError).toBe(null);
    expect(result.current.endTimeError).toBe(null);
  });
});
