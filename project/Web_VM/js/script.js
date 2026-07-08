document.addEventListener("DOMContentLoaded", () => {

    // 메뉴선택 처리

    // 총입력한 동전
    let totInMoney = 0;

    // 자판기 판매금액 누적
    let VMInMoney = 0;
    const MILK_PRICE = 300;
    const SUGAR_PRICE = 200;
    const BLACK_PRICE = 100;

    const coffeeNames = ['밀크', '설탕', '블랙'];

    const coffeeMerterial = {
        "커피": 100,
        "프림": 100,
        "설탕": 100
    }

    const coffeePrice = {
        "밀크": 300,
        "설탕": 200,
        "블랙": 100
    }

    const coffeeImage = {
        "밀크": 'milkOut',
        "설탕": 'sugarOut',
        "블랙": 'blackOut'
    }

    // 화면에 가격 표시 
    document.querySelector("#milkPrice").innerText = MILK_PRICE;
    document.querySelector("#sugarPrice").innerText = SUGAR_PRICE;
    document.querySelector("#blackPrice").innerText = BLACK_PRICE;

    // 커피 출력화면 연결
    const $outCoffeeImg = document.querySelector('#outCoffee img');
    console.log('$outCoffeeImg :' + $outCoffeeImg.src)

    // 동전 드롭영역 연결
    const slot = document.querySelector("#slot");
    const coinBtns = document.querySelectorAll(".coin");

    // 동전 드래그 시작
    coinBtns.forEach(coinBtn => {
        addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text", event.target.id);
        });
    });

    // 동전 드래그 진행 중...
    slot.addEventListener("dragover", (event) => {
        event.preventDefault();// 각각의 고유 이벤트 방지
    });

    // 동전 드롭 : 동전값 만큼 누적, 동전이 사라짐
    slot.addEventListener("drop", (event) => {
        const coinId = event.dataTransfer.getData("text");
        console.log('==>' + coinId);
        const draggedCoin = document.getElementById(coinId);

        let coinValue = draggedCoin.getAttribute('alt');
        totInMoney += parseInt(
            coinValue.slice(0,
                coinValue.lastIndexOf("원", coinValue)));
        document.querySelector("#inMoney").value = totInMoney;

        // 동전 복사
        const newCoin = draggedCoin.cloneNode(true);
        newCoin.style.position = "static";
        newCoin.style.zIndex = "1";
        slot.appendChild(newCoin);

        setTimeout(() => {
            newCoin.remove();
        }, 1000);
    })

    // 커피 메뉴를 선택하면 각각 메뉴에 맞는 기능 구현
    const coffeeBtns = document.querySelectorAll('.coffeeBtn')
        .forEach(coffeeBtn => {
            coffeeBtn.addEventListener('click', function (event) {

                // 커피메뉴 클릭하면 해야할 일을 기술
                // 1. 커피메뉴 이름 가져오기
                let coffeeName = event.target.textContent;
                coffeeName = coffeeName.slice(0, 2);
                let coffeePrice = getPrice(coffeeName);

                // 투입한 동전과 커피가격을 비교하여 커피 판매
                if (totInMoney >= coffeePrice) {

                    // 재료 체크
                    // 밀크커피 (커피:10, 프림:20, 설탕:20)

                    // 재료처리 함수 작성
                    //  
                    if (coffeeName === '밀크') {

                        if (coffeeMerterial['커피'] >= 10 &&
                            coffeeMerterial['프림'] >= 20 &&
                            coffeeMerterial['설탕'] >= 20) {
                            // 밀크커피 판매
                            coffeeMerterial['커피'] -= 10;
                            coffeeMerterial['프림'] -= 20;
                            coffeeMerterial['설탕'] -= 20;

                            console.log(coffeeMerterial);

                            VMInMoney += coffeePrice;
                            totInMoney -= coffeePrice;
                            document.querySelector("#inMoney").value = totInMoney;

                            // 선택한 커피 메뉴 출력
                            imgSrc = outCoffee(coffeeName);
                            $outCoffeeImg.src = imgSrc;
                            $outCoffeeImg.style.visibility = 'visible';
                        }
                    }

                    // 설탕커피 처리
                    if (coffeeName === '설탕') {

                        if (coffeeMerterial['커피'] >= 10 &&
                            coffeeMerterial['설탕'] >= 20) {
                            // 밀크커피 판매
                            coffeeMerterial['커피'] -= 10;
                            coffeeMerterial['설탕'] -= 20;

                            console.log(coffeeMerterial);

                            VMInMoney += coffeePrice;
                            totInMoney -= coffeePrice;
                            document.querySelector("#inMoney").value = totInMoney;

                            // 선택한 커피 메뉴 출력
                            imgSrc = outCoffee(coffeeName);
                            $outCoffeeImg.src = imgSrc;
                            $outCoffeeImg.style.visibility = 'visible';
                        }
                    }

                    // 블랙커피 처리
                    if (coffeeName === '블랙') {

                        if (coffeeMerterial['커피'] >= 10 ){
                            // 밀크커피 판매
                            coffeeMerterial['커피'] -= 10;

                            console.log(coffeeMerterial);

                            VMInMoney += coffeePrice;
                            totInMoney -= coffeePrice;
                            document.querySelector("#inMoney").value = totInMoney;

                            // 선택한 커피 메뉴 출력
                            imgSrc = outCoffee(coffeeName);
                            $outCoffeeImg.src = imgSrc;
                            $outCoffeeImg.style.visibility = 'visible';
                        }
                    }
                }
            });
        });

    function outCoffee(coffeeName) {
        return `img/${coffeeImage[coffeeName]}.png`;
    }

    function getPrice(coffeeName) {
        return coffeePrice[coffeeName];
    }

    // 동전입력 처리
    document.querySelector('#inputMoney').
        addEventListener('click', function () {

            // 동전 입력 처리
            let coin = document.querySelector("#coin").value;

            // 동전 누적
            totInMoney += parseInt(coin);

            // 동전 누적 출력
            document.querySelector("#inMoney").value = totInMoney;

        });

    document.querySelector("#exchangCoins").addEventListener("click", () => {
        let coins = document.querySelector("#inMoney").value;
        document.querySelector("#inMoney").value = 0;

        document.querySelector("#exchangeCoins").innerHTML = `${coins}`;
        totInMoney = 0;
    });
});