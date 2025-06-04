// 게임 상태 관리
let gameState = 'title'; // 'title', 'game', 'gameover'
let gameResult = null; // 'win', 'lose', 'timeout'
let catDirection = null; // 'left', 'right'
let playerChoice = null; // 'left', 'right'
let timerInterval = null;

// 게임 진행 상태
let chamStarted = false;
let buttonEnabled = false; // 방향 버튼 활성화 여부

// 사운드 관리
let audioContext = null;
let soundEnabled = false;

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
const catImage = document.getElementById('catImage');
const gameOverCatImage = document.getElementById('gameOverCatImage');
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

// 고양이 이미지들
const catImages = {
    front: 'images/front.png',
    left: 'images/left.png',
    right: 'images/right.png',
    sad: 'images/sad.png',
    congratulation: 'images/congraturation.png'
};

// 사운드 효과 (간단한 Beep 사운드 구현)
function playSound(type) {
    // AudioContext가 초기화되지 않았거나 비활성화된 경우 초기화 시도
    if (!audioContext || !soundEnabled) {
        initAudioContext();
    }
    
    // 여전히 AudioContext가 없으면 사운드 재생 포기
    if (!audioContext || !soundEnabled) {
        console.warn('사운드 재생 불가: AudioContext 없음');
        return;
    }
    
    try {
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
        
        console.log(`사운드 재생: ${type} (${frequency}Hz, ${duration}ms)`);
        
    } catch (error) {
        console.warn('사운드 재생 중 오류:', error);
    }
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

// 고양이 이미지 변경 함수
function setCatImage(imageType) {
    if (catImage && catImages[imageType]) {
        catImage.src = catImages[imageType];
        console.log('고양이 이미지 변경:', imageType, '→', catImages[imageType]);
    }
}

// 게임오버 화면 고양이 이미지 변경 함수
function setGameOverCatImage(imageType) {
    if (gameOverCatImage && catImages[imageType]) {
        gameOverCatImage.src = catImages[imageType];
    }
}

// 고양이 표정 변경 함수 (호환성을 위해 유지)
function setCatExpression(expression) {
    // 기존 이모지 표정을 이미지로 매핑
    switch(expression) {
        case 'default':
        case 'excited':
        case 'happy':
            setCatImage('front');
            break;
        case 'surprised':
            setCatImage('congratulation');
            break;
        case 'sad':
        case 'confused':
            setCatImage('sad');
            break;
        case 'smug':
            setCatImage('front');
            break;
        default:
            setCatImage('front');
    }
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
    
    // 고양이 이미지 초기화 - 정면으로 설정
    setCatImage('front');
    
    // 고양이 스타일 초기화
    catCharacter.className = 'cat-character large';
    catCharacter.classList.remove('turn-left', 'turn-right');
    
    console.log('게임 초기화 후 고양이 상태: 정면 이미지');
    
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
        setTimeout(() => playSound('cham'), 50); // 약간의 지연 추가
        showChamText('참');
        catCharacter.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            catCharacter.style.transform = 'translateY(0)';
        }, 200);
    }, 300);
    
    // 두 번째 "참!"
    setTimeout(() => {
        console.log('두 번째 참'); // 디버깅용
        setTimeout(() => playSound('cham'), 50); // 약간의 지연 추가
        showChamText('참');
        catCharacter.style.transform = 'scale(1.1)';
        setTimeout(() => {
            catCharacter.style.transform = 'scale(1)';
        }, 200);
    }, 1100); // 첫 번째 "참" 후 0.5초 + 0.3초
    
    // 세 번째 "참!" - 고양이 방향 결정 및 최종 입력 확정 시작
    setTimeout(() => {
        console.log('세 번째 참!'); // 디버깅용
        setTimeout(() => playSound('cham'), 50); // 약간의 지연 추가
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
    
    // 고양이 얼굴 방향 바꾸기 - 이미지로 변경
    setTimeout(() => {
        console.log('🐱 고양이 얼굴 방향 바꾸기! 방향:', catDirection);
        
        if (catDirection === 'left') {
            console.log('⬅️ 왼쪽 이미지로 변경!');
            setCatImage('left');
        } else {
            console.log('➡️ 오른쪽 이미지로 변경!');
            setCatImage('right');
        }
        
        // 고양이 돌아가는 효과음
        playSound('click');
        
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
        statusText.textContent = '축하드려요!';
        
        setCatExpression('surprised'); // 놀란 표정
        playSound('win');
        console.log('✅ 승리! 방향이 일치함');
    } else {
        gameResult = 'lose';
        
        // 😅 패배 팝업 표시
        showResultPopup(false, '플레이어 패배');
        statusText.textContent = '안타까워요';
        
        setCatExpression('sad'); // 슬픈 표정으로 변경
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
    // 고양이 방향은 이미 이미지로 표시되었으므로 추가 처리 불필요
    
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
                statusText.textContent = '안타까워요!';
                setCatExpression('sad'); // 슬픈 표정으로 변경
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
            setGameOverCatImage('congratulation'); // 축하 이미지
            break;
        case 'lose':
            resultMessage = '플레이어 패배! 😅';
            setGameOverCatImage('sad'); // 슬픈 이미지
            break;
        case 'timeout':
            resultMessage = '시간 초과! ⏰';
            setGameOverCatImage('sad'); // 슬픈 이미지
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
console.log('DOM 요소 확인:', {
    startBtn: startBtn,
    chamBtn: chamBtn,
    leftBtn: leftBtn,
    rightBtn: rightBtn,
    retryBtn: retryBtn,
    titleBtn: titleBtn
});

startBtn.addEventListener('click', () => {
    console.log('도전 버튼 클릭됨!');
    
    // 첫 번째 사용자 인터랙션에서 AudioContext 초기화
    initAudioContext();
    
    playSound('button');
    showScreen('game');
    initGame();
    gameState = 'game';
});

// 참참참 버튼 이벤트
chamBtn.addEventListener('click', () => {
    console.log('참참참 버튼 클릭됨!');
    if (!chamStarted) {
        playSound('button');
        startChamSequence();
    }
});

// 방향 버튼 이벤트
leftBtn.addEventListener('click', () => {
    console.log('왼쪽 버튼 클릭됨!');
    selectDirection('left');
});
rightBtn.addEventListener('click', () => {
    console.log('오른쪽 버튼 클릭됨!');
    selectDirection('right');
});

retryBtn.addEventListener('click', () => {
    console.log('다시하기 버튼 클릭됨!');
    restartGame();
});
titleBtn.addEventListener('click', () => {
    console.log('처음으로 버튼 클릭됨!');
    goToTitle();
});

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

// 오디오 컨텍스트 초기화 함수
function initAudioContext() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            soundEnabled = true;
            console.log('AudioContext 초기화 성공');
        }
        
        // AudioContext가 suspended 상태일 때 resume
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed');
            });
        }
    } catch (error) {
        console.warn('AudioContext 초기화 실패:', error);
        soundEnabled = false;
    }
} 