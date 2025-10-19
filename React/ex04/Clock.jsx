import React from "react";

function Clock(props) {
    return (
        <div>
            <h1>안녕, 리액트!</h1>
            setTimeout(() => {                
            <h2>현재 시간: {new Date().toLocaleTimeString()}</h2>
            }, 1000);
        </div>
    );
}

export default Clock;
