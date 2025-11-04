# 테스트 설계: 드래그 앤 드롭 버그 수정

## 1. 테스트 설계 개요

### 1.1 테스트 목적
이 테스트 설계는 드래그 앤 드롭 기능의 버그를 검증하기 위한 것입니다:
- **버그**: 일정을 드래그 앤 드롭하면 POST 요청이 전송되어 일정이 중복 생성됨
- **기대 동작**: PUT 요청으로 기존 일정의 날짜만 업데이트 (중복 생성 없음)

### 1.2 테스트 범위
- **기존 7개 테스트 유지**: 드래그 앤 드롭 기본 동작 검증 (수정 없음)
- **새로운 테스트 추가**: 버그 검증을 위한 3개의 새로운 테스트 케이스

### 1.3 테스트 전략
- **MSW 요청 캡처 방식**: `setupMockHandlerUpdating`을 확장하여 API 요청 메소드(PUT/POST)와 URL을 검증
- **기존 패턴 재사용**: 현재 프로젝트의 MSW 핸들러 패턴 활용
- **최소한의 테스트**: 버그 검증에 필요한 핵심 시나리오만 테스트

## 2. 테스트 케이스 설계

### 2.1 기존 테스트 (유지 - 수정 없음)

**파일**: `/Users/seednpc10/dev/front_7th_chapter1-3/src/__tests__/hooks/medium.useDragAndDrop.spec.tsx`

**기존 7개 테스트**:
1. ✅ 일반 일정을 다른 날짜로 드래그 시 날짜가 변경되고 대화상자 없이 즉시 저장된다
2. ✅ 일정을 같은 날짜 셀로 드래그 시 아무 동작도 수행되지 않는다
3. ✅ 드롭 대상이 유효하지 않은 경우 (over가 null) 아무 동작도 수행되지 않는다
4. ✅ 반복 일정을 다른 날짜로 드래그 시 확인 대화상자가 표시된다
5. ✅ 반복 일정 대화상자에서 "예" (단일 수정) 선택 시 해당 일정만 날짜가 변경된다
6. ✅ 반복 일정 대화상자에서 "아니오" (전체 수정) 선택 시 모든 반복 일정의 날짜가 변경된다
7. ✅ 반복 일정 대화상자에서 "취소" 선택 시 드래그 작업이 취소된다

**상태**: 모든 테스트 통과 중 - 수정 없이 유지

---

### 2.2 새로운 테스트 케이스 (추가)

#### **TC-BUG-001: 일반 일정 드래그 시 PUT 요청 검증**

**목적**: 일반 일정을 드래그 앤 드롭하면 PUT 요청이 전송되는지 검증

**테스트 시나리오**:
```typescript
describe('useDragAndDrop - 버그 수정 검증: API 요청 메소드', () => {
  it('[TC-BUG-001] 일반 일정을 드래그 앤 드롭하면 PUT 요청이 전송된다', async () => {
    // Arrange: MSW 핸들러에서 요청 정보 캡처
    let capturedRequest: { method: string; url: string; body: any } | null = null;

    setupMockHandlerWithRequestCapture([
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
    ], (request) => {
      capturedRequest = request;
    });

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
});
```

**검증 포인트**:
- ✅ API 요청 메소드가 `PUT`임
- ✅ 요청 URL이 `/api/events/{eventId}` 형식임
- ✅ 요청 본문에 기존 이벤트 ID가 포함됨
- ✅ 요청 본문에 업데이트된 `date` 필드가 포함됨

---

#### **TC-BUG-002: 일정 중복 생성 방지 검증**

**목적**: 드래그 앤 드롭 후 일정이 중복 생성되지 않는지 검증

**테스트 시나리오**:
```typescript
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
  await act(() => Promise.resolve());

  // 드래그 전 일정 개수 확인
  const { events: eventsBefore } = result.current;
  const eventsCountBefore = eventsBefore.length;

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
  const movedEvent = eventsAfter.find(e => e.id === '1');
  expect(movedEvent).toBeDefined();
  expect(movedEvent!.date).toBe('2025-10-16');

  // 원본 날짜에 같은 제목의 일정이 없는지 확인
  const eventsOnOriginalDate = eventsAfter.filter(
    e => e.date === '2025-10-15' && e.title === '일반 회의'
  );
  expect(eventsOnOriginalDate.length).toBe(0);
});
```

**검증 포인트**:
- ✅ 드래그 앤 드롭 후 총 일정 개수가 증가하지 않음 (중복 생성 안 됨)
- ✅ 일정이 새 날짜로 이동함 (MOVE 동작)
- ✅ 원본 날짜에서 일정이 사라짐
- ✅ 새 날짜에 일정이 1개만 존재함

---

#### **TC-BUG-003: 원본 위치에서 일정 제거 검증**

**목적**: 드래그 앤 드롭 후 원본 위치에서 일정이 사라지는지 검증

**테스트 시나리오**:
```typescript
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
  await act(() => Promise.resolve());

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
  const eventsOnOriginalDate = events.filter(e => e.date === '2025-10-15');
  expect(eventsOnOriginalDate.length).toBe(0);

  // 2. 새 날짜(2025-10-17)에 '이동할 회의'가 있는지 확인
  const eventsOnNewDate = events.filter(e => e.date === '2025-10-17');
  expect(eventsOnNewDate.length).toBe(1);
  expect(eventsOnNewDate[0].id).toBe('1');
  expect(eventsOnNewDate[0].title).toBe('이동할 회의');

  // 3. 다른 일정(id='2')은 영향받지 않았는지 확인
  const otherEvent = events.find(e => e.id === '2');
  expect(otherEvent).toBeDefined();
  expect(otherEvent!.date).toBe('2025-10-16');
});
```

**검증 포인트**:
- ✅ 원본 날짜에서 드래그한 일정이 사라짐
- ✅ 새 날짜에 일정이 정확히 이동됨
- ✅ 다른 일정들은 영향받지 않음
- ✅ MOVE 동작 검증 (DELETE + ADD가 아님)

---

## 3. MSW 핸들러 확장

### 3.1 요청 캡처 핸들러 생성

**파일**: `/Users/seednpc10/dev/front_7th_chapter1-3/src/__mocks__/handlersUtils.ts`

**새로운 함수 추가**:
```typescript
export const setupMockHandlerWithRequestCapture = (
  initEvents: Event[],
  onRequestCapture: (request: { method: string; url: string; body: any }) => void
) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      // 요청 정보 캡처
      onRequestCapture({
        method: 'PUT',
        url: `/api/events/${id}`,
        body: updatedEvent,
      });

      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1);

      // 요청 정보 캡처
      onRequestCapture({
        method: 'POST',
        url: '/api/events',
        body: newEvent,
      });

      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};
```

**목적**:
- API 요청 메소드(PUT vs POST)를 캡처하여 테스트에서 검증 가능
- 기존 `setupMockHandlerUpdating` 패턴 재사용
- 요청 URL과 본문도 함께 캡처

---

## 4. 구현 수정 사항 (테스트가 검증할 내용)

### 4.1 `useEventOperations.ts` 수정

**파일**: `/Users/seednpc10/dev/front_7th_chapter1-3/src/hooks/useEventOperations.ts`

**현재 문제**:
- `saveEvent` 함수는 `editing` 파라미터로 PUT/POST를 결정
- `useDragAndDrop`에서 `saveEvent`를 호출할 때 항상 `editing: false` 상태
- 따라서 드래그 앤 드롭 시 항상 POST 요청 (새 일정 생성)

**수정 방안**:
```typescript
// 기존 코드 (Line 40-80)
const saveEvent = async (eventData: Event | EventForm) => {
  try {
    let response;

    // BEFORE: editing 파라미터로 판단
    if (editing) {
      // PUT 요청
    } else {
      // POST 요청
    }

    // ...
  }
};

// 수정 후 코드
const saveEvent = async (eventData: Event | EventForm) => {
  try {
    let response;

    // AFTER: 이벤트 ID 존재 여부로 판단
    const isEditing = 'id' in eventData && eventData.id;

    if (isEditing) {
      // PUT 요청 (기존 일정 업데이트)
      const editingEvent = {
        ...eventData,
        repeat: eventData.repeat ?? {
          type: 'none',
          interval: 0,
          endDate: '',
        },
      };

      response = await fetch(`/api/events/${(eventData as Event).id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvent),
      });
    } else {
      // POST 요청 (새 일정 생성)
      response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
    }

    if (!response.ok) {
      throw new Error('Failed to save event');
    }

    await fetchEvents();
    onSave?.();
    enqueueSnackbar(
      isEditing ? SUCCESS_MESSAGES.EVENT_UPDATED : SUCCESS_MESSAGES.EVENT_ADDED,
      { variant: 'success' }
    );
  } catch (error) {
    console.error('Error saving event:', error);
    enqueueSnackbar(ERROR_MESSAGES.SAVE_FAILED, { variant: 'error' });
  }
};
```

**기대 효과**:
- ✅ 기존 편집 모드 정상 작동 (이벤트에 id가 있으므로 PUT)
- ✅ 드래그 앤 드롭 정상 작동 (드래그한 이벤트에 id가 있으므로 PUT)
- ✅ 새 일정 추가 정상 작동 (id가 없으므로 POST)
- ✅ 모든 기존 테스트 통과 유지

---

## 5. 테스트 실행 계획

### 5.1 RED 단계 (현재)

**목표**: 새로운 테스트가 실패하는지 확인

**실행 명령어**:
```bash
yarn test src/__tests__/hooks/medium.useDragAndDrop.spec.tsx
```

**예상 결과**:
- ✅ 기존 7개 테스트: PASS
- ❌ TC-BUG-001: FAIL (POST 요청이 전송되어 실패)
- ❌ TC-BUG-002: FAIL (일정이 중복 생성되어 실패)
- ❌ TC-BUG-003: FAIL (원본 위치에서 일정이 사라지지 않아 실패)

---

### 5.2 GREEN 단계 (구현 후)

**목표**: `useEventOperations.ts` 수정 후 모든 테스트 통과

**실행 명령어**:
```bash
yarn test src/__tests__/hooks/medium.useDragAndDrop.spec.tsx
```

**예상 결과**:
- ✅ 모든 10개 테스트 PASS (기존 7개 + 새로운 3개)

---

## 6. 테스트 커버리지

### 6.1 기능 커버리지

| 기능 | 테스트 케이스 | 상태 |
|------|--------------|------|
| 일반 일정 드래그 앤 드롭 | TC-1 (기존) | ✅ 유지 |
| 같은 날짜로 드래그 | TC-2 (기존) | ✅ 유지 |
| 유효하지 않은 드롭 | TC-3 (기존) | ✅ 유지 |
| 반복 일정 드래그 다이얼로그 | TC-4 (기존) | ✅ 유지 |
| 반복 일정 단일 수정 | TC-5 (기존) | ✅ 유지 |
| 반복 일정 전체 수정 | TC-6 (기존) | ✅ 유지 |
| 반복 일정 드래그 취소 | TC-7 (기존) | ✅ 유지 |
| **PUT 요청 검증** | **TC-BUG-001 (신규)** | **🆕 추가** |
| **중복 생성 방지** | **TC-BUG-002 (신규)** | **🆕 추가** |
| **원본 제거 검증** | **TC-BUG-003 (신규)** | **🆕 추가** |

---

### 6.2 엣지 케이스 커버리지

| 엣지 케이스 | 커버 여부 | 테스트 케이스 |
|------------|----------|--------------|
| 같은 날짜로 드롭 | ✅ | TC-2 (기존) |
| 유효하지 않은 드롭 타겟 | ✅ | TC-3 (기존) |
| 반복 일정 처리 | ✅ | TC-4, TC-5, TC-6, TC-7 (기존) |
| PUT vs POST 요청 검증 | ✅ | TC-BUG-001 (신규) |
| 중복 생성 방지 | ✅ | TC-BUG-002 (신규) |
| MOVE 동작 (원본 제거) | ✅ | TC-BUG-003 (신규) |

---

## 7. 테스트 파일 구조

```
src/__tests__/hooks/medium.useDragAndDrop.spec.tsx
├─ describe: 'useDragAndDrop - 일반 일정 드래그 앤 드롭'
│  ├─ [TC-1] 일반 일정을 다른 날짜로 드래그 시 날짜가 변경되고 대화상자 없이 즉시 저장된다
│  ├─ [TC-2] 일정을 같은 날짜 셀로 드래그 시 아무 동작도 수행되지 않는다
│  └─ [TC-3] 드롭 대상이 유효하지 않은 경우 (over가 null) 아무 동작도 수행되지 않는다
│
├─ describe: 'useDragAndDrop - 반복 일정 드래그 앤 드롭'
│  ├─ [TC-4] 반복 일정을 다른 날짜로 드래그 시 확인 대화상자가 표시된다
│  ├─ [TC-5] 반복 일정 대화상자에서 "예" (단일 수정) 선택 시 해당 일정만 날짜가 변경된다
│  ├─ [TC-6] 반복 일정 대화상자에서 "아니오" (전체 수정) 선택 시 모든 반복 일정의 날짜가 변경된다
│  └─ [TC-7] 반복 일정 대화상자에서 "취소" 선택 시 드래그 작업이 취소된다
│
└─ describe: 'useDragAndDrop - 버그 수정 검증: API 요청 메소드' (신규)
   ├─ [TC-BUG-001] 일반 일정을 드래그 앤 드롭하면 PUT 요청이 전송된다
   ├─ [TC-BUG-002] 일반 일정을 드래그 앤 드롭해도 일정이 중복 생성되지 않는다
   └─ [TC-BUG-003] 일반 일정을 드래그 앤 드롭하면 원본 위치에서 일정이 사라진다
```

---

## 8. 테스트 작성 원칙

### 8.1 YAGNI 원칙 준수
- ✅ **명시된 버그만 테스트**: PUT/POST 요청, 중복 생성, 원본 제거
- ✅ **기존 테스트 유지**: 이미 통과하는 7개 테스트는 수정 없음
- ✅ **최소한의 새 테스트**: 버그 검증에 필요한 3개만 추가

### 8.2 기존 패턴 재사용
- ✅ MSW 핸들러 패턴 (`setupMockHandlerUpdating`)
- ✅ `renderHook` + `act` + `waitFor` 패턴
- ✅ `createMockDragEndEvent` 헬퍼 함수

### 8.3 명확한 검증
- ✅ API 요청 메소드 검증 (PUT vs POST)
- ✅ 일정 개수 검증 (중복 생성 여부)
- ✅ 날짜별 일정 존재 여부 검증 (MOVE 동작)

---

## 9. 성공 기준

### 9.1 RED 단계 성공 기준
- ❌ TC-BUG-001, TC-BUG-002, TC-BUG-003이 실패함
- ✅ 기존 7개 테스트는 통과함
- ✅ 실패 메시지가 예상된 이유와 일치함

### 9.2 GREEN 단계 성공 기준
- ✅ 모든 10개 테스트가 통과함
- ✅ `useEventOperations.ts`만 수정됨 (다른 파일 변경 없음)
- ✅ 드래그 앤 드롭 시 PUT 요청이 전송됨

### 9.3 REFACTOR 단계 성공 기준
- ✅ 모든 10개 테스트가 계속 통과함
- ✅ 코드 가독성 향상
- ✅ 기존 패턴과 일관성 유지

---

## 10. 관련 파일

### 10.1 테스트 파일
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/__tests__/hooks/medium.useDragAndDrop.spec.tsx` - 기존 + 신규 테스트

### 10.2 MSW 핸들러
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/__mocks__/handlersUtils.ts` - `setupMockHandlerWithRequestCapture` 추가

### 10.3 구현 파일 (수정 대상)
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/hooks/useEventOperations.ts` - `saveEvent` 함수 수정

### 10.4 참조 파일
- `/Users/seednpc10/dev/front_7th_chapter1-3/specs/drag-and-drop-event-rescheduling.md` - 원본 명세서
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/hooks/useDragAndDrop.ts` - 드래그 앤 드롭 훅
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/types.ts` - Event 타입 정의

---

## 11. 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025-11-04 | 초기 테스트 설계 작성 | test-design-strategist |

---

## 부록: 테스트 코드 스니펫

### A.1 요청 캡처 헬퍼

```typescript
// src/__mocks__/handlersUtils.ts에 추가
export const setupMockHandlerWithRequestCapture = (
  initEvents: Event[],
  onRequestCapture: (request: { method: string; url: string; body: any }) => void
) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      onRequestCapture({
        method: 'PUT',
        url: `/api/events/${id}`,
        body: updatedEvent,
      });

      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1);

      onRequestCapture({
        method: 'POST',
        url: '/api/events',
        body: newEvent,
      });

      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};
```

### A.2 테스트 코드 템플릿

```typescript
// src/__tests__/hooks/medium.useDragAndDrop.spec.tsx에 추가
describe('useDragAndDrop - 버그 수정 검증: API 요청 메소드', () => {
  it('[TC-BUG-001] 일반 일정을 드래그 앤 드롭하면 PUT 요청이 전송된다', async () => {
    // 테스트 코드는 위 섹션 2.2 참조
  });

  it('[TC-BUG-002] 일반 일정을 드래그 앤 드롭해도 일정이 중복 생성되지 않는다', async () => {
    // 테스트 코드는 위 섹션 2.2 참조
  });

  it('[TC-BUG-003] 일반 일정을 드래그 앤 드롭하면 원본 위치에서 일정이 사라진다', async () => {
    // 테스트 코드는 위 섹션 2.2 참조
  });
});
```
