import React, { useState } from 'react';
import './Reserve.css'; // CSS 파일 import

// 간단한 좌석 데이터 (A1, A2, ...)
const seats = Array.from({ length: 8 * 8 }, (_, i) => {
    const row = String.fromCharCode(65 + Math.floor(i / 8)); // A-H
    const col = (i % 8) + 1;
    return `${row}${col}`;
});

const Reserve = () => {
    // useState 훅을 사용하여 선택된 좌석들의 상태를 관리합니다.
    // selectedSeats: 현재 상태 값 (배열)
    // setSelectedSeats: 상태를 업데이트하는 함수
    const [selectedSeats, setSelectedSeats] = useState([]);
    const ticketPrice = 12000;

    // 좌석 클릭 시 호출될 함수
    const handleSeatClick = (seat) => {
        setSelectedSeats(prevSelected => {
            // 이미 선택된 좌석이면 선택 해제 (배열에서 제거)
            if (prevSelected.includes(seat)) {
                return prevSelected.filter(s => s !== seat);
            }
            // 새로 선택된 좌석이면 배열에 추가
            else {
                return [...prevSelected, seat];
            }
        });
    };

    const isSeatSelected = (seat) => selectedSeats.includes(seat);
    const totalPrice = selectedSeats.length * ticketPrice;

    return (
        <div className="reservation-container">
            <h1>좌석 선택</h1>
            <div className="screen">SCREEN</div>
            <div className="seat-grid">
                {seats.map(seat => (
                    <div
                        key={seat}
                        className={`seat ${isSeatSelected(seat) ? 'selected' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                    >
                        {seat}
                    </div>
                ))}
            </div>

            <div className="reservation-info">
                <h3>선택한 좌석</h3>
                <p>
                    {selectedSeats.length > 0
                        ? selectedSeats.join(', ')
                        : '좌석을 선택해주세요.'}
                </p>
                <h3>총 결제 금액</h3>
                <p>{totalPrice.toLocaleString()}원</p>
                <button className="payment-button">결제하기</button>
            </div>
        </div>
    );
};

export default Reserve;