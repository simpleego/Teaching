# useMemo  
>  React의 useMemo 훅은 계산 비용이 높은 값을 최적화하는 데 사용됩니다.
> 즉, 의존성 배열의 값이 변경되지 않는 한 이전 계산 결과를 **기억(memoize)**하고 재사용합니다.
> 다음은 간단한 예시입니다. 이 예시에서 calculateExpensiveValue 함수는 일부 복잡하고 시간이 오래 걸리는 계산을 시뮬레이션한다고 가정합니다.


```js
import React, { useState, useMemo } from 'react';

function ExampleComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 1. 계산 비용이 높은 함수 (시뮬레이션)
  const calculateExpensiveValue = (num) => {
    console.log('계산 중... (useMemo가 없으면 count가 아닌 다른 상태가 변해도 실행됨)');
    // 실제 복잡한 계산을 시뮬레이션하기 위해 일부러 지연시킴
    let i = 0;
    while (i < 1000000000) {
      i++;
    }
    return num * 2;
  };

  // 2. useMemo를 사용하여 값 메모이제이션
  // 의존성 배열 [count]가 변경될 때만 calculateExpensiveValue를 다시 실행하고 값을 갱신합니다.
  const memoizedValue = useMemo(() => {
    return calculateExpensiveValue(count);
  }, [count]); // 의존성 배열: count가 변경될 때만 재계산

  return (
    <div>
      <h2>useMemo 예시</h2>
      
      {/* count 상태 변경 */}
      <button onClick={() => setCount(c => c + 1)}>
        Count 증가: {count}
      </button>
      
      <p>
        **메모이제이션된 값 (Count에만 의존):** {memoizedValue}
      </p>
      <hr/>

      {/* text 상태 변경 */}
      <input 
        type="text" 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="텍스트 입력"
      />
      <p>
        **다른 상태 (Text) :** {text}
      </p>
      <p style={{ color: 'red' }}>
        **💡 텍스트를 입력할 때마다 컴포넌트는 리렌더링되지만, '계산 중...' 로그는 count가 증가할 때만 출력되는 것을 확인해보세요.**
      </p>
    </div>
  );
}

export default ExampleComponent;
```


주요 설명
| 요소 | 역할 및 설명 |
|---|---|
| useMemo(() => ... , [count]) | 첫 번째 인자는 값을 반환하는 함수입니다. 두 번째 인자는 의존성 배열입니다. |
| [count] | 배열 내의 count 값이 변경될 때만 첫 번째 인자의 함수(calculateExpensiveValue(count))를 다시 실행하고 새로운 값을 반환합니다. |
| 최적화 | text 상태가 변경되어 컴포넌트가 리렌더링되더라도, count 값은 변하지 않았으므로 useMemo는 이전에 계산해 둔 memoizedValue를 재사용합니다. 이로 인해 비싼 계산이 불필요하게 다시 실행되는 것을 방지합니다. |
결론적으로, useMemo는 복잡한 계산을 수행하는 함수를 감싸서, 필요한 경우에만 재계산하도록 하여 성능을 개선합니다.
