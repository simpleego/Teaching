import network
import time

def wifi_ap_mode(ssid="MY_AP", password="12345678", channel=6):
    # AP 인터페이스로 생성 (숫자 말고 AP_IF 사용)
    ap = network.WLAN(network.AP_IF)

    # (선택) 기존 상태 정리
    ap.active(False)
    time.sleep(0.2)

    ap.active(True)

    # WPA2 비번은 보통 8자 이상 필요
    ap.config(essid=ssid, password=password, channel=channel, authmode=network.AUTH_WPA_WPA2_PSK)

    print("AP active:", ap.active())
    print("AP ifconfig:", ap.ifconfig())
    return ap

wifi_ap_mode("pyD_AP", "12345678")
