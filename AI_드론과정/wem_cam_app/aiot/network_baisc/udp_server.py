import socket

# 소켓 생성
server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# 소켓 바인드
server_socket.bind(('', 12345))

while True:
    # 클라이언트로부터 데이터 받기
    data, addr = server_socket.recvfrom(1024)
    print('Received from', addr, data.decode())

    # 받은 데이터를 클라이언트에게 다시 전송
    server_socket.sendto(data, addr)