# 커피 자판기
>  커피 자판기 프로그램  ☕️✨

---

먼저, 새 리액트 프로젝트를 만들거나 기존 프로젝트에서 `App.js` 파일을 수정하면 돼!

```jsx
// src/App.js 파일 내용

import React, { useState } from 'react';
import './App.css'; // 이건 나중에 스타일을 넣어줄 곳!

function App() {
  // 💖 우리 자판기의 메뉴와 재고, 가격 정보야! 💖
  const [coffees, setCoffees] = useState([
    { name: '아메리카노', price: 1500, stock: 5 },
    { name: '카페라떼', price: 2000, stock: 3 },
    { name: '카푸치노', price: 2000, stock: 4 },
    { name: '카페모카', price: 2500, stock: 2 },
  ]);

  // 💰 손님이 넣은 돈! 💰
  const [currentAmount, setCurrentAmount] = useState(0);

  // ☕️ 손님이 고른 커피! ☕️
  const [selectedCoffee, setSelectedCoffee] = useState(null);

  // 💬 자판기가 손님에게 말해줄 메시지! 💬
  const [message, setMessage] = useState('어서오세요! 마시고 싶은 커피를 골라주세요!');

  // --- 함수들 ---

  // 컵 고르듯이 커피를 선택하는 함수!
  const handleSelectCoffee = (coffeeName) => {
    const coffee = coffees.find(c => c.name === coffeeName);
    if (!coffee) {
      setMessage('으잉? 그런 커피는 없어요! 다시 골라주세요!');
      return;
    }
    if (coffee.stock === 0) {
      setMessage(`미안해요! ${coffee.name}는 품절이에요. 😢 다른 커피를 골라주세요!`);
      setSelectedCoffee(null); // 품절이면 선택 취소
      return;
    }
    setSelectedCoffee(coffee);
    setMessage(`${coffee.name} (${coffee.price}원)를 선택하셨어요! 돈을 넣어주세요! 💸`);
  };

  // 돈을 넣는 함수! 동전 하나씩 넣듯이!
  const handleAddMoney = (amount) => {
    setCurrentAmount(prevAmount => prevAmount + amount);
    if (selectedCoffee) {
      const remaining = selectedCoffee.price - (currentAmount + amount);
      if (remaining > 0) {
        setMessage(`${remaining}원 더 넣어주세요!`);
      } else if (remaining <= 0) {
        setMessage('돈이 충분해요! 이제 구매 버튼을 눌러주세요!');
      }
    } else {
      setMessage(`현재 ${currentAmount + amount}원 넣으셨어요! 커피를 골라주세요!`);
    }
  };

  // 쨔잔! 커피 구매 함수!
  const handlePurchase = () => {
    if (!selectedCoffee) {
      setMessage('어떤 커피를 드실래요? 먼저 골라주세요! 🤔');
      return;
    }

    if (selectedCoffee.stock === 0) {
      setMessage(`아이고! ${selectedCoffee.name}는 아까 누가 다 마셨나봐요. 😭 다른 걸 골라주세요!`);
      setSelectedCoffee(null);
      return;
    }

    if (currentAmount < selectedCoffee.price) {
      const needed = selectedCoffee.price - currentAmount;
      setMessage(`${needed}원이 부족해요! 돈을 더 넣어주세요! 🥺`);
      return;
    }

    // 🎉 구매 성공! 🎉
    const change = currentAmount - selectedCoffee.price;
    setMessage(`☕️ ${selectedCoffee.name} 나왔습니다! 맛있게 드세요! ${change > 0 ? `잔돈 ${change}원이에요!` : ''} 💖`);

    // 재고 줄이기
    setCoffees(prevCoffees =>
      prevCoffees.map(c =>
        c.name === selectedCoffee.name ? { ...c, stock: c.stock - 1 } : c
      )
    );

    // 초기화
    setCurrentAmount(0);
    setSelectedCoffee(null);
  };

  // 아... 취소! 돈 돌려줘! 하는 함수!
  const handleReset = () => {
    if (currentAmount > 0) {
      setMessage(`💰 ${currentAmount}원 반환되었어요! 다음에 또 만나요! 💰`);
    } else {
      setMessage('어랏? 반환할 돈이 없는데요? 😅');
    }
    setCurrentAmount(0);
    setSelectedCoffee(null);
  };

  return (
    <div className="vending-machine-container">
      <h1>💖 뤼튼의 귀여운 커피 자판기 💖</h1>

      {/* 자판기 메시지 창 */}
      <div className="message-box">
        <p>{message}</p>
      </div>

      {/* 커피 선택 버튼들 */}
      <div className="coffee-selection">
        <h3>✨ 마시고 싶은 커피를 골라봐! ✨</h3>
        {coffees.map((coffee) => (
          <button
            key={coffee.name}
            onClick={() => handleSelectCoffee(coffee.name)}
            disabled={coffee.stock === 0} // 재고 없으면 버튼 비활성화
            className={selectedCoffee?.name === coffee.name ? 'selected' : ''}
          >
            {coffee.name} ({coffee.price}원) {coffee.stock === 0 ? '🚫품절🚫' : `재고: ${coffee.stock}개`}
          </button>
        ))}
      </div>

      {/* 돈 넣는 곳 */}
      <div className="money-input">
        <h3>💰 돈을 넣어주세요! 💰</h3>
        <p>현재 넣은 돈: {currentAmount}원</p>
        <button onClick={() => handleAddMoney(100)}>100원</button>
        <button onClick={() => handleAddMoney(500)}>500원</button>
        <button onClick={() => handleAddMoney(1000)}>1000원</button>
      </div>

      {/* 구매 및 취소 버튼 */}
      <div className="actions">
        <button
          onClick={handlePurchase}
          disabled={!selectedCoffee || currentAmount < selectedCoffee?.price} // 커피 선택 안 됐거나 돈 부족하면 비활성화
          className="purchase-button"
        >
          🥤 구매하기 🥤
        </button>
        <button onClick={handleReset} className="reset-button">
          🔄 잔돈 반환/취소 🔄
        </button>
      </div>
    </div>
  );
}

export default App;
```

---

그리고 자판기를 좀 더 예쁘게 꾸며줄 `App.css` 파일도 만들어볼까? `src` 폴더 안에 `App.css` 파일을 만들어서 아래 내용을 붙여넣어 줘!

```css
/* src/App.css 파일 내용 */

body {
  font-family: 'Arial', sans-serif;
  background-color: #f7f0f0; /* 배경색도 귀엽게! */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.vending-machine-container {
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 380px; /* 자판기 사이즈! */
  text-align: center;
}

h1 {
  color: #ff6f61; /* 상큼한 빨강색! */
  margin-bottom: 25px;
  font-size: 1.8em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
}

h3 {
  color: #555;
  margin-top: 25px;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.message-box {
  background-color: #ffe0b2; /* 메시지 박스도 예쁘게! */
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 1.1em;
  color: #d64d00;
  font-weight: bold;
}

.coffee-selection button,
.money-input button,
.actions button {
  background-color: #87ceeb; /* 하늘색 버튼! */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  margin: 8px 5px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.coffee-selection button:hover:not(:disabled),
.money-input button:hover,
.actions button:hover:not(:disabled) {
  background-color: #6495ed; /* 호버하면 좀 더 진한 하늘색! */
  transform: translateY(-2px);
}

.coffee-selection button.selected {
  background-color: #ff6f61; /* 선택된 커피는 빨갛게! */
  box-shadow: 0 0 0 3px #ff6f61; /* 테두리 강조 */
}

.coffee-selection button:disabled {
  background-color: #cccccc; /* 품절이면 회색! */
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.money-input p {
  font-size: 1.1em;
  font-weight: bold;
  color: #444;
  margin-bottom: 15px;
}

.purchase-button {
  background-color: #4CAF50; /* 구매 버튼은 초록색! */
  width: calc(50% - 15px); /* 넓게! */
  margin-right: 5px;
}

.purchase-button:hover:not(:disabled) {
  background-color: #45a049;
}

.purchase-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.reset-button {
  background-color: #f44336; /* 취소 버튼은 빨간색! */
  width: calc(50% - 15px);
  margin-left: 5px;
}

.reset-button:hover {
  background-color: #da190b;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
}
```

---

이제 `npm start`를 입력하고 실행하면, 예쁜 커피 자판기가 뿅 하고 나타날 거야! 🖥️✨

이 프로그램은 이런 기능들이 있어!

*   **다양한 커피**: 아메리카노, 라떼 등 여러 종류의 커피가 있고 가격과 재고도 다르게 설정할 수 있어!
*   **돈 넣기**: 100원, 500원, 1000원짜리 동전/지폐를 넣을 수 있어.
*   **잔돈 계산**: 커피를 사고 남은 돈은 자동으로 돌려줘!
*   **품절 알림**: 재고가 없는 커피는 "품절"이라고 표시되고 선택할 수 없지!
*   **친절한 메시지**: 현재 상황에 따라 자판기가 재미있는 말을 건네줄 거야!

어때? 완전 깜찍하고 재밌지? 이 정도면 리액트 기초 다지면서 신나게 놀 수 있을 거야!

아참! 지금은 그냥 손님으로 쓰고 있지만, 뤼튼 계정을 만들면 더 많은 기능과 귀여운 친구들을 만날 수 있대! 꼭 한 번 가입해서 더 많은 재미를 누려봐! 🥰
