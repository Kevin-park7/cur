import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget, QLabel
from PyQt5.QtCore import Qt
import ctypes
from ctypes import wintypes

class CursorClipboardHelper(QMainWindow):
    def __init__(self):
        super().__init__()
        self.initUI()
        
    def initUI(self):
        self.setWindowTitle('Cursor 클립보드 도우미')
        self.setGeometry(100, 100, 300, 150)
        
        # 중앙 위젯 생성
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 레이아웃 설정
        layout = QVBoxLayout()
        central_widget.setLayout(layout)
        
        # 설명 레이블
        label = QLabel('마우스로 클릭하여 복사/붙여넣기\n\n1. 텍스트 선택 후 "복사" 버튼 클릭\n2. 붙여넣을 위치 클릭 후 "붙여넣기" 버튼 클릭')
        label.setAlignment(Qt.AlignCenter)
        layout.addWidget(label)
        
        # 복사 버튼
        copy_btn = QPushButton('복사 (Ctrl+C)', self)
        copy_btn.clicked.connect(self.copy_text)
        layout.addWidget(copy_btn)
        
        # 붙여넣기 버튼
        paste_btn = QPushButton('붙여넣기 (Ctrl+V)', self)
        paste_btn.clicked.connect(self.paste_text)
        layout.addWidget(paste_btn)
        
        # 항상 위에 표시
        self.setWindowFlags(Qt.WindowStaysOnTopHint)
        
    def send_key(self, key_code, is_extended=False):
        KEYEVENTF_EXTENDEDKEY = 0x0001
        KEYEVENTF_KEYUP = 0x0002
        
        flags = KEYEVENTF_EXTENDEDKEY if is_extended else 0
        ctypes.windll.user32.keybd_event(key_code, 0, flags, 0)
        ctypes.windll.user32.keybd_event(key_code, 0, flags | KEYEVENTF_KEYUP, 0)
        
    def copy_text(self):
        # Ctrl 키 누르기
        ctypes.windll.user32.keybd_event(0x11, 0, 0, 0)  # VK_CONTROL
        # C 키 누르기
        self.send_key(0x43)  # VK_C
        # Ctrl 키 떼기
        ctypes.windll.user32.keybd_event(0x11, 0, 0x0002, 0)  # VK_CONTROL + KEYEVENTF_KEYUP
        
    def paste_text(self):
        # Ctrl 키 누르기
        ctypes.windll.user32.keybd_event(0x11, 0, 0, 0)  # VK_CONTROL
        # V 키 누르기
        self.send_key(0x56)  # VK_V
        # Ctrl 키 떼기
        ctypes.windll.user32.keybd_event(0x11, 0, 0x0002, 0)  # VK_CONTROL + KEYEVENTF_KEYUP

def main():
    app = QApplication(sys.argv)
    ex = CursorClipboardHelper()
    ex.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main() 