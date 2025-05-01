import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget, QLabel
from PyQt5.QtCore import Qt
import win32clipboard
import win32con

class ClipboardHelper(QMainWindow):
    def __init__(self):
        super().__init__()
        self.initUI()
        
    def initUI(self):
        self.setWindowTitle('클립보드 도우미')
        self.setGeometry(100, 100, 300, 200)
        
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
        
    def copy_text(self):
        # 현재 선택된 텍스트 복사
        win32clipboard.OpenClipboard()
        win32clipboard.EmptyClipboard()
        win32clipboard.CloseClipboard()
        
        # Ctrl+C 시뮬레이션
        import ctypes
        KEYEVENTF_KEYUP = 0x0002
        ctypes.windll.user32.keybd_event(0x11, 0, 0, 0)  # Ctrl down
        ctypes.windll.user32.keybd_event(0x43, 0, 0, 0)  # C down
        ctypes.windll.user32.keybd_event(0x43, 0, KEYEVENTF_KEYUP, 0)  # C up
        ctypes.windll.user32.keybd_event(0x11, 0, KEYEVENTF_KEYUP, 0)  # Ctrl up
        
    def paste_text(self):
        # Ctrl+V 시뮬레이션
        import ctypes
        KEYEVENTF_KEYUP = 0x0002
        ctypes.windll.user32.keybd_event(0x11, 0, 0, 0)  # Ctrl down
        ctypes.windll.user32.keybd_event(0x56, 0, 0, 0)  # V down
        ctypes.windll.user32.keybd_event(0x56, 0, KEYEVENTF_KEYUP, 0)  # V up
        ctypes.windll.user32.keybd_event(0x11, 0, KEYEVENTF_KEYUP, 0)  # Ctrl up

def main():
    app = QApplication(sys.argv)
    ex = ClipboardHelper()
    ex.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main() 