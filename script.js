// 게임 상태 관리
let gameState = 'title'; // 'title', 'game', 'gameover'
let gameResult = null; // 'win', 'lose', 'timeout'
let catDirection = null; // 'left', 'right'
let playerChoice = null; // 'left', 'right'
let timerInterval = null;

// 게임 진행 상태
let chamStarted = false;
let buttonEnabled = false; // 방향 버튼 활성화 여부

// DOM 요소들
const titleScreen = document.getElementById('titleScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

const startBtn = document.getElementById('startBtn');
const chamBtn = document.getElementById('chamBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const retryBtn = document.getElementById('retryBtn');
const titleBtn = document.getElementById('titleBtn');

const statusText = document.getElementById('statusText');
const catCharacter = document.getElementById('catCharacter');
const chamSection = document.getElementById('chamSection');
const directionSection = document.getElementById('directionSection');
const timerBar = document.getElementById('timerBar');
const timerFill = document.getElementById('timerFill');
const resultSection = document.getElementById('resultSection');
const resultText = document.getElementById('resultText');
const buttonResult = document.getElementById('buttonResult');
const finalResult = document.getElementById('finalResult');
const chamTextDisplay = document.getElementById('chamTextDisplay');
const resultPopup = document.getElementById('resultPopup');

// 고양이 표정들
const catExpressions = {
    default: '😸',      // 기본 웃는 얼굴
    excited: '😺',      // 신나는 얼굴
    surprised: '🙀',    // 놀란 얼굴
    happy: '😻',        // 심장 눈 얼굴
    sad: '😿',          // 슬픈 얼굴
    smug: '😼',         // 능글맞은 얼굴
    confused: '😾'      // 어리둥절한 얼굴
};

// 사운드 효과 (간단한 Beep 사운드 구현)
function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let frequency;
    let duration = 200;
    
    switch(type) {
        case 'cham':
            frequency = 800;
            duration = 300;
            break;
        case 'button':
            frequency = 600;
            duration = 150;
            break;
        case 'win':
            frequency = 1000;
            duration = 500;
            break;
        case 'lose':
            frequency = 400;
            duration = 500;
            break;
        case 'timeout':
            frequency = 300;
            duration = 300;
            break;
        case 'click':
            frequency = 700;
            duration = 200;
            break;
        default:
            frequency = 500;
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

// 참 텍스트 표시 함수 (0.5초, 애니메이션 포함)
function showChamText(text = '참') {
    console.log('참 텍스트 표시:', text); // 디버깅용
    
    // 텍스트 설정
    chamTextDisplay.textContent = text;
    
    // 클래스 초기화 후 표시
    chamTextDisplay.classList.remove('hidden', 'show');
    
    // 브라우저 리플로우를 위한 짧은 지연
    requestAnimationFrame(() => {
        chamTextDisplay.classList.add('show');
        
        // 0.5초 후 숨기기
        setTimeout(() => {
            chamTextDisplay.classList.remove('show');
            chamTextDisplay.classList.add('hidden');
        }, 500);
    });
}

// 고양이 표정 변경 함수
function setCatExpression(expression) {
    catCharacter.textContent = catExpressions[expression];
}

// 화면 전환 함수
function showScreen(screenName) {
    titleScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    switch(screenName) {
        case 'title':
            titleScreen.classList.remove('hidden');
            break;
        case 'game':
            gameScreen.classList.remove('hidden');
            break;
        case 'gameover':
            gameOverScreen.classList.remove('hidden');
            break;
    }
}

// 게임 초기화
function initGame() {
    gameResult = null;
    catDirection = null;
    playerChoice = null;
    chamStarted = false;
    buttonEnabled = false;
    
    // UI 초기화
    statusText.textContent = '준비!';
    setCatExpression('default');
    
    // 고양이 스타일 완전 초기화
    catCharacter.className = 'cat-character large';
    catCharacter.classList.remove('turn-left', 'turn-right');
    catCharacter.style.transform = 'none';
    catCharacter.style.transition = '';
    
    // 잠시 후 다시 확인하여 완전 초기화
    setTimeout(() => {
        catCharacter.style.transform = '';
        console.log('게임 초기화 후 고양이 상태:', catCharacter.className, catCharacter.style.transform);
    }, 100);
    
    chamSection.style.display = 'block';
    timerBar.classList.add('hidden');
    resultSection.classList.add('hidden');
    chamTextDisplay.classList.add('hidden');
    resultPopup.classList.add('hidden'); // 결과 팝업도 숨기기
    
    // 버튼 상태 초기화 - 방향 버튼은 비활성화로 시작
    chamBtn.disabled = false;
    leftBtn.disabled = true;
    rightBtn.disabled = true;
    
    // 버튼 선택 효과 제거
    leftBtn.classList.remove('selected');
    rightBtn.classList.remove('selected');
}

// 참참참 시퀀스 시작
function startChamSequence() {
    console.log('참참참 시퀀스 시작'); // 디버깅용
    
    chamBtn.disabled = true;
    chamStarted = true;
    
    // 즉시 방향 버튼 활성화 (스크립트에 따름)
    buttonEnabled = true;
    leftBtn.disabled = false;
    rightBtn.disabled = false;
    
    statusText.textContent = '참참참 시퀀스 시작!';
    setCatExpression('excited');
    
    // 첫 번째 "참!"
    setTimeout(() => {
        console.log('첫 번째 참'); // 디버깅용
        playSound('cham');
        showChamText('참');
        catCharacter.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            catCharacter.style.transform = 'translateY(0)';
        }, 200);
    }, 300);
    
    // 두 번째 "참!"
    setTimeout(() => {
        console.log('두 번째 참'); // 디버깅용
        playSound('cham');
        showChamText('참');
        catCharacter.style.transform = 'scale(1.1)';
        setTimeout(() => {
            catCharacter.style.transform = 'scale(1)';
        }, 200);
    }, 1100); // 첫 번째 "참" 후 0.5초 + 0.3초
    
    // 세 번째 "참!" - 고양이 방향 결정 및 최종 입력 확정 시작
    setTimeout(() => {
        console.log('세 번째 참!'); // 디버깅용
        playSound('cham');
        showChamText('참!'); // 느낌표 추가
        
        // 고양이 방향 랜덤 결정
        catDirection = Math.random() < 0.5 ? 'left' : 'right';
        console.log('🎲 고양이 방향 결정:', catDirection);
        
        // 최종 입력 확정 시간 시작
        startFinalInputTimer();
    }, 1900); // 두 번째 "참" 후 0.5초 + 0.3초
}

// 최종 입력 확정 시간 시작 (세 번째 "참!" 이후 짧은 시간)
function startFinalInputTimer() {
    console.log('최종 입력 확정 시간 시작, 고양이 방향:', catDirection); // 디버깅용
    
    statusText.textContent = '지금 선택!';
    setCatExpression('default');
    
    // 고양이 얼굴 돌리기! 다양한 방법으로 시도
    setTimeout(() => {
        console.log('🐱 고양이 얼굴 돌리기 시작! 방향:', catDirection);
        
        // 방법 1: 모든 기존 클래스와 스타일 완전 제거
        catCharacter.className = 'cat-character large';
        catCharacter.style.cssText = '';
        
        // 방법 2: 강제로 리플로우 발생
        catCharacter.offsetHeight;
        
        // 방법 3: 클래스와 인라인 스타일 동시 적용
        if (catDirection === 'left') {
            console.log('⬅️ 왼쪽으로 돌리기!');
            
            // 클래스 추가
            catCharacter.classList.add('turn-left');
            
            // 직접 스타일 적용 (다중 방법)
            catCharacter.style.transform = 'rotate(-25deg) translateX(-20px)';
            catCharacter.style.transition = 'all 0.6s ease';
            catCharacter.style.filter = 'drop-shadow(5px 5px 10px rgba(255, 0, 0, 0.8))';
            
            // 백업 방법: CSS 변수 사용
            catCharacter.style.setProperty('--turn-direction', '-25deg');
            
        } else {
            console.log('➡️ 오른쪽으로 돌리기!');
            
            // 클래스 추가
            catCharacter.classList.add('turn-right');
            
            // 직접 스타일 적용 (다중 방법)
            catCharacter.style.transform = 'rotate(25deg) translateX(20px)';
            catCharacter.style.transition = 'all 0.6s ease';
            catCharacter.style.filter = 'drop-shadow(-5px 5px 10px rgba(0, 0, 255, 0.8))';
            
            // 백업 방법: CSS 변수 사용
            catCharacter.style.setProperty('--turn-direction', '25deg');
        }
        
        // 방법 4: 강제로 스타일 재적용
        setTimeout(() => {
            if (catDirection === 'left') {
                catCharacter.style.transform = 'rotate(-25deg) translateX(-20px)';
            } else {
                catCharacter.style.transform = 'rotate(25deg) translateX(20px)';
            }
        }, 50);
        
        // 고양이 돌아가는 효과음
        playSound('click');
        
        // 확인용 로그
        setTimeout(() => {
            console.log('🔍 현재 고양이 상태:');
            console.log('- 클래스:', catCharacter.className);
            console.log('- Transform:', catCharacter.style.transform);
            console.log('- 계산된 스타일:', window.getComputedStyle(catCharacter).transform);
        }, 100);
        
    }, 100); // 짧은 지연시간
    
    // 타이머 바 표시
    timerBar.classList.remove('hidden');
    
    // 타이머 시작 (0.5-0.7초) - 세 번째 "참!" 텍스트와 동시에 시작
    let timeLeft = 100;
    timerFill.style.width = '100%';
    
    timerInterval = setInterval(() => {
        timeLeft -= 2;
        timerFill.style.width = timeLeft + '%';
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (playerChoice === null) {
                gameTimeout();
            } else {
                finalizeBattle();
            }
        }
    }, 14); // 0.7초 = 700ms, 700/50 = 14ms 간격
}

// 방향 선택 처리
function selectDirection(direction) {
    if (!buttonEnabled) return; // 아직 활성화되지 않음
    
    console.log('👆 플레이어가 버튼 클릭:', direction);
    console.log('🐱 현재 고양이 방향:', catDirection);
    
    // 이전 선택 취소 효과 제거
    leftBtn.classList.remove('selected');
    rightBtn.classList.remove('selected');
    
    // 새로운 선택
    playerChoice = direction;
    playSound('click');
    
    console.log('💾 플레이어 선택 저장:', playerChoice);
    
    // 선택된 버튼 강조
    if (direction === 'left') {
        leftBtn.classList.add('selected');
    } else {
        rightBtn.classList.add('selected');
    }
    
    // 선택 결과 표시
    buttonResult.textContent = `선택: ${direction === 'left' ? '← 왼쪽' : '→ 오른쪽'}`;
    
    // 즉시 결과 판정 표시 (고양이는 이미 돌아간 상태)
    setTimeout(() => {
        showInstantResult();
    }, 200);
}

// 결과 팝업 표시 함수
function showResultPopup(isVictory, text) {
    console.log('🎭 결과 팝업 표시:', text, isVictory ? '승리' : '패배');
    
    // 팝업 텍스트 설정
    resultPopup.textContent = text;
    
    // 기존 클래스 제거
    resultPopup.classList.remove('hidden', 'victory', 'defeat');
    
    // 새로운 클래스 추가
    if (isVictory) {
        resultPopup.classList.add('victory');
    } else {
        resultPopup.classList.add('defeat');
    }
    
    // 2초 후 숨기기
    setTimeout(() => {
        resultPopup.classList.add('hidden');
        resultPopup.classList.remove('victory', 'defeat');
    }, 2000);
}

// 즉시 결과 표시 (플레이어가 선택하는 순간)
function showInstantResult() {
    // 타이머 중지
    clearInterval(timerInterval);
    buttonEnabled = false; // 입력 비활성화
    
    // 버튼 비활성화
    leftBtn.disabled = true;
    rightBtn.disabled = true;
    
    // 승패 판정 디버깅
    console.log('🎯 승패 판정:');
    console.log('- 고양이 방향:', catDirection);
    console.log('- 플레이어 선택:', playerChoice);
    console.log('- 같은가?', playerChoice === catDirection);
    
    // 결과 판정
    if (playerChoice === catDirection) {
        gameResult = 'win';
        
        // 🎉 승리 팝업 표시
        showResultPopup(true, '플레이어 승리');
        statusText.textContent = '플레이어 승리';
        
        setCatExpression('surprised'); // 놀란 표정
        playSound('win');
        console.log('✅ 승리! 방향이 일치함');
    } else {
        gameResult = 'lose';
        
        // 😅 패배 팝업 표시
        showResultPopup(false, '플레이어 패배');
        statusText.textContent = '플레이어 패배';
        
        setCatExpression('smug'); // 득의양양한 표정
        playSound('lose');
        console.log('❌ 패배! 방향이 다름');
    }
    
    // 잠시 후 정식 결과 화면으로
    setTimeout(() => {
        showResult();
    }, 2500); // 팝업이 표시될 시간을 고려해서 조금 더 길게
}

// 최종 배틀 확정
function finalizeBattle() {
    if (gameResult !== null) return; // 이미 결과가 있으면 무시
    
    console.log('최종 배틀 확정'); // 디버깅용
    
    buttonEnabled = false; // 입력 비활성화
    
    // 버튼 비활성화
    leftBtn.disabled = true;
    rightBtn.disabled = true;
    
    // 타이머 중지
    clearInterval(timerInterval);
    
    // 결과 표시
    setTimeout(() => {
        showResult();
    }, 300);
}

// 시간 초과 처리
function gameTimeout() {
    if (gameResult !== null) return; // 이미 결과가 있으면 무시
    
    gameResult = 'timeout';
    buttonEnabled = false;
    statusText.textContent = '시간 초과!';
    setCatExpression('confused');
    playSound('timeout');
    
    // 버튼 비활성화
    leftBtn.disabled = true;
    rightBtn.disabled = true;
    
    setTimeout(() => {
        showResult();
    }, 500);
}

// 결과 표시
function showResult() {
    // 고양이 방향 표시 (아직 돌리지 않았다면)
    if (!catCharacter.classList.contains('turn-left') && !catCharacter.classList.contains('turn-right')) {
        if (catDirection === 'left') {
            catCharacter.classList.add('turn-left');
        } else {
            catCharacter.classList.add('turn-right');
        }
    }
    
    // 결과 판정 (아직 판정되지 않았다면)
    if (gameResult === null) {
        if (playerChoice === null) {
            gameResult = 'timeout';
        } else if (playerChoice === catDirection) {
            gameResult = 'win';
        } else {
            gameResult = 'lose';
        }
    }
    
    // UI 숨기기 및 결과 표시
    chamSection.style.display = 'none';
    timerBar.classList.add('hidden');
    resultSection.classList.remove('hidden');
    
    switch(gameResult) {
        case 'win':
            resultText.textContent = '플레이어 승리! 🎉';
            resultText.className = 'result-text win';
            if (statusText.textContent !== '플레이어 승리') {
                statusText.textContent = '통했다냥!';
                setCatExpression('surprised');
                playSound('win');
            }
            break;
        case 'lose':
            resultText.textContent = '플레이어 패배! 😅';
            resultText.className = 'result-text lose';
            if (statusText.textContent !== '플레이어 패배') {
                statusText.textContent = '내가 이겼다냥!';
                setCatExpression('smug');
                playSound('lose');
            }
            break;
        case 'timeout':
            resultText.textContent = '시간 초과! ⏰';
            resultText.className = 'result-text timeout';
            statusText.textContent = '너무 늦었다냥!';
            setCatExpression('confused');
            buttonResult.textContent = '선택 없음';
            break;
    }
    
    // 게임 오버 화면으로 전환
    setTimeout(() => {
        showGameOver();
    }, 2000);
}

// 게임 오버 화면 표시
function showGameOver() {
    let resultMessage;
    switch(gameResult) {
        case 'win':
            resultMessage = '플레이어 승리! 🎉';
            break;
        case 'lose':
            resultMessage = '플레이어 패배! 😅';
            break;
        case 'timeout':
            resultMessage = '시간 초과! ⏰';
            break;
    }
    
    finalResult.textContent = resultMessage;
    showScreen('gameover');
}

// 게임 다시 시작
function restartGame() {
    playSound('button');
    showScreen('game');
    initGame();
}

// 타이틀로 돌아가기
function goToTitle() {
    playSound('button');
    showScreen('title');
    gameState = 'title';
}

// 이벤트 리스너 등록
startBtn.addEventListener('click', () => {
    playSound('button');
    showScreen('game');
    initGame();
    gameState = 'game';
});

// 참참참 버튼 이벤트
chamBtn.addEventListener('click', () => {
    if (!chamStarted) {
        playSound('button');
        startChamSequence();
    }
});

// 방향 버튼 이벤트
leftBtn.addEventListener('click', () => selectDirection('left'));
rightBtn.addEventListener('click', () => selectDirection('right'));

retryBtn.addEventListener('click', restartGame);
titleBtn.addEventListener('click', goToTitle);

// 키보드 지원
document.addEventListener('keydown', (e) => {
    if (gameState === 'game' && buttonEnabled) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            selectDirection('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            selectDirection('right');
        }
    }
});

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    showScreen('title');
}); 