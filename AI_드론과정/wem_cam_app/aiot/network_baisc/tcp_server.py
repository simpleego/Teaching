import socket

# 소켓 생성
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 소켓 바인드 : ''는 모든 IP에 바인드하라는 의미
server_socket.bind(('', 12345))

# 소켓이 연결 요청을 기다림
server_socket.listen()

while True:
    # 연결 수락
    client_socket, addr = server_socket.accept()
    print('Connected by', addr)

    while True:
        # 클라이언트로부터 데이터 받기
        data = client_socket.recv(1024)
        if not data:
            break

        print('Received from', addr, data.decode())

        # 받은 데이터를 클라이언트에게 다시 전송 (에코)
        client_socket.sendall(data)

    # 연결 종료
    client_socket.close()