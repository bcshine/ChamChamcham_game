// ===============================
// 게임 상태 및 변수 초기화
// ===============================

// 게임의 현재 상태를 관리하는 변수 ('title': 타이틀 화면, 'game': 게임 중, 'gameover': 게임 종료)
let gameState = 'title';

// 게임 결과를 저장하는 변수 ('win': 플레이어 승리, 'lose': 고양이 승리, 'timeout': 시간 초과)
let gameResult = null;

// 고양이가 바라보는 방향 ('left': 왼쪽, 'right': 오른쪽)
let catDirection = null;

// 플레이어가 선택한 방향 ('left': 왼쪽, 'right': 오른쪽)
let playerChoice = null;

// 타이머 인터벌 ID (타이머를 중지할 때 사용)
let timerInterval = null;

// ===============================
// 게임 진행 상태 플래그
// ===============================

// 참참참 시퀀스가 시작되었는지 여부
let chamStarted = false;

// 방향 선택 버튼이 활성화되어 있는지 여부
let buttonEnabled = false;

// ===============================
// 사운드 관리 변수
// ===============================

// 웹 오디오 API 컨텍스트 (사운드 재생용)
let audioContext = null;

// 사운드가 활성화되어 있는지 여부
let soundEnabled = false;

// ===============================
// DOM 요소들 참조 저장
// ===============================

// 메인 화면들
const titleScreen = document.getElementById('titleScreen');        // 타이틀 화면
const gameScreen = document.getElementById('gameScreen');          // 게임 화면
const gameOverScreen = document.getElementById('gameOverScreen');  // 게임 오버 화면

// 버튼들
const startBtn = document.getElementById('startBtn');     // 게임 시작 버튼
const chamBtn = document.getElementById('chamBtn');       // 참참참 시작 버튼
const leftBtn = document.getElementById('leftBtn');       // 왼쪽 선택 버튼
const rightBtn = document.getElementById('rightBtn');     // 오른쪽 선택 버튼
const retryBtn = document.getElementById('retryBtn');     // 다시 하기 버튼
const titleBtn = document.getElementById('titleBtn');     // 처음으로 버튼

// 게임 UI 요소들
const statusText = document.getElementById('statusText');                 // 상태 텍스트
const catCharacter = document.getElementById('catCharacter');             // 고양이 캐릭터 컨테이너
const catImage = document.getElementById('catImage');                     // 고양이 이미지
const gameOverCatImage = document.getElementById('gameOverCatImage');     // 게임오버 화면 고양이 이미지
const chamSection = document.getElementById('chamSection');               // 참참참 버튼 섹션
const directionSection = document.getElementById('directionSection');     // 방향 선택 섹션
const timerBar = document.getElementById('timerBar');                     // 타이머 바 컨테이너
const timerFill = document.getElementById('timerFill');                   // 타이머 바 채우기
const resultSection = document.getElementById('resultSection');           // 결과 섹션
const resultText = document.getElementById('resultText');                 // 결과 텍스트
const buttonResult = document.getElementById('buttonResult');             // 버튼 선택 결과 텍스트
const finalResult = document.getElementById('finalResult');               // 최종 결과 텍스트
const chamTextDisplay = document.getElementById('chamTextDisplay');       // "참" 텍스트 오버레이
const resultPopup = document.getElementById('resultPopup');               // 결과 팝업 오버레이

// ===============================
// 고양이 이미지 경로 설정
// ===============================

// 고양이의 다양한 표정/방향 이미지 경로들
const catImages = {
    front: 'images/front.png',           // 정면
    left: 'images/left.png',             // 왼쪽 보기
    right: 'images/right.png',           // 오른쪽 보기
    sad: 'images/sad.png',               // 슬픈 표정
    congratulation: 'images/congraturation.png'  // 축하 표정
};

// ===============================
// 사운드 재생 함수
// ===============================

function playSound(type) {
    // AudioContext가 초기화되지 않았거나 비활성화된 경우 초기화 시도
    if (!audioContext || !soundEnabled) {
        initAudioContext();  // 오디오 컨텍스트 초기화 함수 호출
    }
    
    // 여전히 AudioContext가 없으면 사운드 재생을 포기하고 함수 종료
    if (!audioContext || !soundEnabled) {
        console.warn('사운드 재생 불가: AudioContext 없음');
        return;  // 함수 종료
    }
    
    try {
        // 사운드 타입별 주파수와 지속시간 설정
        let frequency;     // 소리 주파수 (Hz)
        let duration = 200; // 기본 지속시간 (ms)
        
        // 사운드 타입에 따른 주파수와 지속시간 설정
        switch(type) {
            case 'cham':      // 참! 소리
                frequency = 800;
                duration = 300;
                break;
            case 'button':    // 버튼 클릭 소리
                frequency = 600;
                duration = 150;
                break;
            case 'win':       // 승리 소리
                frequency = 1000;
                duration = 500;
                break;
            case 'lose':      // 패배 소리
                frequency = 400;
                duration = 500;
                break;
            case 'timeout':   // 시간 초과 소리
                frequency = 300;
                duration = 300;
                break;
            case 'click':     // 일반 클릭 소리
                frequency = 700;
                duration = 200;
                break;
            default:          // 기본 소리
                frequency = 500;
        }
        
        // 오시레이터(음성 생성기) 생성
        const oscillator = audioContext.createOscillator();
        // 볼륨 조절용 게인 노드 생성
        const gainNode = audioContext.createGain();
        
        // 오디오 노드들 연결: 오시레이터 → 게인노드 → 스피커
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 오시레이터 설정
        oscillator.frequency.value = frequency;  // 주파수 설정
        oscillator.type = 'sine';                // 사인파 형태의 소리
        
        // 볼륨 설정 (0.3에서 시작해서 서서히 감소)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        // 소리 재생 시작
        oscillator.start(audioContext.currentTime);
        // 지정된 시간 후 소리 재생 중지
        oscillator.stop(audioContext.currentTime + duration / 1000);
        
        // 디버깅용 로그 출력
        console.log(`사운드 재생: ${type} (${frequency}Hz, ${duration}ms)`);
        
    } catch (error) {
        // 사운드 재생 중 오류 발생 시 경고 출력
        console.warn('사운드 재생 중 오류:', error);
    }
}

// ===============================
// "참" 텍스트 표시 함수
// ===============================

function showChamText(text = '참') {
    // 디버깅용: 어떤 텍스트를 표시하는지 로그 출력
    console.log('참 텍스트 표시:', text);
    
    // 표시할 텍스트 설정
    chamTextDisplay.textContent = text;
    
    // 기존 CSS 클래스들 제거 (초기화)
    chamTextDisplay.classList.remove('hidden', 'show');
    
    // 브라우저의 리플로우(화면 재계산)를 위한 프레임 요청
    requestAnimationFrame(() => {
        // 애니메이션 시작을 위한 'show' 클래스 추가
        chamTextDisplay.classList.add('show');
        
        // 0.5초 후 텍스트 숨기기
        setTimeout(() => {
            chamTextDisplay.classList.remove('show');   // 애니메이션 클래스 제거
            chamTextDisplay.classList.add('hidden');    // 숨김 클래스 추가
        }, 500);  // 500ms = 0.5초
    });
}

// ===============================
// 고양이 이미지 변경 함수들
// ===============================

function setCatImage(imageType) {
    // 고양이 이미지 요소와 해당 이미지 타입이 존재하는지 확인
    if (catImage && catImages[imageType]) {
        // 이미지 소스 변경
        catImage.src = catImages[imageType];
        // 디버깅용 로그: 어떤 이미지로 변경되었는지 출력
        console.log('고양이 이미지 변경:', imageType, '→', catImages[imageType]);
    }
}

function setGameOverCatImage(imageType) {
    // 게임오버 화면의 고양이 이미지 요소와 해당 이미지 타입이 존재하는지 확인
    if (gameOverCatImage && catImages[imageType]) {
        // 게임오버 화면 고양이 이미지 소스 변경
        gameOverCatImage.src = catImages[imageType];
    }
}

function setCatExpression(expression) {
    // 기존 이모지 표정 시스템과의 호환성을 위해 유지되는 함수
    // 기존 표정 이름을 새로운 이미지 시스템으로 매핑
    switch(expression) {
        case 'default':     // 기본 표정
        case 'excited':     // 흥분한 표정
        case 'happy':       // 행복한 표정
            setCatImage('front');           // 정면 이미지 사용
            break;
        case 'surprised':   // 놀란 표정
            setCatImage('congratulation'); // 축하 이미지 사용
            break;
        case 'sad':         // 슬픈 표정
        case 'confused':    // 혼란스러운 표정
            setCatImage('sad');            // 슬픈 이미지 사용
            break;
        case 'smug':        // 으스댐한 표정
            setCatImage('front');          // 정면 이미지 사용
            break;
        default:            // 기타 모든 경우
            setCatImage('front');          // 기본적으로 정면 이미지 사용
    }
}

// ===============================
// 화면 전환 함수
// ===============================

function showScreen(screenName) {
    // 모든 화면을 숨김 처리
    titleScreen.classList.add('hidden');      // 타이틀 화면 숨김
    gameScreen.classList.add('hidden');       // 게임 화면 숨김
    gameOverScreen.classList.add('hidden');   // 게임오버 화면 숨김
    
    // 요청된 화면만 표시
    switch(screenName) {
        case 'title':     // 타이틀 화면 표시
            titleScreen.classList.remove('hidden');
            break;
        case 'game':      // 게임 화면 표시
            gameScreen.classList.remove('hidden');
            break;
        case 'gameover':  // 게임오버 화면 표시
            gameOverScreen.classList.remove('hidden');
            break;
    }
}

// ===============================
// 게임 초기화 함수
// ===============================

function initGame() {
    // 게임 상태 변수들 초기화
    gameResult = null;        // 게임 결과 초기화
    catDirection = null;      // 고양이 방향 초기화
    playerChoice = null;      // 플레이어 선택 초기화
    chamStarted = false;      // 참참참 시작 상태 초기화
    buttonEnabled = false;    // 버튼 활성화 상태 초기화
    
    // UI 상태 초기화
    statusText.textContent = '준비!';    // 상태 텍스트를 "준비!"로 설정
    setCatExpression('default');         // 고양이를 기본 표정으로 설정
    
    // 고양이 이미지를 정면으로 설정
    setCatImage('front');
    
    // 고양이 캐릭터의 CSS 클래스 초기화
    catCharacter.className = 'cat-character large';  // 기본 클래스 설정
    catCharacter.classList.remove('turn-left', 'turn-right');  // 방향 전환 클래스 제거
    
    // 디버깅용 로그
    console.log('게임 초기화 후 고양이 상태: 정면 이미지');
    
    // UI 요소들 표시/숨김 설정
    chamSection.style.display = 'block';           // 참참참 섹션 표시
    timerBar.classList.add('hidden');              // 타이머 바 숨김
    resultSection.classList.add('hidden');         // 결과 섹션 숨김
    chamTextDisplay.classList.add('hidden');       // "참" 텍스트 숨김
    resultPopup.classList.add('hidden');           // 결과 팝업 숨김
    
    // 버튼 상태 초기화
    chamBtn.disabled = false;    // 참참참 버튼 활성화
    leftBtn.disabled = true;     // 왼쪽 버튼 비활성화
    rightBtn.disabled = true;    // 오른쪽 버튼 비활성화
    
    // 버튼 선택 효과 제거
    leftBtn.classList.remove('selected');   // 왼쪽 버튼 선택 효과 제거
    rightBtn.classList.remove('selected');  // 오른쪽 버튼 선택 효과 제거
}

// ===============================
// 참참참 시퀀스 시작 함수
// ===============================

function startChamSequence() {
    // 디버깅용: 참참참 시퀀스 시작 로그
    console.log('참참참 시퀀스 시작');
    
    // 참참참 버튼 비활성화 (중복 클릭 방지)
    chamBtn.disabled = true;
    // 참참참 시작 플래그 설정
    chamStarted = true;
    
    // 즉시 방향 버튼 활성화 (게임 규칙에 따라)
    buttonEnabled = true;        // 버튼 활성화 플래그 설정
    leftBtn.disabled = false;    // 왼쪽 버튼 활성화
    rightBtn.disabled = false;   // 오른쪽 버튼 활성화
    
    // 상태 텍스트 업데이트
    statusText.textContent = '참참참 시퀀스 시작!';
    // 고양이를 흥분한 표정으로 변경
    setCatExpression('excited');
    
    // 첫 번째 "참!" - 300ms 후 실행
    setTimeout(() => {
        console.log('첫 번째 참');                    // 디버깅용 로그
        setTimeout(() => playSound('cham'), 50);      // 50ms 지연 후 소리 재생 (동기화)
        showChamText('참');                           // "참" 텍스트 표시
        
        // 고양이 점프 애니메이션 (위로 10px 이동)
        catCharacter.style.transform = 'translateY(-10px)';
        // 200ms 후 원래 위치로 복귀
        setTimeout(() => {
            catCharacter.style.transform = 'translateY(0)';
        }, 200);
    }, 300);  // 300ms 지연
    
    // 두 번째 "참!" - 1100ms 후 실행 (첫 번째 "참" 후 0.8초)
    setTimeout(() => {
        console.log('두 번째 참');                    // 디버깅용 로그
        setTimeout(() => playSound('cham'), 50);      // 50ms 지연 후 소리 재생 (동기화)
        showChamText('참');                           // "참" 텍스트 표시
        
        // 고양이 확대 애니메이션 (1.1배 크기)
        catCharacter.style.transform = 'scale(1.1)';
        // 200ms 후 원래 크기로 복귀
        setTimeout(() => {
            catCharacter.style.transform = 'scale(1)';
        }, 200);
    }, 1100);  // 1100ms 지연 (첫 번째 "참" 후 0.8초)
    
    // 세 번째 "참!" - 1900ms 후 실행 (두 번째 "참" 후 0.8초)
    // 이 시점에서 고양이 방향 결정 및 최종 입력 확정 시작
    setTimeout(() => {
        console.log('세 번째 참!');                   // 디버깅용 로그
        setTimeout(() => playSound('cham'), 50);      // 50ms 지연 후 소리 재생 (동기화)
        showChamText('참!');                          // "참!" 텍스트 표시 (느낌표 추가)
        
        // 고양이 방향 랜덤 결정 (50% 확률로 왼쪽 또는 오른쪽)
        catDirection = Math.random() < 0.5 ? 'left' : 'right';
        console.log('🎲 고양이 방향 결정:', catDirection);
        
        // 최종 입력 확정 시간 시작
        startFinalInputTimer();
    }, 1900);  // 1900ms 지연 (두 번째 "참" 후 0.8초)
}

// ===============================
// 최종 입력 확정 타이머 시작 함수
// ===============================

function startFinalInputTimer() {
    // 디버깅용: 최종 입력 확정 시간 시작 로그
    console.log('최종 입력 확정 시간 시작, 고양이 방향:', catDirection);
    
    // 상태 텍스트를 긴급 메시지로 변경
    statusText.textContent = '지금 선택!';
    // 고양이를 기본 표정으로 설정
    setCatExpression('default');
    
    // 고양이 얼굴 방향 바꾸기 - 100ms 후 실행
    setTimeout(() => {
        console.log('🐱 고양이 얼굴 방향 바꾸기! 방향:', catDirection);
        
        // 결정된 방향에 따라 고양이 이미지 변경
        if (catDirection === 'left') {
            console.log('⬅️ 왼쪽 이미지로 변경!');
            setCatImage('left');      // 왼쪽 바라보는 이미지
        } else {
            console.log('➡️ 오른쪽 이미지로 변경!');
            setCatImage('right');     // 오른쪽 바라보는 이미지
        }
        
        // 고양이 방향 전환 효과음 재생
        playSound('click');
        
    }, 100);  // 100ms 짧은 지연시간
    
    // 타이머 바 표시 (사용자에게 남은 시간 시각적으로 알림)
    timerBar.classList.remove('hidden');
    
    // 타이머 시작 (0.7초 동안 카운트다운)
    let timeLeft = 100;                    // 타이머 진행률 (100%에서 시작)
    timerFill.style.width = '100%';        // 타이머 바를 100%로 초기화
    
    // 성능 개선: 타이머 인터벌을 30ms로 증가 (기존 14ms에서 개선)
    timerInterval = setInterval(() => {
        timeLeft -= 4.3;                   // 매 30ms마다 4.3% 감소 (700ms/30ms = 23회, 100/23 ≈ 4.3)
        timerFill.style.width = timeLeft + '%';  // 타이머 바 너비 업데이트
        
        // 타이머가 0에 도달했을 때
        if (timeLeft <= 0) {
            clearInterval(timerInterval);   // 타이머 중지
            // 플레이어가 선택하지 않았으면 시간 초과 처리
            if (playerChoice === null) {
                gameTimeout();              // 시간 초과 함수 호출
            } else {
                finalizeBattle();           // 배틀 확정 함수 호출
            }
        }
    }, 30);  // 30ms 간격으로 실행 (성능 개선)
}

// ===============================
// 방향 선택 처리 함수
// ===============================

function selectDirection(direction) {
    // 버튼이 아직 활성화되지 않았으면 함수 종료
    if (!buttonEnabled) return;
    
    // 디버깅용: 플레이어 선택 로그
    console.log('👆 플레이어가 버튼 클릭:', direction);
    console.log('🐱 현재 고양이 방향:', catDirection);
    
    // 이전 선택 효과 제거 (모든 버튼에서 선택 클래스 제거)
    leftBtn.classList.remove('selected');
    rightBtn.classList.remove('selected');
    
    // 플레이어의 새로운 선택 저장
    playerChoice = direction;
    // 버튼 클릭 효과음 재생
    playSound('click');
    
    // 디버깅용: 선택 저장 확인 로그
    console.log('💾 플레이어 선택 저장:', playerChoice);
    
    // 선택된 버튼에 시각적 강조 효과 추가
    if (direction === 'left') {
        leftBtn.classList.add('selected');      // 왼쪽 버튼 강조
    } else {
        rightBtn.classList.add('selected');     // 오른쪽 버튼 강조
    }
    
    // 선택 결과를 화면에 표시
    buttonResult.textContent = `선택: ${direction === 'left' ? '← 왼쪽' : '→ 오른쪽'}`;
    
    // 200ms 후 즉시 결과 판정 표시
    setTimeout(() => {
        showInstantResult();                    // 즉시 결과 표시 함수 호출
    }, 200);
}

// ===============================
// 결과 팝업 표시 함수
// ===============================

function showResultPopup(isVictory, text) {
    // 디버깅용: 결과 팝업 표시 로그
    console.log('🎭 결과 팝업 표시:', text, isVictory ? '승리' : '패배');
    
    // 팝업에 표시할 텍스트 설정
    resultPopup.textContent = text;
    
    // 기존 CSS 클래스들 제거 (초기화)
    resultPopup.classList.remove('hidden', 'victory', 'defeat');
    
    // 승리/패배에 따른 새로운 클래스 추가
    if (isVictory) {
        resultPopup.classList.add('victory');   // 승리 스타일 적용
    } else {
        resultPopup.classList.add('defeat');    // 패배 스타일 적용
    }
    
    // 2초 후 팝업 숨기기
    setTimeout(() => {
        resultPopup.classList.add('hidden');              // 팝업 숨김
        resultPopup.classList.remove('victory', 'defeat'); // 스타일 클래스 제거
    }, 2000);  // 2000ms = 2초
}

// ===============================
// 즉시 결과 표시 함수 (플레이어가 선택하는 순간)
// ===============================

function showInstantResult() {
    // 타이머 중지 (더 이상 시간이 흐르지 않도록)
    clearInterval(timerInterval);
    // 입력 비활성화 (추가 선택 방지)
    buttonEnabled = false;
    
    // 모든 방향 버튼 비활성화
    leftBtn.disabled = true;     // 왼쪽 버튼 비활성화
    rightBtn.disabled = true;    // 오른쪽 버튼 비활성화
    
    // 승패 판정 과정을 디버깅용으로 출력
    console.log('🎯 승패 판정:');
    console.log('- 고양이 방향:', catDirection);
    console.log('- 플레이어 선택:', playerChoice);
    console.log('- 같은가?', playerChoice === catDirection);
    
    // 결과 판정: 고양이 방향과 플레이어 선택이 같은지 비교
    if (playerChoice === catDirection) {
        // 🎉 승리 처리
        gameResult = 'win';                           // 게임 결과를 승리로 설정
        
        showResultPopup(true, '플레이어 승리');        // 승리 팝업 표시
        statusText.textContent = '축하드려요!';        // 상태 텍스트 변경
        
        setCatExpression('surprised');                // 고양이를 놀란 표정으로 변경
        playSound('win');                             // 승리 효과음 재생
        console.log('✅ 승리! 방향이 일치함');          // 디버깅용 로그
    } else {
        // 😅 패배 처리
        gameResult = 'lose';                          // 게임 결과를 패배로 설정
        
        showResultPopup(false, '고양이 승리');         // 패배 팝업 표시
        statusText.textContent = 'ㅋㅋㅋ^^';         // 상태 텍스트 변경
        
        setCatExpression('sad');                      // 고양이를 슬픈 표정으로 변경
        playSound('lose');                            // 패배 효과음 재생
        console.log('❌ 패배! 방향이 다름');           // 디버깅용 로그
    }
    
    // 2.5초 후 바로 게임 오버 화면으로 전환 (중간 결과 화면 건너뛰기)
    setTimeout(() => {
        showGameOver();                               // 게임 오버 화면으로 바로 이동
    }, 2500);  // 팝업이 표시될 시간을 고려해서 조금 더 길게 설정
}

// ===============================
// 최종 배틀 확정 함수
// ===============================

function finalizeBattle() {
    // 이미 결과가 있으면 중복 처리 방지를 위해 함수 종료
    if (gameResult !== null) return;
    
    // 디버깅용: 최종 배틀 확정 로그
    console.log('최종 배틀 확정');
    
    // 입력 비활성화 (추가 선택 방지)
    buttonEnabled = false;
    
    // 모든 방향 버튼 비활성화
    leftBtn.disabled = true;     // 왼쪽 버튼 비활성화
    rightBtn.disabled = true;    // 오른쪽 버튼 비활성화
    
    // 타이머 중지
    clearInterval(timerInterval);
    
    // 결과 판정 후 바로 게임 오버 화면으로 이동
    if (playerChoice === null) {
        gameResult = 'timeout';                      // 선택이 없으면 시간 초과
    } else if (playerChoice === catDirection) {
        gameResult = 'win';                         // 방향이 같으면 승리
    } else {
        gameResult = 'lose';                        // 방향이 다르면 패배
    }
    
    // 300ms 후 바로 게임 오버 화면으로 이동
    setTimeout(() => {
        showGameOver();                             // 게임 오버 화면으로 바로 이동
    }, 300);
}

// ===============================
// 시간 초과 처리 함수
// ===============================

function gameTimeout() {
    // 이미 결과가 있으면 중복 처리 방지를 위해 함수 종료
    if (gameResult !== null) return;
    
    // 시간 초과 처리
    gameResult = 'timeout';                      // 게임 결과를 시간 초과로 설정
    buttonEnabled = false;                       // 입력 비활성화
    statusText.textContent = '시간 초과!';        // 상태 텍스트 변경
    setCatExpression('confused');                // 고양이를 혼란스러운 표정으로 변경
    playSound('timeout');                        // 시간 초과 효과음 재생
    
    // 모든 방향 버튼 비활성화
    leftBtn.disabled = true;     // 왼쪽 버튼 비활성화
    rightBtn.disabled = true;    // 오른쪽 버튼 비활성화
    
    // 500ms 후 바로 게임 오버 화면으로 이동
    setTimeout(() => {
        showGameOver();                          // 게임 오버 화면으로 바로 이동
    }, 500);
}

// ===============================
// 결과 표시 함수
// ===============================

function showResult() {
    // 고양이 방향은 이미 이미지로 표시되었으므로 추가 처리 불필요
    
    // 결과 판정 (아직 판정되지 않았다면 재판정)
    if (gameResult === null) {
        if (playerChoice === null) {
            gameResult = 'timeout';                     // 선택이 없으면 시간 초과
        } else if (playerChoice === catDirection) {
            gameResult = 'win';                         // 방향이 같으면 승리
        } else {
            gameResult = 'lose';                        // 방향이 다르면 패배
        }
    }
    
    // UI 요소들 숨기기 및 결과 섹션 표시
    chamSection.style.display = 'none';                // 참참참 섹션 숨김
    timerBar.classList.add('hidden');                  // 타이머 바 숨김
    resultSection.classList.remove('hidden');          // 결과 섹션 표시
    
    // 게임 결과에 따른 메시지 및 효과 설정
    switch(gameResult) {
        case 'win':     // 승리 처리
            resultText.textContent = '플레이어 승리! 🎉';        // 결과 텍스트 설정
            resultText.className = 'result-text win';           // 승리 스타일 적용
            // 중복 승리 처리 방지
            if (statusText.textContent !== '플레이어 승리') {
                statusText.textContent = '축하드려요!';          // 상태 텍스트 변경
                setCatExpression('surprised');                  // 고양이 놀란 표정
                playSound('win');                               // 승리 효과음
            }
            break;
        case 'lose':    // 패배 처리
            resultText.textContent = '고양이이 승리! 😅';          // 결과 텍스트 설정
            resultText.className = 'result-text lose';          // 패배 스타일 적용
            // 중복 패배 처리 방지
            if (statusText.textContent !== '고양이 승리') {
                statusText.textContent = '안타까워요';           // 상태 텍스트 변경
                setCatExpression('sad');                        // 고양이 슬픈 표정
                playSound('lose');                              // 패배 효과음
            }
            break;
        case 'timeout': // 시간 초과 처리
            resultText.textContent = '시간 초과! ⏰';            // 결과 텍스트 설정
            resultText.className = 'result-text timeout';       // 시간 초과 스타일 적용
            statusText.textContent = '너무 늦었다냥!';           // 상태 텍스트 변경
            setCatExpression('confused');                       // 고양이 혼란 표정
            buttonResult.textContent = '선택 없음';              // 버튼 결과 텍스트
            break;
    }
    
    // 2초 후 게임 오버 화면으로 전환
    setTimeout(() => {
        showGameOver();                                         // 게임 오버 화면 표시 함수 호출
    }, 2000);
}

// ===============================
// 게임 오버 화면 표시 함수
// ===============================

function showGameOver() {
    let resultMessage;  // 최종 결과 메시지 변수
    
    // 게임 결과에 따른 메시지 및 고양이 이미지 설정
    switch(gameResult) {
        case 'win':     // 승리 시
            resultMessage = '플레이어 승리! 🎉';
            setGameOverCatImage('congratulation');              // 축하 이미지 설정
            break;
        case 'lose':    // 패배 시
            resultMessage = '고양이 승리! 😅';
            setGameOverCatImage('sad');                         // 슬픈 이미지 설정
            break;
        case 'timeout': // 시간 초과 시
            resultMessage = '시간 초과! ⏰';
            setGameOverCatImage('sad');                         // 슬픈 이미지 설정
            break;
    }
    
    // 최종 결과 메시지 설정 및 게임 오버 화면 표시
    finalResult.textContent = resultMessage;                    // 최종 결과 텍스트 설정
    showScreen('gameover');                                     // 게임 오버 화면으로 전환
}

// ===============================
// 게임 재시작 함수
// ===============================

function restartGame() {
    playSound('button');        // 버튼 클릭 효과음 재생
    showScreen('game');         // 게임 화면으로 전환
    initGame();                 // 게임 초기화 함수 호출
}

// ===============================
// 타이틀 화면으로 돌아가기 함수
// ===============================

function goToTitle() {
    playSound('button');        // 버튼 클릭 효과음 재생
    showScreen('title');        // 타이틀 화면으로 전환
    gameState = 'title';        // 게임 상태를 타이틀로 변경
}

// ===============================
// 이벤트 리스너 등록
// ===============================

// 디버깅용: DOM 요소들이 제대로 로드되었는지 확인
console.log('DOM 요소 확인:', {
    startBtn: startBtn,         // 시작 버튼
    chamBtn: chamBtn,           // 참참참 버튼
    leftBtn: leftBtn,           // 왼쪽 버튼
    rightBtn: rightBtn,         // 오른쪽 버튼
    retryBtn: retryBtn,         // 다시하기 버튼
    titleBtn: titleBtn          // 처음으로 버튼
});

// 게임 시작 버튼 이벤트 리스너
startBtn.addEventListener('click', () => {
    console.log('도전 버튼 클릭됨!');                            // 디버깅용 로그
    
    // 첫 번째 사용자 인터랙션에서 AudioContext 초기화
    initAudioContext();                                         // 오디오 컨텍스트 초기화
    
    playSound('button');                                        // 버튼 클릭 효과음
    showScreen('game');                                         // 게임 화면으로 전환
    initGame();                                                 // 게임 초기화
    gameState = 'game';                                         // 게임 상태를 'game'으로 변경
});

// 참참참 시작 버튼 이벤트 리스너
chamBtn.addEventListener('click', () => {
    console.log('참참참 버튼 클릭됨!');                          // 디버깅용 로그
    // 참참참이 아직 시작되지 않았다면 시작
    if (!chamStarted) {
        playSound('button');                                    // 버튼 클릭 효과음
        startChamSequence();                                    // 참참참 시퀀스 시작
    }
});

// 왼쪽 방향 선택 버튼 이벤트 리스너
leftBtn.addEventListener('click', () => {
    console.log('왼쪽 버튼 클릭됨!');                            // 디버깅용 로그
    selectDirection('left');                                    // 왼쪽 방향 선택 함수 호출
});

// 오른쪽 방향 선택 버튼 이벤트 리스너
rightBtn.addEventListener('click', () => {
    console.log('오른쪽 버튼 클릭됨!');                          // 디버깅용 로그
    selectDirection('right');                                   // 오른쪽 방향 선택 함수 호출
});

// 다시하기 버튼 이벤트 리스너
retryBtn.addEventListener('click', () => {
    console.log('다시하기 버튼 클릭됨!');                        // 디버깅용 로그
    restartGame();                                              // 게임 재시작 함수 호출
});

// 처음으로 버튼 이벤트 리스너
titleBtn.addEventListener('click', () => {
    console.log('처음으로 버튼 클릭됨!');                        // 디버깅용 로그
    goToTitle();                                                // 타이틀 화면으로 이동 함수 호출
});

// ===============================
// 키보드 지원 이벤트 리스너
// ===============================

document.addEventListener('keydown', (e) => {
    // 게임 중이고 버튼이 활성화된 상태에서만 키보드 입력 처리
    if (gameState === 'game' && buttonEnabled) {
        // 왼쪽 화살표, A 키, a 키 입력 시 왼쪽 선택
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            selectDirection('left');                            // 왼쪽 방향 선택
        } 
        // 오른쪽 화살표, D 키, d 키 입력 시 오른쪽 선택
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            selectDirection('right');                           // 오른쪽 방향 선택
        }
    }
});

// ===============================
// 페이지 로드 완료 이벤트 리스너
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    showScreen('title');        // 페이지 로드 완료 시 타이틀 화면 표시
});

// ===============================
// 오디오 컨텍스트 초기화 함수
// ===============================

function initAudioContext() {
    try {
        // AudioContext가 아직 생성되지 않았다면 생성
        if (!audioContext) {
            // 브라우저 호환성을 위해 AudioContext 또는 webkitAudioContext 사용
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            soundEnabled = true;                                // 사운드 활성화 플래그 설정
            console.log('AudioContext 초기화 성공');             // 성공 로그
        }
        
        // AudioContext가 일시 중단된 상태라면 재개
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed');           // 재개 완료 로그
            });
        }
    } catch (error) {
        // AudioContext 초기화 실패 시 에러 처리
        console.warn('AudioContext 초기화 실패:', error);
        soundEnabled = false;                                   // 사운드 비활성화
    }
} 