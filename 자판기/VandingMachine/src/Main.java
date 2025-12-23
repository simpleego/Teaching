import java.util.*;

class ConsoleUtil {
    public static void clearScreen() {
        try {
            // 윈도우 환경에서 cls 명령 실행
            new ProcessBuilder("cmd", "/c", "cls").inheritIO().start().waitFor();
        } catch (Exception e) {
            System.out.println("화면을 지울 수 없습니다.");
        }
    }
}

class Coffee {
    private String name;
    private int price;

    public Coffee(String name, int price) {
        this.name = name;
        this.price = price;
    }

    public String getName() { return name; }
    public int getPrice() { return price; }
}

class Coin {
    private int amount;

    public Coin() { this.amount = 0; }

    public void insert(int value) { amount += value; }
    public int getAmount() { return amount; }
    public void reset() { amount = 0; }
}

class DisplayPanel {
    public void showMenu(List<Coffee> menu, int balance) {
        System.out.println("\n===== 커피 자판기 메뉴 =====");
        for (int i = 0; i < menu.size(); i++) {
            Coffee coffee = menu.get(i);
            String status = (balance >= coffee.getPrice()) ? "O" : "X";
            System.out.printf("%d. %s (%d원) [%s]\n", i, coffee.getName(), coffee.getPrice(), status);
        }
        System.out.println("===========================");
        System.out.println("현재 잔액: " + balance + "원");
    }

    public void showMessage(String message) {
        System.out.println("[디스플레이] " + message);
    }
}

class ProductOutput {
    public void dispense(Coffee coffee) {
        System.out.println("[출력] " + coffee.getName() + "가 나왔습니다!");
    }
}

class ReturnButton {
    private Coin coin;
    private DisplayPanel display;

    public ReturnButton(Coin coin, DisplayPanel display) {
        this.coin = coin;
        this.display = display;
    }

    public void press() {
        int refund = coin.getAmount();
        coin.reset();
        display.showMessage("반환된 금액: " + refund + "원");
    }
}

class VendingMachine {
    private Coin coin;
    private DisplayPanel display;
    private ReturnButton returnButton;
    private ProductOutput output;
    private List<Coffee> menu;

    public VendingMachine() {
        coin = new Coin();
        display = new DisplayPanel();
        output = new ProductOutput();
        returnButton = new ReturnButton(coin, display);

        // 커피 메뉴 구성
        menu = new ArrayList<>();
        menu.add(new Coffee("아메리카노", 1000));
        menu.add(new Coffee("라떼", 1500));
        menu.add(new Coffee("카푸치노", 2000));
    }

    public void showMenu() {
        display.showMenu(menu, coin.getAmount());
    }

    public void insertCoin(int value) {
        coin.insert(value);
        display.showMessage("현재 잔액: " + coin.getAmount() + "원");
    }

    public void selectCoffee(int index) {
        if (index < 0 || index >= menu.size()) {
            display.showMessage("잘못된 선택입니다.");
            return;
        }
        Coffee coffee = menu.get(index);
        if (coin.getAmount() >= coffee.getPrice()) {
            coin.insert(-coffee.getPrice()); // 가격만큼 차감
            output.dispense(coffee);
            display.showMessage("잔액: " + coin.getAmount() + "원");
        } else {
            display.showMessage("잔액 부족! " + coffee.getPrice() + "원이 필요합니다.");
        }
    }

    public void pressReturnButton() {
        returnButton.press();
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        VendingMachine vm = new VendingMachine();

        while (true) {
            ConsoleUtil.clearScreen();   // 화면 지우기
            vm.showMenu();
            System.out.println("1. 동전 투입 | 2. 커피 선택 | 3. 반환 버튼 | 0. 종료");
            System.out.print("선택: ");
            int choice = sc.nextInt();

            switch (choice) {
                case 0:
                    System.out.println("자판기를 종료합니다.");
                    return; // break 대신 return으로 전체 종료
                case 1:
                    System.out.print("투입할 금액 입력: ");
                    int money = sc.nextInt();
                    vm.insertCoin(money);
                    break;
                case 2:
                    System.out.print("커피 번호 선택: ");
                    int coffeeIndex = sc.nextInt();
                    vm.selectCoffee(coffeeIndex);
                    break;
                case 3:
                    vm.pressReturnButton();
                    break;
                default:
                    System.out.println("잘못된 입력입니다.");
                    break;
            }

            System.out.println("계속하려면 Enter를 누르세요...");
            sc.nextLine(); // 버퍼 비우기
            sc.nextLine(); // Enter 입력 대기
        }

    }
}

