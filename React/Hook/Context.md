#  Context 요약정리
> 유튜브 영상 [React Hooks에 취한다 - useContext + Context API | 리액트 훅스 시리즈](https://www.youtube.com/watch?v=LwvXVEHS638)는 `useContext`와 `Context API`를 사용하여 리액트 앱에서 전역적인 데이터를 효율적으로 관리하는 방법을 설명합니다.

**핵심 내용:**

* **`Props Drilling` 문제점**: 리액트 앱에서 데이터를 부모 컴포넌트에서 자식 컴포넌트로 전달할 때 `props`를 통해 단계별로 전달해야 합니다. 앱의 규모가 커지고 컴포넌트 트리가 깊어지면, 필요 없는 중간 컴포넌트까지 `props`를 받아 자식에게 다시 전달해야 하는 `props drilling` 현상이 발생하여 코드가 복잡해지고 유지보수가 어려워집니다 [[02:44](http://www.youtube.com/watch?v=LwvXVEHS638&t=164)].
* **`Context API`의 등장**: 이러한 문제를 해결하기 위해 리액트는 `Context API`를 제공합니다. `Context API`는 앱 안에서 전역적으로 사용되는 데이터(예: 로그인된 사용자 정보, 테마, 언어 등)를 여러 컴포넌트가 쉽게 공유할 수 있도록 돕습니다 [[01:20](http://www.youtube.com/watch?v=LwvXVEHS638&t=80)].
* **`useContext` Hook**: `useContext`는 `Context`로 공유된 데이터를 하위 컴포넌트에서 쉽게 받아볼 수 있게 해주는 훅(Hook)입니다 [[03:37](http://www.youtube.com/watch?v=LwvXVEHS638&t=217)]. `props`를 일일이 전달할 필요 없이, 필요한 컴포넌트에서 `useContext`를 사용하여 데이터를 직접 가져올 수 있습니다 [[03:37](http://www.youtube.com/watch?v=LwvXVEHS638&t=217)].
* **사용 시 주의점**: `Context`를 남용하면 컴포넌트 재사용성이 저해될 수 있으므로, 꼭 필요할 때, 즉 다양한 레벨에 있는 많은 컴포넌트에게 전역적인 데이터를 전달할 때 사용하는 것이 좋습니다 [[03:56](http://www.youtube.com/watch?v=LwvXVEHS638&t=236)]. `props drilling`을 피하기 위한 목적이라면 `Component Composition`이 더 간단한 해결책이 될 수 있다고 언급합니다 [[04:06](http://www.youtube.com/watch?v=LwvXVEHS638&t=246)].
* **구현 예시**: 영상에서는 다크 모드 토글 기능을 가진 간단한 웹사이트를 예시로 들어, 초기에는 `useState`와 `props`로 데이터를 전달하다가 [[04:53](http://www.youtube.com/watch?v=LwvXVEHS638&t=293)], `Context API`와 `useContext`를 사용하여 `props drilling` 없이 데이터를 공유하는 과정을 단계별로 시연합니다 [[08:02](http://www.youtube.com/watch?v=LwvXVEHS638&t=482)].
    * `createContext`를 사용하여 `Context`를 생성하고 [[09:27](http://www.youtube.com/watch?v=LwvXVEHS638&t=567)].
    * 최상위 컴포넌트(`App.js`)에서 `Context.Provider`로 하위 컴포넌트를 감싸고, `value` prop을 통해 공유할 데이터를 전달합니다 [[10:02](http://www.youtube.com/watch?v=LwvXVEHS638&t=602)].
    * 데이터가 필요한 하위 컴포넌트에서는 `useContext` 훅을 사용하여 해당 데이터를 받아옵니다 [[11:03](http://www.youtube.com/watch?v=LwvXVEHS638&t=663)].
* **`createContext`의 초기값**: `createContext`에 전달하는 초기값은 `Context.Provider`가 상위에 없을 때 `useContext`가 반환하는 기본값으로 사용됩니다 [[14:30](http://www.youtube.com/watch?v=LwvXVEHS638&t=870)].

결론적으로 이 영상은 `useContext`와 `Context API`가 리액트에서 전역 상태를 관리하고 `props drilling` 문제를 해결하는 강력한 도구임을 실제 코드 예시와 함께 이해하기 쉽게 설명합니다.
http://googleusercontent.com/youtube_content/7
