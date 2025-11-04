# 기능 명세: 클릭으로 일정 생성

## 1. 기능 개요

사용자가 캘린더의 주간 뷰 또는 월간 뷰에서 날짜 셀을 클릭하면, 해당 날짜와 기본 시간(09:00-10:00)이 자동으로 입력된 일정 폼이 활성화되고 제목 입력 필드로 포커스가 이동하는 기능입니다.

## 2. 사용자 스토리

### 기본 시나리오
- **US-1**: 사용자로서, 주간 뷰의 특정 날짜 셀을 클릭하여 해당 날짜로 새 일정을 빠르게 생성하고 싶습니다.
- **US-2**: 사용자로서, 월간 뷰의 특정 날짜 셀을 클릭하여 해당 날짜로 새 일정을 빠르게 생성하고 싶습니다.
- **US-3**: 사용자로서, 날짜 셀을 클릭하면 자동으로 제목 입력 필드로 포커스가 이동하여 바로 타이핑을 시작하고 싶습니다.
- **US-4**: 사용자로서, 클릭으로 설정된 기본 시간(09:00-10:00)을 필요에 따라 변경할 수 있어야 합니다.

### 폼 덮어쓰기 시나리오
- **US-5**: 사용자로서, 폼에 입력 중이던 데이터가 있어도 다른 날짜 셀을 클릭하면 새로운 날짜와 시간으로 덮어써지길 원합니다.
- **US-6**: 사용자로서, 일정 편집 중에 날짜 셀을 클릭하면 편집이 취소되고 새 일정 생성 모드로 전환되길 원합니다.

### 저장 시나리오
- **US-7**: 사용자로서, 날짜 셀을 클릭한 후 자동으로 저장되지 않고 "일정 추가" 버튼을 눌러야만 저장되길 원합니다.

## 3. 기능 요구사항

### 3.1 클릭 타겟
- **FR-1.1**: 주간 뷰의 모든 날짜 셀(TableCell)은 클릭 가능해야 합니다
  - 위치: `App.tsx` > `renderWeekView()` > `TableCell`
  - 현재 라인: 312-326
  - 일정이 있는 셀도 클릭 가능해야 합니다 (단, 일정 박스는 제외)
- **FR-1.2**: 월간 뷰의 모든 날짜 셀(TableCell)은 클릭 가능해야 합니다
  - 위치: `App.tsx` > `renderMonthView()` > `TableCell`
  - 현재 라인: 400-421
  - 일정이 있는 셀도 클릭 가능해야 합니다 (단, 일정 박스는 제외)
- **FR-1.3**: 날짜가 없는 빈 셀(월간 뷰)은 클릭해도 아무 동작도 하지 않아야 합니다

### 3.2 폼 동작
- **FR-2.1**: 날짜 셀 클릭 시 `date` 필드가 클릭한 날짜로 즉시 채워져야 합니다
  - 날짜 형식: `YYYY-MM-DD`
- **FR-2.2**: 날짜 셀 클릭 시 `startTime` 필드가 `09:00`으로 자동 설정되어야 합니다
- **FR-2.3**: 날짜 셀 클릭 시 `endTime` 필드가 `10:00`으로 자동 설정되어야 합니다
- **FR-2.4**: 사용자는 자동 설정된 시간을 수동으로 변경할 수 있어야 합니다
- **FR-2.5**: 제목 입력 필드(`#title`)로 포커스가 자동으로 이동해야 합니다

### 3.3 폼 덮어쓰기 동작
- **FR-3.1**: 폼에 기존 데이터가 있어도 날짜 셀을 클릭하면 새 날짜와 시간으로 덮어써야 합니다
- **FR-3.2**: 일정 편집 모드(editingEvent가 존재)에서 날짜 셀을 클릭하면:
  - `editingEvent`를 `null`로 설정하여 편집 모드 종료
  - 폼을 새 일정 생성 모드로 전환
  - 클릭한 날짜와 기본 시간으로 폼 업데이트
- **FR-3.3**: 제목, 설명, 위치 등 다른 필드는 초기화되어야 합니다 (빈 문자열)
- **FR-3.4**: 카테고리는 기본값인 '업무'로 설정되어야 합니다
- **FR-3.5**: 알림 시간은 기본값인 10분으로 설정되어야 합니다

### 3.4 저장 동작
- **FR-4.1**: 날짜 셀 클릭은 폼만 채우고 자동 저장하지 않습니다
- **FR-4.2**: 사용자가 "일정 추가" 버튼을 클릭해야만 일정이 저장됩니다
- **FR-4.3**: 저장 로직은 기존 `addOrUpdateEvent()` 함수를 그대로 사용합니다

### 3.5 이벤트 전파
- **FR-5.1**: 날짜 셀 내부의 일정 박스를 클릭하면 일정 박스의 기능(편집/삭제)이 우선되어야 합니다
- **FR-5.2**: 날짜 셀의 빈 영역을 클릭해야만 새 일정 생성 기능이 동작해야 합니다
- **FR-5.3**: 이벤트 전파를 제어하기 위해 일정 박스에 `onClick` 핸들러와 `stopPropagation()` 사용

### 3.6 뷰 지원
- **FR-6.1**: 주간 뷰(week)와 월간 뷰(month) 모두에서 동작해야 합니다
- **FR-6.2**: 뷰를 전환해도 기능이 일관되게 동작해야 합니다

## 4. 기술 요구사항

### 4.1 컴포넌트 변경사항

#### 4.1.1 App.tsx 수정
- **TR-1.1**: 날짜 셀 클릭 핸들러 함수 추가
  ```typescript
  const handleDateCellClick = (dateString: string) => {
    // 편집 모드 종료
    if (editingEvent) {
      setEditingEvent(null);
    }

    // 폼 필드 설정
    setDate(dateString);
    setStartTime('09:00');
    setEndTime('10:00');

    // 다른 필드 초기화
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('업무');
    setNotificationTime(10);
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');

    // 제목 필드로 포커스 이동
    setTimeout(() => {
      document.getElementById('title')?.focus();
    }, 0);
  };
  ```

- **TR-1.2**: `renderWeekView()` 수정
  - 각 날짜 셀의 `TableCell`에 `onClick` 핸들러 추가
  - 날짜를 `formatDate()` 또는 유사 함수로 YYYY-MM-DD 형식으로 변환
  - 커서 스타일 추가: `cursor: 'pointer'`

- **TR-1.3**: `renderMonthView()` 수정
  - 각 날짜 셀의 `TableCell`에 `onClick` 핸들러 추가
  - 날짜가 있는 셀만 클릭 가능하도록 조건 확인 (`day` 변수)
  - 커서 스타일 추가: `cursor: 'pointer'`

- **TR-1.4**: 일정 박스 클릭 이벤트 전파 방지
  ```typescript
  <Box
    onClick={(e) => e.stopPropagation()}
    // ... 기존 props
  >
  ```

#### 4.1.2 useEventForm 훅 수정 (선택사항)
- **TR-2.1**: 날짜 셀 클릭 시 폼을 채우는 헬퍼 함수 추가 가능
  ```typescript
  const fillFormWithDate = (dateString: string) => {
    setEditingEvent(null);
    setDate(dateString);
    setStartTime('09:00');
    setEndTime('10:00');
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('업무');
    setNotificationTime(10);
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
  };
  ```
- **TR-2.2**: 반환값에 `fillFormWithDate` 함수 추가

### 4.2 타입 정의
- **TR-3.1**: 새로운 타입 정의는 필요하지 않습니다 (기존 타입 재사용)
- **TR-3.2**: 필요 시 날짜 형식 관련 타입을 `type` 키워드로 정의
  ```typescript
  type DateString = string; // YYYY-MM-DD 형식
  ```

### 4.3 날짜 변환 유틸리티
- **TR-4.1**: 기존 `formatDate()` 함수 사용 (`utils/dateUtils.ts`)
  - 현재 구현 확인 필요
  - Date 객체를 YYYY-MM-DD 문자열로 변환하는 함수

- **TR-4.2**: 주간 뷰에서 날짜 문자열 생성
  ```typescript
  const weekDates = getWeekDates(currentDate);
  weekDates.map((date) => {
    const dateString = formatDate(currentDate, date.getDate());
    // 또는
    const dateString = date.toISOString().split('T')[0];
  });
  ```

- **TR-4.3**: 월간 뷰에서 날짜 문자열 생성
  ```typescript
  const dateString = formatDate(currentDate, day);
  ```

### 4.4 통합 지점

#### 4.4.1 useEventForm 훅과의 통합
- **TR-5.1**: `setDate`, `setStartTime`, `setEndTime` 등 상태 setter 함수 활용
- **TR-5.2**: `setEditingEvent(null)`로 편집 모드 종료
- **TR-5.3**: `resetForm()` 함수를 활용할 수 있으나, 날짜와 시간은 별도 설정 필요

#### 4.4.2 기존 저장 로직과의 통합
- **TR-6.1**: `addOrUpdateEvent()` 함수를 그대로 사용
- **TR-6.2**: 저장 버튼("일정 추가")의 동작은 변경 없음

#### 4.4.3 포커스 관리
- **TR-7.1**: `setTimeout`을 사용하여 다음 이벤트 루프에서 포커스 설정
- **TR-7.2**: 제목 필드의 ID(`#title`)를 사용하여 `focus()` 호출
- **TR-7.3**: 접근성을 위해 `ref`를 사용한 포커스 관리도 가능

## 5. 엣지 케이스

### 5.1 데이터 무결성
- **EC-1.1**: 빈 셀(날짜 없음)을 클릭하면 아무 동작도 하지 않음
- **EC-1.2**: 이미 같은 날짜가 선택되어 있어도 클릭 시 폼 필드를 다시 채움

### 5.2 UI 상태
- **EC-2.1**: 편집 모드에서 날짜 셀을 클릭하면 편집이 취소되고 새 일정 생성 모드로 전환
- **EC-2.2**: 반복 일정 체크박스가 체크되어 있어도 날짜 셀 클릭 시 체크 해제
- **EC-2.3**: 폼 검증 에러가 있어도 날짜 셀 클릭 시 에러 상태 초기화 (선택사항)

### 5.3 이벤트 전파
- **EC-3.1**: 일정 박스를 클릭하면 날짜 셀 클릭 핸들러가 실행되지 않음
- **EC-3.2**: 일정 박스 내의 아이콘(알림, 반복)을 클릭해도 날짜 셀 클릭 핸들러가 실행되지 않음
- **EC-3.3**: 공휴일 텍스트를 클릭해도 날짜 셀 클릭 핸들러가 정상 실행됨

### 5.4 포커스 관리
- **EC-4.1**: 제목 필드가 DOM에 존재하지 않으면 에러 없이 무시
- **EC-4.2**: 다른 입력 필드에 포커스가 있어도 강제로 제목 필드로 이동

### 5.5 시간 검증
- **EC-5.1**: 기본 시간(09:00-10:00)은 항상 유효하므로 시간 검증 에러 없음
- **EC-5.2**: 사용자가 시간을 수동으로 변경하면 기존 시간 검증 로직 적용

## 6. UI/UX 요구사항

### 6.1 시각적 피드백

#### 6.1.1 날짜 셀 호버
- **UX-1.1**: 마우스 커서가 날짜 셀 위에 있을 때: `cursor: pointer`
- **UX-1.2**: 호버 시 배경색 변경 (선택사항): `backgroundColor: '#f5f5f5'`
- **UX-1.3**: 호버 효과는 전체 셀에 적용되어야 합니다 (일정 박스 제외)

#### 6.1.2 클릭 피드백
- **UX-2.1**: 클릭 시 즉각적인 시각적 피드백 없음 (폼 업데이트로 충분)
- **UX-2.2**: 폼의 날짜 필드가 변경되면서 자연스러운 피드백 제공

#### 6.1.3 포커스 피드백
- **UX-3.1**: 제목 필드로 포커스가 이동하면 기본 브라우저 포커스 스타일 표시
- **UX-3.2**: Material-UI TextField의 기본 포커스 스타일 활용

### 6.2 폼 업데이트
- **UX-4.1**: 날짜 필드가 클릭한 날짜로 즉시 업데이트됨
- **UX-4.2**: 시작 시간 필드가 "09:00"으로 즉시 업데이트됨
- **UX-4.3**: 종료 시간 필드가 "10:00"으로 즉시 업데이트됨
- **UX-4.4**: 제목 필드가 비어 있고 포커스됨
- **UX-4.5**: 폼 상단의 헤더가 "일정 추가"로 표시됨 (편집 모드 종료 시)

### 6.3 접근성
- **UX-5.1**: 날짜 셀에 `role="button"` 추가 (선택사항)
- **UX-5.2**: 날짜 셀에 `aria-label="날짜 선택"` 추가 (선택사항)
- **UX-5.3**: 키보드 단축키는 필요 없음 (기본 요구사항 아님)

### 6.4 모바일 지원
- **UX-6.1**: 기본 클릭 동작 사용 (표준 터치 이벤트로 작동)
- **UX-6.2**: 터치 영역은 충분히 커야 함 (Material-UI TableCell 기본 크기 활용)

## 7. 수락 기준 (Acceptance Criteria)

### 7.1 기본 기능
- **AC-1.1**: ✅ 주간 뷰의 날짜 셀을 클릭하면 해당 날짜가 폼의 날짜 필드에 채워진다
- **AC-1.2**: ✅ 월간 뷰의 날짜 셀을 클릭하면 해당 날짜가 폼의 날짜 필드에 채워진다
- **AC-1.3**: ✅ 날짜 셀 클릭 시 시작 시간이 "09:00"으로 설정된다
- **AC-1.4**: ✅ 날짜 셀 클릭 시 종료 시간이 "10:00"으로 설정된다
- **AC-1.5**: ✅ 날짜 셀 클릭 시 제목 입력 필드로 포커스가 이동한다

### 7.2 폼 덮어쓰기
- **AC-2.1**: ✅ 폼에 기존 데이터가 있어도 날짜 셀 클릭 시 새 날짜와 시간으로 덮어써진다
- **AC-2.2**: ✅ 편집 모드에서 날짜 셀을 클릭하면 편집이 취소되고 새 일정 생성 모드로 전환된다
- **AC-2.3**: ✅ 날짜 셀 클릭 시 제목, 설명, 위치 필드가 초기화된다
- **AC-2.4**: ✅ 날짜 셀 클릭 시 카테고리가 "업무"로 설정된다
- **AC-2.5**: ✅ 날짜 셀 클릭 시 알림 시간이 10분으로 설정된다

### 7.3 저장 동작
- **AC-3.1**: ✅ 날짜 셀 클릭은 자동 저장하지 않는다
- **AC-3.2**: ✅ 사용자가 "일정 추가" 버튼을 클릭해야만 저장된다
- **AC-3.3**: ✅ 저장 로직은 기존 검증 로직을 그대로 따른다 (제목, 날짜, 시간 필수)

### 7.4 이벤트 전파
- **AC-4.1**: ✅ 일정 박스를 클릭하면 날짜 셀 클릭 핸들러가 실행되지 않는다
- **AC-4.2**: ✅ 날짜 셀의 빈 영역을 클릭해야만 새 일정 생성 기능이 동작한다
- **AC-4.3**: ✅ 일정 박스의 편집/삭제 버튼은 정상 작동한다

### 7.5 엣지 케이스
- **AC-5.1**: ✅ 빈 셀(날짜 없음)을 클릭하면 아무 동작도 하지 않는다
- **AC-5.2**: ✅ 반복 일정 체크박스가 체크되어 있어도 날짜 셀 클릭 시 체크 해제된다
- **AC-5.3**: ✅ 사용자가 기본 시간을 수동으로 변경할 수 있다

### 7.6 UI/UX
- **AC-6.1**: ✅ 날짜 셀에 마우스 커서를 올리면 `pointer` 커서가 표시된다
- **AC-6.2**: ✅ 날짜 셀 클릭 후 폼 헤더가 "일정 추가"로 표시된다
- **AC-6.3**: ✅ 제목 필드에 포커스가 있어 바로 타이핑을 시작할 수 있다

## 8. 구현 참고사항

### 8.1 코딩 표준 준수 (필수)
- **IN-1.1**: 모든 새로운 타입은 `type` 키워드를 사용하여 정의
- **IN-1.2**: 패키지 설치 시 `yarn` 사용 (npm 사용 금지)
- **IN-1.3**: 이 기능은 외부 라이브러리가 필요 없습니다 (기본 React만 사용)

### 8.2 날짜 셀 클릭 핸들러 구현

#### 8.2.1 주간 뷰 수정 예시
```typescript
const renderWeekView = () => {
  const weekDates = getWeekDates(currentDate);

  const handleCellClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    handleDateCellClick(dateString);
  };

  return (
    <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
      {/* ... */}
      <TableRow>
        {weekDates.map((date) => (
          <TableCell
            key={date.toISOString()}
            onClick={() => handleCellClick(date)}
            sx={{
              height: '120px',
              verticalAlign: 'top',
              width: '14.28%',
              padding: 1,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            {/* 날짜 및 일정 박스 */}
          </TableCell>
        ))}
      </TableRow>
    </Stack>
  );
};
```

#### 8.2.2 월간 뷰 수정 예시
```typescript
const renderMonthView = () => {
  const weeks = getWeeksAtMonth(currentDate);

  const handleCellClick = (day: number | null) => {
    if (!day) return; // 빈 셀 무시
    const dateString = formatDate(currentDate, day);
    handleDateCellClick(dateString);
  };

  return (
    <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
      {/* ... */}
      {weeks.map((week, weekIndex) => (
        <TableRow key={weekIndex}>
          {week.map((day, dayIndex) => (
            <TableCell
              key={dayIndex}
              onClick={() => handleCellClick(day)}
              sx={{
                height: '120px',
                verticalAlign: 'top',
                width: '14.28%',
                padding: 1,
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                position: 'relative',
                cursor: day ? 'pointer' : 'default',
                '&:hover': day ? {
                  backgroundColor: '#f5f5f5'
                } : {}
              }}
            >
              {/* 날짜 및 일정 박스 */}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </Stack>
  );
};
```

#### 8.2.3 일정 박스 이벤트 전파 방지
```typescript
// 주간 뷰와 월간 뷰 모두 동일하게 적용
<Box
  key={event.id}
  onClick={(e) => e.stopPropagation()} // 중요: 날짜 셀 클릭 방지
  sx={{
    ...eventBoxStyles.common,
    ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
  }}
>
  {/* 일정 내용 */}
</Box>
```

### 8.3 handleDateCellClick 함수 상세 구현
```typescript
const handleDateCellClick = (dateString: string) => {
  // 1. 편집 모드 종료
  if (editingEvent) {
    setEditingEvent(null);
  }

  // 2. 날짜와 시간 설정
  setDate(dateString);
  setStartTime('09:00');
  setEndTime('10:00');

  // 3. 다른 필드 초기화
  setTitle('');
  setDescription('');
  setLocation('');
  setCategory('업무');
  setNotificationTime(10);

  // 4. 반복 일정 관련 초기화
  setIsRepeating(false);
  setRepeatType('none');
  setRepeatInterval(1);
  setRepeatEndDate('');

  // 5. 시간 에러 초기화 (있다면)
  // setTimeError({ startTimeError: null, endTimeError: null });

  // 6. 제목 필드로 포커스 이동
  // setTimeout을 사용하여 React 렌더링 후 실행
  setTimeout(() => {
    const titleInput = document.getElementById('title');
    if (titleInput) {
      titleInput.focus();
    }
  }, 0);
};
```

### 8.4 useEventForm 훅 확장 (선택사항)
```typescript
// src/hooks/useEventForm.ts에 추가

export const useEventForm = (initialEvent?: Event) => {
  // ... 기존 상태 변수들

  const fillFormWithDate = (dateString: string) => {
    setEditingEvent(null);
    setDate(dateString);
    setStartTime('09:00');
    setEndTime('10:00');
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('업무');
    setNotificationTime(10);
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
  };

  return {
    // ... 기존 반환값
    fillFormWithDate,
  };
};

// App.tsx에서 사용
const { fillFormWithDate, /* ... */ } = useEventForm();

const handleDateCellClick = (dateString: string) => {
  fillFormWithDate(dateString);

  setTimeout(() => {
    document.getElementById('title')?.focus();
  }, 0);
};
```

### 8.5 포커스 관리 개선 (ref 사용)
```typescript
// App.tsx 상단
import { useRef } from 'react';

function App() {
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleDateCellClick = (dateString: string) => {
    // ... 폼 업데이트 로직

    // ref를 사용한 포커스
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
  };

  return (
    // ...
    <TextField
      id="title"
      inputRef={titleInputRef}
      size="small"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  );
}
```

### 8.6 날짜 형식 변환 유틸리티
```typescript
// 이미 존재하는 formatDate 함수 확인 및 활용
// src/utils/dateUtils.ts

// Date 객체를 YYYY-MM-DD로 변환
const dateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 또는 formatDate 함수 활용
const dateString = formatDate(currentDate, day);
```

### 8.7 테스트 고려사항
- **IN-7.1**: 날짜 셀 클릭은 `@testing-library/user-event`의 `click` 이벤트로 테스트 가능
- **IN-7.2**: 폼 필드 업데이트는 `screen.getByLabelText`로 검증
- **IN-7.3**: 포커스 이동은 `document.activeElement`로 확인
- **IN-7.4**: 이벤트 전파 방지는 일정 박스 클릭 시 폼이 업데이트되지 않는지 확인

### 8.8 접근성 개선 (선택사항)
```typescript
<TableCell
  role="button"
  tabIndex={day ? 0 : -1}
  aria-label={day ? `${day}일 일정 추가` : undefined}
  onClick={() => handleCellClick(day)}
  onKeyDown={(e) => {
    if (day && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleCellClick(day);
    }
  }}
  sx={{
    // ... 스타일
  }}
>
  {/* 내용 */}
</TableCell>
```

## 9. 관련 파일

### 9.1 수정이 필요한 파일
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/App.tsx` - 날짜 셀 클릭 로직 추가

### 9.2 참조해야 할 기존 파일
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/hooks/useEventForm.ts` - 폼 상태 관리
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/utils/dateUtils.ts` - 날짜 형식 변환
- `/Users/seednpc10/dev/front_7th_chapter1-3/src/types.ts` - Event 타입 정의

### 9.3 새로 생성할 파일
- 없음 (기존 파일만 수정)

## 10. 구현 우선순위

### Phase 1: 기본 클릭 기능 (필수)
1. `handleDateCellClick` 함수 구현
2. 주간 뷰 날짜 셀에 onClick 핸들러 추가
3. 월간 뷰 날짜 셀에 onClick 핸들러 추가
4. 날짜 및 시간 필드 자동 채우기
5. 빈 셀 클릭 방지 (월간 뷰)

### Phase 2: 폼 덮어쓰기 (필수)
1. 편집 모드 종료 로직
2. 다른 필드 초기화 로직
3. 반복 일정 체크박스 해제

### Phase 3: 포커스 관리 (필수)
1. 제목 필드로 포커스 이동
2. setTimeout을 사용한 안정적인 포커스 처리

### Phase 4: 이벤트 전파 제어 (필수)
1. 일정 박스에 `stopPropagation()` 추가
2. 일정 박스 클릭 시 폼이 업데이트되지 않는지 확인

### Phase 5: UI/UX 개선 (선택사항)
1. 날짜 셀 hover 효과
2. 커서 스타일 변경
3. 접근성 속성 추가

### Phase 6: 테스트 및 엣지 케이스 (필수)
1. 엣지 케이스 처리
2. 단위 테스트 작성
3. 통합 테스트 작성

## 11. 상호작용 시나리오

### 11.1 기본 사용 흐름
1. 사용자가 캘린더의 특정 날짜 셀을 클릭합니다
2. 폼의 날짜 필드가 해당 날짜로 채워집니다 (YYYY-MM-DD)
3. 시작 시간이 09:00, 종료 시간이 10:00으로 설정됩니다
4. 제목 입력 필드로 포커스가 이동합니다
5. 사용자가 제목을 입력합니다
6. 필요에 따라 시간, 설명, 위치 등을 수정합니다
7. "일정 추가" 버튼을 클릭하여 저장합니다

### 11.2 폼 덮어쓰기 흐름
1. 사용자가 폼에 일부 데이터를 입력합니다 (예: 제목만 입력)
2. 다른 날짜 셀을 클릭합니다
3. 폼의 모든 필드가 초기화되고 새 날짜/시간으로 채워집니다
4. 이전에 입력한 제목은 사라집니다
5. 포커스가 제목 필드로 이동합니다

### 11.3 편집 취소 흐름
1. 사용자가 기존 일정을 편집 중입니다 (폼에 기존 일정 데이터가 채워져 있음)
2. 캘린더의 다른 날짜 셀을 클릭합니다
3. 편집 모드가 종료됩니다 (`editingEvent = null`)
4. 폼이 새 일정 생성 모드로 전환됩니다
5. 클릭한 날짜와 기본 시간으로 폼이 채워집니다
6. 폼 헤더가 "일정 수정"에서 "일정 추가"로 변경됩니다

### 11.4 일정 박스 클릭과의 구분
1. 사용자가 날짜 셀 내의 일정 박스를 클릭합니다
2. 이벤트 전파가 중단되어 날짜 셀 클릭 핸들러가 실행되지 않습니다
3. 일정 박스의 편집/삭제 기능만 동작합니다
4. 폼은 업데이트되지 않습니다

## 12. 명세서 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025-11-03 | 초기 명세서 작성 | spec-writer |
