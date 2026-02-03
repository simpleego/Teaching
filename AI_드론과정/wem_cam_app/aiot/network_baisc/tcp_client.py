import socket

def main():
    # 클라이언트 소켓 생성
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # 서버에 연결
    client_socket.connect(('localhost', 12345))
    print("Connected to server.")

    while True:
        msg = input("Message (q to quit): ")

        if msg == 'q':
            break

        # 서버로 메시지 전송
        client_socket.sendall(msg.encode())

        # 서버로부터 응답 수신
        data = client_socket.recv(1024)
        print("Received from server:", data.decode())

    client_socket.close()
    print("Connection closed.")

if __name__ == "__main__":
    main()