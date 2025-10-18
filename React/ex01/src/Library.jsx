import React from "react";
import Book from "./Book";

function Library(props) {
    return (
        <div>
            <h1>{`도서관 이름은  ${props.title} 입니다.`}</h1>
            <h2>{`이 도서관의 위치는 ${props.location}에 있습니다.`}</h2>
            <Book name="처음 만난 파이썬" numOfPage={300} />
            <Book name="처음 만난 AWS" numOfPage={400} />
            <Book name="처음 만난 리액트" numOfPage={500} />
        </div>
    );
}

export default Library;