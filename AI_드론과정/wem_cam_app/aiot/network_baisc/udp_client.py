import socket

# 소켓 생성
client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

while True:
    msg = input("Enter message to send: ")
    if msg == 'q':
        break

    # 데이터 전송
    client_socket.sendto(msg.encode(), ('localhost', 12345))

    # 서버로부터 응답 받기
    data, addr = client_socket.recvfrom(1024)
    print('Received from', addr, data.decode())

client_socket.close()