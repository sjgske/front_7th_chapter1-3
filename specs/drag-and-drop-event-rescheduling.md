# 기능 명세: 드래그 앤 드롭 일정 재조정

## 1. 기능 개요

사용자가 캘린더의 주간 뷰 및 월간 뷰에서 일정 박스를 드래그하여 다른 날짜로 이동할 수 있는 기능입니다. 일정을 드래그하여 새로운 날짜 셀에 드롭하면 일정의 날짜만 변경되고 시간은 유지됩니다.

## 2. 사용자 스토리

### 기본 시나리오
- **US-1**: 사용자로서, 주간 뷰의 일정 박스를 드래그하여 같은 뷰 내의 다른 날짜로 이동하고 싶습니다.
- **US-2**: 사용자로서, 월간 뷰의 일정 박스를 드래그하여 같은 뷰 내의 다른 날짜로 이동하고 싶습니다.
- **US-3**: 사용자로서, 드래그 중에 원본 일정이 반투명하게 표시되어 어떤 일정을 이동 중인지 알고 싶습니다.
- **US-4**: 사용자로서, 일정을 드롭한 후 즉시 서버에 저장되기를 원합니다.

### 반복 일정 시나리오
- **US-5**: 사용자로서, 반복 일정을 드래그하여 드롭할 때 "이 일정만" 또는 "모든 일정"을 변경할지 선택하고 싶습니다.

### 에러 시나리오
- **US-6**: 사용자로서, 일정 저장에 실패하면 이동이 취소되고 원래 위치로 돌아가기를 원합니다.

## 3. 기능 요구사항

### 3.1 드래그 소스 (Drag Source)
- **FR-1.1**: 주간 뷰의 일정 박스는 드래그 가능해야 합니다
  - 위치: `App.tsx` > `renderWeekView()` > 일정 박스 (`Box` 컴포넌트)
  - 현재 라인: 335-362
- **FR-1.2**: 월간 뷰의 일정 박스는 드래그 가능해야 합니다
  - 위치: `App.tsx` > `renderMonthView()` > 일정 박스 (`Box` 컴포넌트)
  - 현재 라인: 427-464
- **FR-1.3**: 드래그 가능한 일정 박스는 마우스 커서가 올라갔을 때 시각적 피드백을 제공해야 합니다 (예: cursor: 'grab')

### 3.2 드롭 타겟 (Drop Target)
- **FR-2.1**: 주간 뷰의 모든 날짜 셀(TableCell)은 드롭 가능한 영역이어야 합니다
  - 위치: `App.tsx` > `renderWeekView()` > `TableCell`
  - 현재 라인: 312-326
- **FR-2.2**: 월간 뷰의 모든 날짜 셀(TableCell)은 드롭 가능한 영역이어야 합니다
  - 위치: `App.tsx` > `renderMonthView()` > `TableCell`
  - 현재 라인: 400-421
- **FR-2.3**: 드롭 가능한 영역 위로 일정을 드래그할 때 시각적 피드백을 제공해야 합니다 (예: 배경색 변경)

### 3.3 날짜 및 시간 처리
- **FR-3.1**: 일정을 새로운 날짜 셀에 드롭하면 **기존 일정의 `date` 필드만 업데이트**되어야 합니다
  - **중요**: 새로운 일정을 생성하는 것이 아니라, 기존 일정 ID를 유지하면서 날짜만 변경합니다
  - 동작: UPDATE (not DELETE + ADD)
  - 원본 일정은 삭제되고 새 위치에만 일정이 나타나야 합니다 (MOVE 동작)
- **FR-3.2**: `startTime`과 `endTime`은 원본 값 그대로 유지되어야 합니다
- **FR-3.3**: 드롭된 날짜는 해당 셀의 날짜를 기반으로 `YYYY-MM-DD` 형식으로 계산되어야 합니다
- **FR-3.4**: 드래그 앤 드롭은 **MOVE 동작**입니다
  - 원본 위치에서 일정이 사라지고 새 위치에 나타나야 합니다
  - 일정의 ID는 변경되지 않습니다
  - UI에는 한 개의 일정만 표시되어야 합니다 (중복 생성 금지)

### 3.4 시각적 피드백
- **FR-4.1**: 드래그 프리뷰는 원본 일정 박스와 동일한 모양이어야 합니다
- **FR-4.2**: 드래그 프리뷰는 불투명도(opacity)로만 구분되어야 합니다 (권장: opacity: 0.7)
- **FR-4.3**: 드래그 중인 원본 일정 박스는 감소된 불투명도로 표시되어야 합니다 (권장: opacity: 0.3)
- **FR-4.4**: 드롭 가능한 영역 위로 일정을 드래그할 때 배경색이 변경되어야 합니다 (권장: backgroundColor: '#e3f2fd')

### 3.5 반복 일정 처리
- **FR-5.1**: 반복 일정을 드래그하는 동안에는 일반 일정처럼 처리되어야 합니다
- **FR-5.2**: 반복 일정을 드롭한 후, 기존 `RecurringEventDialog` 컴포넌트를 사용하여 다이얼로그를 표시해야 합니다
- **FR-5.3**: 다이얼로그는 "해당 일정만 수정하시겠어요?" 메시지를 표시해야 합니다 (mode='edit')
- **FR-5.4**: 사용자가 "예"를 선택하면 해당 일정만 날짜가 변경되어야 합니다
- **FR-5.5**: 사용자가 "아니오"를 선택하면 모든 반복 일정의 날짜가 변경되어야 합니다
- **FR-5.6**: 사용자가 "취소"를 선택하면 드롭이 취소되고 일정은 원래 위치로 돌아가야 합니다

### 3.6 저장 동작
- **FR-6.1**: 일정을 드롭한 후 **기존 일정 ID를 사용하여 PUT 요청**으로 서버에 저장해야 합니다
  - API: `PUT /api/events/{eventId}`
  - Body: 기존 이벤트의 모든 필드 + 업데이트된 `date` 필드
  - **중요**: `saveEvent` 함수 호출 시 반드시 기존 일정 객체를 전달하여 `editing: true` 상태로 동작해야 합니다
  - POST 요청을 보내면 안 됩니다 (새 일정 생성이 아닌 기존 일정 수정)
- **FR-6.2**: 저장 방식은 "confirm then update" 방식을 사용해야 합니다 (optimistic update 사용 안 함)
- **FR-6.3**: 저장 성공 시 `useEventOperations`의 `fetchEvents()`를 호출하여 최신 데이터를 가져와야 합니다
- **FR-6.4**: 저장 성공 시 "일정이 수정되었습니다" 스낵바 메시지를 표시해야 합니다

### 3.7 에러 처리
- **FR-7.1**: 서버 저장에 실패하면 일정을 원래 위치로 롤백해야 합니다
- **FR-7.2**: 저장 실패 시 "일정 저장 실패" 에러 스낵바를 표시해야 합니다
- **FR-7.3**: 네트워크 에러 시에도 동일한 롤백 및 에러 표시 동작을 수행해야 합니다

### 3.8 충돌 처리
- **FR-8.1**: 일정 충돌 검사는 기존 동작을 따릅니다 (별도 처리 없음)
- **FR-8.2**: `findOverlappingEvents` 유틸리티가 충돌을 감지하면 기존 오버랩 다이얼로그를 표시할 수 있습니다

### 3.9 접근성 및 기타
- **FR-9.1**: 키보드 지원은 필요하지 않습니다
- **FR-9.2**: 모바일/터치 지원은 필요하지 않습니다
- **FR-9.3**: 드래그 앤 드롭은 마우스 인터랙션에만 대응합니다

## 4. 기술 요구사항

### 4.1 라이브러리 선택
- **TR-1.1**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` 사용 (dnd-kit 선호)
  - 대안: `react-dnd` 및 `react-dnd-html5-backend`
- **TR-1.2**: yarn을 사용하여 라이브러리 설치
  ```bash
  yarn add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  ```

### 4.2 컴포넌트 변경사항

#### 4.2.1 App.tsx 수정
- **TR-2.1**: dnd-kit의 `DndContext`, `useDraggable`, `useDroppable` 훅 import
- **TR-2.2**: 드래그 상태를 관리할 상태 변수 추가
  ```typescript
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [pendingDragEvent, setPendingDragEvent] = useState<{event: Event, newDate: string} | null>(null);
  ```
- **TR-2.3**: `renderWeekView()`와 `renderMonthView()`의 일정 박스를 `useDraggable` 훅으로 래핑
- **TR-2.4**: 날짜 셀을 `useDroppable` 훅으로 래핑
- **TR-2.5**: `DndContext`의 `onDragEnd` 이벤트 핸들러 구현

#### 4.2.2 새로운 훅: useDragAndDrop (선택사항)
- **TR-3.1**: 드래그 앤 드롭 로직을 별도 커스텀 훅으로 분리 가능
- **TR-3.2**: 위치: `src/hooks/useDragAndDrop.ts`
- **TR-3.3**: 반환값:
  ```typescript
  type UseDragAndDropReturn = {
    handleDragEnd: (event: DragEndEvent) => void;
    draggedEventId: string | null;
    isDragging: boolean;
  }
  ```

### 4.3 타입 정의
- **TR-4.1**: 모든 새로운 타입은 `type` 키워드를 사용하여 정의해야 합니다 (interface 사용 금지)
- **TR-4.2**: 드래그 앤 드롭 관련 타입 예시:
  ```typescript
  type DragData = {
    eventId: string;
    sourceDate: string;
  }

  type DropData = {
    targetDate: string;
  }
  ```

### 4.4 통합 지점

#### 4.4.1 useEventOperations 훅과의 통합
- **TR-5.1**: 드롭 후 `saveEvent()` 함수를 사용하여 일정 저장
- **TR-5.2**: 저장 성공/실패 시 기존 스낵바 시스템 활용

#### 4.4.2 useRecurringEventOperations 훅과의 통합
- **TR-6.1**: 반복 일정 드롭 시 `handleRecurringEdit()` 함수 사용
- **TR-6.2**: `RecurringEventDialog` 컴포넌트를 재사용하여 "단일/전체" 선택 다이얼로그 표시

#### 4.4.3 이벤트 필터링과의 통합
- **TR-7.1**: 드래그 가능한 일정 목록은 `filteredEvents`를 기반으로 해야 합니다
- **TR-7.2**: 검색 필터가 적용된 경우에도 드래그 앤 드롭이 정상 작동해야 합니다

## 5. 엣지 케이스

### 5.1 데이터 무결성
- **EC-1.1**: 존재하지 않는 일정 ID를 드롭하려는 경우 무시
- **EC-1.2**: 같은 날짜로 드롭하는 경우 아무 동작도 하지 않음
- **EC-1.3**: 날짜가 없는 셀(월간 뷰의 빈 셀)로 드롭하는 경우 무시

### 5.2 동시성 문제
- **EC-2.1**: 다른 사용자가 동시에 같은 일정을 수정하는 경우, 마지막 저장이 우선됨
- **EC-2.2**: 드래그 중에 다른 사용자가 해당 일정을 삭제한 경우, 저장 실패 처리

### 5.3 네트워크 문제
- **EC-3.1**: 네트워크 연결 끊김 시 저장 실패로 처리하고 롤백
- **EC-3.2**: 서버 응답 지연 시 로딩 인디케이터 표시 (선택사항)

### 5.4 UI 상태
- **EC-4.1**: 편집 모드(editingEvent가 존재)에서도 드래그 앤 드롭 가능
- **EC-4.2**: 알림이 울린 일정도 드래그 가능
- **EC-4.3**: 드래그 중에 뷰를 전환하려는 경우 드래그 취소

### 5.5 반복 일정 특수 케이스
- **EC-5.1**: 반복 종료일을 넘어서는 날짜로 드롭하는 경우 경고 표시 (선택사항)
- **EC-5.2**: "모든 일정" 수정 시 과거 일정도 변경되는지 확인

## 6. UI/UX 요구사항

### 6.1 시각적 피드백

#### 6.1.1 드래그 시작
- **UX-1.1**: 마우스 커서가 일정 박스 위에 있을 때: `cursor: grab`
- **UX-1.2**: 드래그 시작 시: `cursor: grabbing`
- **UX-1.3**: 원본 일정 박스: `opacity: 0.3`

#### 6.1.2 드래그 중
- **UX-2.1**: 드래그 프리뷰:
  - 원본과 동일한 크기 및 스타일
  - `opacity: 0.7`
  - 박스 그림자 추가 (선택사항): `boxShadow: '0 4px 8px rgba(0,0,0,0.2)'`

#### 6.1.3 드롭 타겟 호버
- **UX-3.1**: 드래그 중인 일정이 유효한 드롭 영역 위에 있을 때:
  - 배경색: `backgroundColor: '#e3f2fd'`
  - 테두리: `border: '2px dashed #1976d2'` (선택사항)

#### 6.1.4 드롭 후
- **UX-4.1**: 드롭 성공 시 일정이 새 위치에 즉시 나타남 (서버 확인 후)
- **UX-4.2**: 드롭 실패 시 일정이 원래 위치로 애니메이션과 함께 돌아감 (선택사항)

### 6.2 반복 일정 다이얼로그
- **UX-5.1**: 기존 `RecurringEventDialog` 컴포넌트 재사용
- **UX-5.2**: 다이얼로그 제목: "반복 일정 수정"
- **UX-5.3**: 메시지: "해당 일정만 수정하시겠어요?"
- **UX-5.4**: 버튼:
  - "취소": 드롭 취소
  - "아니오": 모든 반복 일정 수정
  - "예": 이 일정만 수정

### 6.3 스낵바 메시지
- **UX-6.1**: 저장 성공: "일정이 수정되었습니다" (variant: 'success')
- **UX-6.2**: 저장 실패: "일정 저장 실패" (variant: 'error')

### 6.4 접근성
- **UX-7.1**: 드래그 가능한 일정에 `role="button"` 및 `aria-grabbed` 속성 추가 (선택사항)
- **UX-7.2**: 드롭 가능한 영역에 `aria-dropeffect="move"` 속성 추가 (선택사항)

## 7. 수락 기준 (Acceptance Criteria)

### 7.1 기본 기능
- **AC-1.1**: ✅ 주간 뷰에서 일정을 드래그하여 다른 날짜로 이동할 수 있다
- **AC-1.2**: ✅ 월간 뷰에서 일정을 드래그하여 다른 날짜로 이동할 수 있다
- **AC-1.3**: ✅ 드래그 시 원본 일정이 반투명(opacity: 0.3)으로 표시된다
- **AC-1.4**: ✅ 드래그 프리뷰가 원본과 동일한 모양이며 불투명도만 다르다(opacity: 0.7)
- **AC-1.5**: ✅ 드롭 가능한 영역 위로 드래그 시 배경색이 변경된다

### 7.2 날짜 및 시간 처리
- **AC-2.1**: ✅ 일정을 새 날짜로 드롭하면 `date` 필드만 변경된다
- **AC-2.2**: ✅ `startTime`과 `endTime`은 드롭 후에도 원본 값을 유지한다
- **AC-2.3**: ✅ 새 날짜는 YYYY-MM-DD 형식으로 정확하게 계산된다

### 7.3 반복 일정
- **AC-3.1**: ✅ 반복 일정을 드롭하면 다이얼로그가 표시된다
- **AC-3.2**: ✅ "예" 선택 시 해당 일정만 날짜가 변경된다
- **AC-3.3**: ✅ "아니오" 선택 시 모든 반복 일정의 날짜가 변경된다
- **AC-3.4**: ✅ "취소" 선택 시 드롭이 취소되고 일정은 원래 위치에 유지된다

### 7.4 저장 및 에러 처리
- **AC-4.1**: ✅ 드롭 후 즉시 서버에 저장 요청을 보낸다
- **AC-4.2**: ✅ 저장 성공 시 "일정이 수정되었습니다" 스낵바가 표시된다
- **AC-4.3**: ✅ 저장 실패 시 일정이 원래 위치로 돌아간다
- **AC-4.4**: ✅ 저장 실패 시 "일정 저장 실패" 에러 스낵바가 표시된다

### 7.5 엣지 케이스
- **AC-5.1**: ✅ 같은 날짜로 드롭하면 아무 동작도 하지 않는다
- **AC-5.2**: ✅ 빈 셀(날짜 없음)로 드롭하면 무시된다
- **AC-5.3**: ✅ 검색 필터가 적용된 상태에서도 드래그 앤 드롭이 정상 작동한다

### 7.6 UI/UX
- **AC-6.1**: ✅ 마우스 커서가 일정 위에 있을 때 `grab` 커서가 표시된다
- **AC-6.2**: ✅ 드래그 시작 시 `grabbing` 커서가 표시된다
- **AC-6.3**: ✅ 드롭 가능한 영역 위로 드래그 시 시각적 피드백이 제공된다

## 8. 구현 참고사항

### 8.1 코딩 표준 준수 (필수)
- **IN-1.1**: 모든 새로운 타입은 `type` 키워드를 사용하여 정의
- **IN-1.2**: 패키지 설치 시 `yarn` 사용 (npm 사용 금지)
- **IN-1.3**: React Context 생성 시 `@basiln/utils`의 `createContext` 사용 (필요한 경우)

### 8.2 드래그 앤 드롭 구현 가이드

#### 8.2.1 dnd-kit 기본 구조
```typescript
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

// App 컴포넌트 최상위에 DndContext 추가
<DndContext onDragEnd={handleDragEnd}>
  {/* 기존 컴포넌트 */}
</DndContext>

// 드래그 가능한 일정 박스
const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
  id: event.id,
  data: { eventId: event.id, sourceDate: event.date }
});

// 드롭 가능한 날짜 셀
const { setNodeRef, isOver } = useDroppable({
  id: `cell-${dateString}`,
  data: { targetDate: dateString }
});
```

#### 8.2.2 onDragEnd 핸들러 예시
```typescript
const handleDragEnd = async (dragEvent: DragEndEvent) => {
  const { active, over } = dragEvent;

  if (!over) return; // 유효한 드롭 타겟 없음

  const dragData = active.data.current as DragData;
  const dropData = over.data.current as DropData;

  if (dragData.sourceDate === dropData.targetDate) return; // 같은 날짜

  const eventToMove = events.find(e => e.id === dragData.eventId);
  if (!eventToMove) return;

  // 반복 일정 처리
  if (isRecurringEvent(eventToMove)) {
    setPendingDragEvent({ event: eventToMove, newDate: dropData.targetDate });
    setRecurringDialogMode('edit');
    setIsRecurringDialogOpen(true);
    return;
  }

  // 일반 일정 저장
  await saveEventWithNewDate(eventToMove, dropData.targetDate);
};
```

#### 8.2.3 서버 저장 로직
```typescript
const saveEventWithNewDate = async (event: Event, newDate: string) => {
  const updatedEvent = {
    ...event,
    date: newDate,
    // startTime, endTime은 변경 없음
  };

  try {
    await saveEvent(updatedEvent);
    // 성공 시 fetchEvents()가 자동 호출됨 (useEventOperations 내부)
  } catch (error) {
    // 실패 시 롤백은 자동 (fetchEvents로 원본 데이터 유지)
    console.error('Failed to save dragged event:', error);
  }
};
```

### 8.3 반복 일정 다이얼로그 통합
```typescript
// 다이얼로그 확인 핸들러에 드래그 케이스 추가
const handleRecurringConfirm = async (editSingleOnly: boolean) => {
  if (recurringDialogMode === 'edit' && pendingDragEvent) {
    const { event, newDate } = pendingDragEvent;
    const updatedEvent = { ...event, date: newDate };

    await handleRecurringEdit(updatedEvent, editSingleOnly);

    setIsRecurringDialogOpen(false);
    setPendingDragEvent(null);
  }
  // ... 기존 로직
};
```

### 8.4 스타일링 가이드
```typescript
// 드래그 중 원본 일정 스타일
sx={{
  ...eventBoxStyles.common,
  ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
  opacity: isDragging ? 0.3 : 1,
  cursor: 'grab',
  '&:active': { cursor: 'grabbing' }
}}

// 드롭 가능한 셀 스타일
sx={{
  height: '120px',
  verticalAlign: 'top',
  width: '14.28%',
  padding: 1,
  border: '1px solid #e0e0e0',
  overflow: 'hidden',
  backgroundColor: isOver ? '#e3f2fd' : 'transparent',
  transition: 'background-color 0.2s'
}}
```

### 8.5 테스트 고려사항
- **IN-5.1**: 드래그 앤 드롭 동작은 `@testing-library/user-event`로는 테스트 어려움
- **IN-5.2**: dnd-kit의 이벤트를 직접 시뮬레이션하여 테스트
- **IN-5.3**: `handleDragEnd` 함수를 별도로 분리하여 유닛 테스트 작성 권장

### 8.6 성능 최적화 (선택사항)
- **IN-6.1**: 드래그 중에 불필요한 리렌더링 방지를 위해 `React.memo` 사용 고려
- **IN-6.2**: 많은 일정이 있는 경우 가상 스크롤링 고려 (향후 개선)

## 9. 관련 파일

### 9.1 수정이 필요한 파일
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/App.tsx` - 드래그 앤 드롭 로직 추가
- `/Users/seednpc10/dev/front_7th_chapter1-3/package.json` - dnd-kit 라이브러리 추가

### 9.2 참조해야 할 기존 파일
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/hooks/useEventOperations.ts` - saveEvent 함수
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/hooks/useRecurringEventOperations.ts` - handleRecurringEdit 함수
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/components/RecurringEventDialog.tsx` - 다이얼로그 컴포넌트
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/types.ts` - Event 타입 정의

### 9.3 새로 생성할 파일 (선택사항)
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/hooks/useDragAndDrop.ts` - 드래그 앤 드롭 로직 분리
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/utils/dragAndDropUtils.ts` - 유틸리티 함수

## 10. 구현 우선순위

### Phase 1: 기본 드래그 앤 드롭 (필수)
1. dnd-kit 라이브러리 설치
2. DndContext 설정
3. 일정 박스를 draggable로 만들기
4. 날짜 셀을 droppable로 만들기
5. onDragEnd 핸들러 구현
6. 서버 저장 로직 연결

### Phase 2: 시각적 피드백 (필수)
1. 드래그 프리뷰 스타일링
2. 원본 일정 opacity 조정
3. 드롭 타겟 hover 스타일
4. 커서 변경

### Phase 3: 반복 일정 지원 (필수)
1. 반복 일정 감지
2. RecurringEventDialog 통합
3. 단일/전체 수정 로직

### Phase 4: 에러 처리 (필수)
1. 저장 실패 시 롤백
2. 스낵바 메시지 표시
3. 네트워크 에러 처리

### Phase 5: 엣지 케이스 및 최적화 (선택사항)
1. 엣지 케이스 처리
2. 성능 최적화
3. 추가 UX 개선

## 11. 명세서 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025-11-03 | 초기 명세서 작성 | spec-writer |
