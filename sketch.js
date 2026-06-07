// 霓虹光束：可愛酷炫街機版 (糖果霓虹 UI + 判定線軌道 + 彈跳字體動效)
let video;
let handPose;
let hands = [];
let notes = [];
let particles = [];
let sparkles = [];
let floatingTexts = []; 
let ripples = []; 

let score = 0;
let combo = 0;         
let maxCombo = 0;       
let gameTime = 30; 
let isSongLoading = false; 

let gameState = "INTRO"; 

let playerName = "PLAYER";
let nameInput; 

let introTimer = 0;
let introTransition = false; 
let startTextScale = 1.0;    
let startTextAlpha = 255;    

let shakeAmount = 0;    
let pauseTimeElapsed = 0; 
let pauseStartTime = 0;   

// 音樂與難度系統
let tracks = [];        
let currentTrackIndex = 0; 
let difficulties = ["EASY", "NORMAL", "HARD", "EVIL"];
let currentDiffIndex = 1; 
let fft;                
let currentSong;        

// 手勢模式系统
let handModes = ["ANY HAND", "SPLIT"]; 
let currentHandModeIndex = 0; 

let hitOsc;

// 視窗與按鈕佈局
let videoX, videoY, videoW, videoH;
let btnY = 25;
let pauseBtnX, restartBtnX, homeBtnX, btnW, btnH;
let skipBtnX, skipBtnY, skipBtnW, skipBtnH; 

// 教學模式專用控制變數
let tutorialStage = 0; 
let tutorialNotes = [];
let tutorialTimer = 0;

// 選單平滑縮放與動態流光旋轉角
let trackHoverScale = 1.0;
let diffHoverScale = 1.0;
let modeHoverScale = 1.0;
let uiGlowAngle = 0; 

// ✨ 新增：音遊專用判定字體彈跳控制
let lastJudgement = "";
let judgementColor;
let judgementScale = 0;
let judgementAlpha = 0;

function preload() {
  handPose = ml5.handPose({ flipped: true });

  const pathPrefix = ''; 
  tracks = [
    { name: "Brain", file: loadSound(pathPrefix + 'brain.m4a', () => console.log("✅ Brain")), baseDifficulty: "NORMAL" },
    { name: "Chiikawa", file: loadSound(pathPrefix + 'chikawa.m4a', () => console.log("✅ Chiikawa")), baseDifficulty: "NORMAL" },
    { name: "Chipchip", file: loadSound(pathPrefix + 'chipchip.m4a', () => console.log("✅ Chipchip")), baseDifficulty: "EASY" },
    { name: "JoJo", file: loadSound(pathPrefix + 'jojo.m4a', () => console.log("✅ JoJo")), baseDifficulty: "HARD" },
    { name: "Rat", file: loadSound(pathPrefix + 'rat.m4a', () => console.log("✅ Rat")), baseDifficulty: "EASY" },
    { name: "Sing", file: loadSound(pathPrefix + 'sing.m4a', () => console.log("✅ Sing")), baseDifficulty: "NORMAL" },
    { name: "Sister", file: loadSound(pathPrefix + 'sister.m4a', () => console.log("✅ Sister")), baseDifficulty: "NORMAL" },
    { name: "Turn", file: loadSound(pathPrefix + 'turn.m4a', () => console.log("✅ Turn")), baseDifficulty: "NORMAL" },
    { name: "Turtle", file: loadSound(pathPrefix + 'turtle.m4a', () => console.log("✅ Turtle")), baseDifficulty: "EASY" },
    { name: "Violin", file: loadSound(pathPrefix + 'violin.m4a', () => console.log("✅ Violin")), baseDifficulty: "HARD" },
    { name: "Dog", file: loadSound(pathPrefix + 'dog.mp3', () => console.log("✅ Dog")), baseDifficulty: "EASY" },
    { name: "Holiday", file: loadSound(pathPrefix + 'holiday.mp3', () => console.log("✅ Holiday")), baseDifficulty: "NORMAL" },
    { name: "KGMZE", file: loadSound(pathPrefix + 'kgmze-nsatb.mp3', () => console.log("✅ KGMZE")), baseDifficulty: "NORMAL" },
    { name: "Movie", file: loadSound(pathPrefix + 'Movie.mp3', () => console.log("✅ Movie")), baseDifficulty: "NORMAL" },
    { name: "Cao Dong", file: loadSound(pathPrefix + 'No Party for Cao Dong.mp3', () => console.log("✅ Cao Dong")), baseDifficulty: "HARD" },
    { name: "Summer", file: loadSound(pathPrefix + 'summer.mp3', () => console.log("✅ Summer")), baseDifficulty: "NORMAL" },
    { name: "Usaki", file: loadSound(pathPrefix + 'usaki.mp3', () => console.log("✅ Usaki")), baseDifficulty: "HARD" }, 
    { name: "Yee", file: loadSound(pathPrefix + 'Yee.mp3', () => console.log("✅ Yee")), baseDifficulty: "EASY" }
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 🚀 優化 1：限制手機版的攝影機解析度，減輕 AI 運算負擔
  let constraints = {
    video: {
      width: { ideal: width < 600 ? 320 : 640 },
      height: { ideal: width < 600 ? 240 : 480 }
    },
    audio: false, flipped: true
  };
  video = createCapture(constraints);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  textFont('Impact, Arial Black, sans-serif'); // 換成更有力道、圓潤酷炫的英文字型
  textAlign(CENTER, CENTER);
  fft = new p5.FFT();

  hitOsc = new p5.Oscillator('triangle');
  hitOsc.amp(0);
  hitOsc.start();

  nameInput = createInput('PLAYER');
  nameInput.size(200, 35);
  styleNameInput();
  nameInput.hide();

  calculateButtonLayout();
}

function styleNameInput() {
  nameInput.style('background-color', '#120224');
  nameInput.style('color', '#fff');
  nameInput.style('border', '3px solid #ff007f');
  nameInput.style('border-radius', '20px'); // 圓角增加可愛感
  nameInput.style('padding', '5px');
  nameInput.style('font-family', 'sans-serif');
  nameInput.style('font-size', '18px');
  nameInput.style('font-weight', 'bold');
  nameInput.style('text-align', 'center');
  nameInput.style('outline', 'none');
  nameInput.style('box-shadow', '0 0 25px #ff007f, inset 0 0 10px #ff007f');
}

function calculateButtonLayout() {
  if (width < 600) { 
    btnW = 85; btnH = 35;
    pauseBtnX = 15;                       
    restartBtnX = width - (btnW * 2) - 25; 
    homeBtnX = width - btnW - 15;          
    skipBtnW = 75; skipBtnH = 30;
    skipBtnX = width - skipBtnW - 15; skipBtnY = 20;
  } else {
    btnW = 110; btnH = 40;
    pauseBtnX = 40;
    restartBtnX = pauseBtnX + btnW + 15;
    homeBtnX = restartBtnX + btnW + 15;
    skipBtnW = 100; skipBtnH = 35;
    skipBtnX = width - skipBtnW - 40; skipBtnY = 25;
  }
}

function gotHands(results) { hands = results; }

function draw() {
  // 處理 Loading 遮罩 (修正 Illegal return statement)
  if (isSongLoading) {
    push(); fill(0, 0, 0, 200); rect(0, 0, width, height);
    fill(255); textSize(24); text("Loading Track...", width/2, height/2); pop();
    return; 
  }

  uiGlowAngle += 0.05; 
  let themeCol = getDifficultyColor(difficulties[currentDiffIndex]);
  fft.analyze();
  
  let bass = fft.getEnergy("bass");
  let treble = fft.getEnergy("treble");
  let beatScale = map(bass, 120, 255, 1.0, 1.15, true);

  // 🌆 背景升級：可愛蹦迪紫色調漸層 + 賽博網格
  drawCyberBackground(bass, treble, themeCol);

  if (shakeAmount > 0 && (gameState === "PLAYING" || gameState === "TUTORIAL")) {
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.88; 
  }

  videoW = width * 0.75;
  videoH = height * 0.75;
  if (width < 600) { videoW = width * 0.92; videoH = height * 0.65; }
  videoX = (width - videoW) / 2;
  videoY = (height - videoH) / 2;

  if (gameState === "NAMING") nameInput.position(width / 2 - 105, height * 0.52);
  else nameInput.hide();

  if (gameState === "INTRO") {
    drawIntroScreenB();
  } else if (gameState === "NAMING") {
    drawNamingScreen();
  } else if (gameState === "TUTORIAL") {
    drawVideoWindow();
    runTutorialLogic();
  } else {
    drawVideoWindow(); 
    if (gameState === "START") drawStartScreen(bass); 
    else if (gameState === "PLAYING") { runGame(beatScale); drawInGameButtons(); } 
    else if (gameState === "PAUSED") { drawPausedScreen(); drawInGameButtons(); } 
    else if (gameState === "END") drawEndScreen();
  }
  
  if (gameState !== "PAUSED") {
    updateAndDrawSparkles();
    updateAndDrawFloatingTexts();
    updateAndDrawRipples(); 
    drawJudgementPopUp(); // 繪製大字判定動效
  }
}

function drawCyberBackground(bass, treble, themeCol) {
  // 糖果深紫底色
  background('#0e011a');
  
  // 隨音樂重低音收縮的發光圓形背光
  // 🚀 優化 3：手機版減少發光層次的複雜度
  let pulseR = map(bass, 0, 255, width*0.2, width*0.5);
  noStroke();
  if (width > 600) {
    let radialGlow = drawingContext.createRadialGradient(width/2, height/2, 10, width/2, height/2, pulseR);
    radialGlow.addColorStop(0, color(255, 0, 128, 45));
    radialGlow.addColorStop(0.6, color(0, 255, 242, 15));
    radialGlow.addColorStop(1, color(14, 1, 26, 0));
    drawingContext.fillStyle = radialGlow;
  } else {
    fill(255, 0, 128, 20);
  }
  ellipse(width/2, height/2, pulseR * 2);

  // 科技感背景網格
  stroke(255, 0, 128, 50);
  strokeWeight(1);
  let gridOffset = (frameCount * 0.8) % 40;
  
  for (let i = 0; i < width; i += 40) {
    line(i, 0, i, height);
  }
  for (let j = 0; j < height; j += 40) {
    line(0, j + gridOffset, width, j + gridOffset);
  }
}

function drawIntroScreenB() {
  introTimer += 0.05;
  if (introTransition) {
    startTextScale += 0.15; startTextAlpha -= 18;     
    if (startTextAlpha <= 0) { gameState = "NAMING"; nameInput.show(); }
  }

  push();
  let titleGlow = map(sin(introTimer * 3), -1, 1, 30, 60);
  // 🚀 優化 4：手機版條件式關閉 ShadowBlur
  if (width > 600) {
    drawingContext.shadowBlur = titleGlow; 
    drawingContext.shadowColor = color('#ff007f');
  }
  let titleScale = map(sin(introTimer * 1.5), -1, 1, 0.95, 1.05);
  translate(width / 2, height * 0.38); scale(titleScale);
  
  // 酷炫撞色描邊字體
  stroke('#00ffff'); strokeWeight(4); fill(255); textSize(width < 600 ? 55 : 95); 
  text("NEON BEAM", 0, 0);
  
  noStroke(); drawingContext.shadowColor = color('#00ffff'); fill('#00ffff'); textSize(width < 600 ? 14 : 22); 
  text("✨  MUSIC LASER ARCADE  ✨", 0, width < 600 ? 50 : 75);
  pop();

  push(); translate(width / 2, height * 0.72); scale(startTextScale);
  let isTextVisible = true; if (!introTransition && floor(introTimer * 5) % 2 === 0) isTextVisible = false;
  if (isTextVisible) {
    if (width > 600) {
      drawingContext.shadowBlur = 25; drawingContext.shadowColor = color('#ffff00');
    }
    stroke('#ff0055'); strokeWeight(3); fill(255, 255, 0, startTextAlpha); textSize(width < 600 ? 18 : 26); text("🎮 CLICK TO START 🎮", 0, 0);
  }
  pop();
}

function drawNamingScreen() {
  push(); drawingContext.shadowBlur = 25; drawingContext.shadowColor = color('#ff007f');
  stroke('#00ffff'); strokeWeight(3); fill(255); textSize(width < 600 ? 32 : 48); text("ENTER YOUR ID", width / 2, height * 0.35);
  noStroke(); drawingContext.shadowBlur = 0; fill(220); textSize(width < 600 ? 13 : 16); text("輸入你的勇者暱稱（限10字）", width / 2, height * 0.44);

  let btnW_n = 200; let btnH_n = 45; let btnY_n = height * 0.65;
  let isHover = (mouseX > width/2 - btnW_n/2 && mouseX < width/2 + btnW_n/2 && mouseY > btnY_n - btnH_n/2 && mouseY < btnY_n + btnH_n/2);
  
  drawNeonBox(width/2 - btnW_n/2, btnY_n - btnH_n/2, btnW_n, btnH_n, isHover ? color('#ff007f') : color('#00ffff'), isHover ? 1.05 : 1.0);
  
  noStroke(); fill(255); textSize(20); text("GO! ENTER STAGE 🎵", width / 2, btnY_n); pop();
}

function initTutorial() {
  gameState = "TUTORIAL"; tutorialStage = 0; tutorialNotes = []; tutorialTimer = 0; spawnTutorialNote();
}

function spawnTutorialNote() {
  tutorialNotes = [];
  if (tutorialStage === 0) {
    let n = new Note('LEFT', 0.6, 0); n.color = color('#ff007f'); n.noteType = "PINK"; n.x = videoX + 120; n.y = videoY + videoH/2; n.speedX = 0; tutorialNotes.push(n);
  } else if (tutorialStage === 1) {
    let n = new Note('RIGHT', 0.6, 0); n.color = color('#00ffff'); n.noteType = "CYAN"; n.x = videoX + videoW - 120; n.y = videoY + videoH/2 + 50; n.speedX = 0; tutorialNotes.push(n);
  } else if (tutorialStage === 2) {
    let n = new Note('LEFT', 0.6, 1.0); n.x = videoX + videoW/2; n.y = videoY + videoH/2; n.speedX = 0; tutorialNotes.push(n);
  }
}

function runTutorialLogic() {
  let skipHover = (mouseX > skipBtnX && mouseX < skipBtnX + skipBtnW && mouseY > skipBtnY && mouseY < skipBtnY + skipBtnH);
  drawNeonBox(skipBtnX, skipBtnY, skipBtnW, skipBtnH, color('#ff00ff'), skipHover ? 1.05 : 1.0);
  push(); noStroke(); fill(255); textSize(20); text("⏭️ SKIP", skipBtnX + skipBtnW/2, skipBtnY + skipBtnH/2); pop();

  push(); fill(255); textSize(width < 600 ? 16 : 22); drawingContext.shadowBlur = 15; drawingContext.shadowColor = color(0, 255, 255);
  let guideText = "";
  if (tutorialStage === 0) guideText = "用產生的「粉紅雷射光束」滑行劃過粉紅色球體！";
  else if (tutorialStage === 1) guideText = "用產生的「青藍雷射光束」滑行劃過青藍色球體！";
  else if (tutorialStage === 2) guideText = "這是炸彈！\n點擊畫面上半部即可完成教學！";
  text(guideText, width / 2, videoY - 50); pop();

  for (let n of tutorialNotes) { n.display(1.0); }

  if (hands.length > 0 && video.width > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.02) {
        let thumb = hand.keypoints[4]; let index = hand.keypoints[8];
        let tX = map(thumb.x, 20, video.width - 20, videoX - 20, videoX + videoW + 20);
        let tY = map(thumb.y, 20, video.height - 20, videoY - 20, videoY + videoH + 20);
        let iX = map(index.x, 20, video.width - 20, videoX - 20, videoX + videoW + 20);
        let iY = map(index.y, 20, video.height - 20, videoY - 20, videoY + videoH + 20);

        let isLeftHand = (hand.handedness === 'Left');
        let laserColor = isLeftHand ? color('#ff007f') : color('#00ffff');
        drawLaser(tX, tY, iX, iY, laserColor);

        for (let i = tutorialNotes.length - 1; i >= 0; i--) {
          let note = tutorialNotes[i];
          if (checkCollision(tX, tY, iX, iY, note)) {
            if (tutorialStage === 0 && isLeftHand) {
              triggerJudgement("PERFECT", color('#ffff00')); ripples.push(new Ripple(note.x, note.y, note.color)); spawnExplosion(note.x, note.y, note.color);
              tutorialStage = 1; spawnTutorialNote();
            } else if (tutorialStage === 1 && !isLeftHand) {
              triggerJudgement("PERFECT", color('#ffff00')); ripples.push(new Ripple(note.x, note.y, note.color)); spawnExplosion(note.x, note.y, note.color);
              tutorialStage = 2; spawnTutorialNote();
            } else if (tutorialStage === 2) {
              triggerJudgement("MISS", color('#ff0055')); shakeAmount = 8;
            }
          }
        }
      }
    }
  }
}

function drawVideoWindow() {
  push(); 
  // 霓虹背光加深
  if (width > 600) {
    drawingContext.shadowBlur = 45; 
    drawingContext.shadowColor = color(255, 0, 128, 120);
  }
  fill(18, 5, 36, 220); 
  rect(videoX - 8, videoY - 8, videoW + 16, videoH + 16, 24); // 加大圓角顯得更可愛
  
  drawingContext.save();
  let maskPath = new Path2D(); maskPath.roundRect(videoX, videoY, videoW, videoH, 18);
  drawingContext.clip(maskPath); image(video, videoX, videoY, videoW, videoH);
  drawingContext.restore();
  
  // ⚡ 新增：左右兩側音遊經典「雷射判定感應軌道線」
  strokeWeight(4);
  // 左判定線（粉紅）
  stroke('#ff007f'); 
  if (width > 600) { drawingContext.shadowBlur = 15; drawingContext.shadowColor = color('#ff007f'); }
  line(videoX + 25, videoY, videoX + 25, videoY + videoH);
  // 右判定線（青藍）
  stroke('#00ffff'); 
  if (width > 600) { drawingContext.shadowBlur = 15; drawingContext.shadowColor = color('#00ffff'); }
  line(videoX + videoW - 25, videoY, videoX + videoW - 25, videoY + videoH);
  
  // 外前框
  stroke(255, 255, 255, 50); strokeWeight(2); noFill(); rect(videoX, videoY, videoW, videoH, 18); 
  pop();
}

function runGame(beatScale) {
  let currentMusicTime = (currentSong && typeof currentSong.currentTime === 'function') ? currentSong.currentTime() : 0;
  let remaining = max(0, gameTime - currentMusicTime);

  let diffMode = difficulties[currentDiffIndex];
  let speedMult = 1.0; let spawnInterval = 40; let bombChance = 0.15;
  if (diffMode === "EASY") { speedMult = 0.75; spawnInterval = 55; bombChance = 0.08; } 
  else if (diffMode === "NORMAL") { speedMult = 1.2; spawnInterval = 38; bombChance = 0.15; } 
  else if (diffMode === "HARD") { speedMult = 1.8; spawnInterval = 24; bombChance = 0.22; } 
  else if (diffMode === "EVIL") { speedMult = 2.6; spawnInterval = 14; bombChance = 0.30; }

  speedMult *= (1 + (currentMusicTime / gameTime) * 0.15);

  if (frameCount % max(8, floor(spawnInterval)) === 0) {
    let side = random() > 0.5 ? 'LEFT' : 'RIGHT';
    notes.push(new Note(side, speedMult, bombChance));
  }

  for (let i = notes.length - 1; i >= 0; i--) {
    notes[i].update(); notes[i].display(beatScale); 
    if (!notes[i].active) {
      if (!notes[i].isBomb && (notes[i].x < -50 || notes[i].x > width + 50)) { 
        combo = 0; 
        triggerJudgement("MISS", color('#ff0055')); // 漏球觸發 MISS
      }
      notes.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); particles[i].display(); if (particles[i].finished()) particles.splice(i, 1); }

  if (hands.length > 0 && video.width > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.02) { 
        let thumb = hand.keypoints[4]; let index = hand.keypoints[8];
        let tX = map(thumb.x, 20, video.width - 20, videoX - 20, videoX + videoW + 20);
        let tY = map(thumb.y, 20, video.height - 20, videoY - 20, videoY + videoH + 20);
        let iX = map(index.x, 20, video.width - 20, videoX - 20, videoX + videoW + 20);
        let iY = map(index.y, 20, video.height - 20, videoY - 20, videoY + videoH + 20);

        let isLeftHand = (hand.handedness === 'Left'); 
        let laserColor = (handModes[currentHandModeIndex] === "ANY HAND") ? color('#00ffff') : (isLeftHand ? color('#ff007f') : color('#00ffff'));

        drawLaser(tX, tY, iX, iY, laserColor);
        
        if (frameCount % (width < 600 ? 4 : 2) === 0) { sparkles.push(new Sparkle(lerp(tX, iX, random()), lerp(tY, iY, random()), laserColor)); if (sparkles.length > (width < 600 ? 30 : 80)) sparkles.shift(); }

        for (let note of notes) {
          if (note.active && checkCollision(tX, tY, iX, iY, note)) {
            handleHit(note, (tX + iX)/2, (tY + iY)/2, isLeftHand);
          }
        }
      }
    }
  }
  drawUI(remaining, beatScale); 
  if (remaining <= 0 || (currentSong && !currentSong.isPlaying() && !isSongLoading)) endGame();
}

function playHitSound(type) {
  if (type === "BOMB") { hitOsc.freq(120); hitOsc.amp(0.4, 0.01); hitOsc.amp(0, 0.2); } 
  else if (type === "WRONG") { hitOsc.freq(180); hitOsc.amp(0.35, 0.01); hitOsc.amp(0, 0.18); } 
  else { hitOsc.freq(880); hitOsc.amp(0.2, 0.005); hitOsc.amp(0, 0.08); }
}

function handleHit(note, hitX, hitY, isLeftHand) {
  ripples.push(new Ripple(hitX, hitY, note.color));
  if (note.isBomb) {
    note.active = false; playHitSound("BOMB"); score = max(0, score - 4); combo = 0; shakeAmount = 8; 
    triggerJudgement("BOMB!", color('#ff0033'));
    spawnExplosion(note.x, note.y, color(255, 0, 0)); return;
  }
  
  let isHandMatch = true;
  if (handModes[currentHandModeIndex] === "SPLIT") {
    if (note.noteType === "PINK" && !isLeftHand) isHandMatch = false; 
    if (note.noteType === "CYAN" && isLeftHand) isHandMatch = false;  
  }

  if (isHandMatch) {
    note.active = false;
    playHitSound("PERFECT");
    combo++;
    if (combo > maxCombo) { maxCombo = combo; }
    let comboBonus = floor(combo / 5);
    score += (10 + comboBonus * 2);
    
    // 🎯 觸發音遊大字判定！連擊越高越酷炫
    if (combo >= 10) triggerJudgement("MARVELOUS!", color('#ffff00'));
    else triggerJudgement("PERFECT", color('#00ffff'));
    
    spawnExplosion(note.x, note.y, note.color);
  } else {
    note.active = false; playHitSound("WRONG"); combo = 0; shakeAmount = 3; score = max(0, score - 2); 
    triggerJudgement("BAD HAND", color('#ffaa00'));
    spawnExplosion(note.x, note.y, color(150));
  }
}

// ✨ 新增：音遊大字判定觸發器
function triggerJudgement(txt, col) {
  lastJudgement = txt;
  judgementColor = col;
  judgementScale = 1.6; // 從大尺寸開始縮放彈跳
  judgementAlpha = 255;
}

// ✨ 新增：繪製大型音遊判定字體
function drawJudgementPopUp() {
  if (judgementAlpha > 0) {
    push();
    translate(width / 2, videoY + videoH * 0.78); // 位於視訊視窗中下方
    scale(judgementScale);
    
    // 粗黑撞色描邊，做出超可愛的街機風
    stroke('#000'); strokeWeight(6);
    if (width > 600) {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = judgementColor;
    }
    fill(judgementColor);
    
    textSize(width < 600 ? 28 : 42);
    text(lastJudgement, 0, 0);
    
    pop();
    
    // 漸變動畫邏輯
    judgementScale = lerp(judgementScale, 1.0, 0.15);
    judgementAlpha -= 6;
  }
}

function drawLaser(x1, y1, x2, y2, col) {
  push();
  let thickness = map(sin(frameCount * 0.4), -1, 1, 10, 16); 
  let noiseOffset = (noise(frameCount * 0.15) - 0.5) * 5; 
  stroke(255); strokeWeight(4); line(x1 + noiseOffset, y1 + noiseOffset, x2 + noiseOffset, y2 + noiseOffset);
  stroke(col); strokeWeight(thickness); 
  if (width > 600) { drawingContext.shadowBlur = 30; drawingContext.shadowColor = col; }
  line(x1, y1, x2, y2);
  pop();
}

class Note {
  constructor(side, speedMult, bombChance) {
    this.radius = random(20, 26); this.active = true; this.isBomb = random() < bombChance;
    if (this.isBomb) { this.color = color('#ff0044'); this.noteType = "BOMB"; } 
    else {
      if (handModes[currentHandModeIndex] === "ANY HAND") { 
        // 糖果撞色系
        this.color = color(random(['#ff007f', '#00ffff', '#7efff5', '#fffa65'])); this.noteType = "ANY"; 
      } 
      else {
        if (random() > 0.5) { this.color = color('#ff007f'); this.noteType = "PINK"; } 
        else { this.color = color('#00ffff'); this.noteType = "CYAN"; }
      }
    }
    this.startY = random(videoY + 60, videoY + videoH - 60); this.y = this.startY; this.sinPhase = random(TWO_PI);
    if (side === 'LEFT') { this.x = videoX - this.radius; this.speedX = random(4.0, 6.0) * speedMult; } 
    else { this.x = videoX + videoW + this.radius; this.speedX = random(-4.0, -6.0) * speedMult; }
  }
  update() {
    if (gameState === "PAUSED") return;
    this.x += this.speedX; this.y = this.startY + sin(this.x * 0.03 + this.sinPhase) * 30;
    if (this.x > width + 80 || this.x < -80) this.active = false;
  }
  display(beatScale) {
    push(); noStroke(); 
    let dynamicRadius = this.radius * (this.isBomb ? 1.0 : beatScale);
    if (width > 600) {
      drawingContext.shadowBlur = 30 * beatScale; drawingContext.shadowColor = this.color;
    }
    
    // 畫出可愛帶有雙層發光環的音符
    fill(this.color); circle(this.x, this.y, dynamicRadius * 2);
    fill(255, 255, 255, 220); circle(this.x, this.y, dynamicRadius * 0.6);
    
    if (this.isBomb) { stroke(255); strokeWeight(4); line(this.x-8, this.y-8, this.x+8, this.y+7); line(this.x+8, this.y-8, this.x-8, this.y+7); } 
    else {
      if (gameState !== "TUTORIAL" && handModes[currentHandModeIndex] === "SPLIT") { 
        textSize(13); fill(0); text(this.noteType === "PINK" ? "L" : "R", this.x, this.y); 
      }
    }
    pop();
  }
}

function checkCollision(x1, y1, x2, y2, circleObj) {
  let px = circleObj.x; let py = circleObj.y; let r = circleObj.radius * 1.45; 
  let dx = x2 - x1; let dy = y2 - y1; let lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(px, py, x1, y1) < r;
  let t = constrain(((px - x1) * dx + (py - y1) * dy) / lenSq, 0, 1);
  return dist(px, py, x1 + t * dx, y1 + t * dy) < r;
}

class Ripple {
  constructor(x, y, col) { this.x = x; this.y = y; this.col = col; this.r = 10; this.maxR = 80; this.alpha = 255; }
  update() { this.r += 4.5; this.alpha = map(this.r, 10, this.maxR, 255, 0); }
  display() { push(); noFill(); stroke(this.col); strokeWeight(4); drawingContext.shadowBlur = 20; drawingContext.shadowColor = this.col; circle(this.x, this.y, this.r * 2); pop(); }
  finished() { 
    // 🚀 優化 5：手機版縮短漣漪壽命
    return width < 600 ? this.r >= 40 : this.r >= this.maxR; 
  }
}
function updateAndDrawRipples() { for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].update(); ripples[i].display(); if (ripples[i].finished()) ripples.splice(i, 1); } }

class FloatingText {
  constructor(x, y, txt, col) { this.x = x; this.y = y; this.txt = txt; this.col = col; this.life = 1.0; }
  update() { this.y -= 2.0; this.life -= 0.04; }
  display() { push(); stroke(0); strokeWeight(3); fill(this.col); textSize(width < 600 ? 14 : 18); text(this.txt, this.x, this.y); pop(); }
}
function updateAndDrawFloatingTexts() { for (let i = floatingTexts.length - 1; i >= 0; i--) { floatingTexts[i].update(); floatingTexts[i].display(); if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1); } }

class Particle {
  constructor(x, y, col) { this.pos = createVector(x, y); this.vel = p5.Vector.random2D().mult(random(3, 8)); this.acc = createVector(0, 0.15); this.lifespan = 255; this.color = col; }
  update() { this.vel.add(this.acc); this.pos.add(this.vel); this.lifespan -= 12; }
  display() { push(); noStroke(); fill(this.color); circle(this.pos.x, this.pos.y, random(3, 7)); pop(); }
  finished() { return this.lifespan < 0; }
}
class Sparkle {
  constructor(x, y, col) { this.x = x; this.y = y; this.size = random(2, 4); this.alpha = 240; this.color = col; }
  update() { this.y -= 1.0; this.alpha -= 14; }
  display() { noStroke(); fill(red(this.color), green(this.color), blue(this.color), this.alpha); circle(this.x, this.y, this.size); }
}
function updateAndDrawSparkles() { for (let i = sparkles.length - 1; i >= 0; i--) { sparkles[i].update(); sparkles[i].display(); if (sparkles[i].alpha <= 0) sparkles.splice(i, 1); } }
function spawnExplosion(x, y, col) { for (let i = 0; i < 15; i++) particles.push(new Particle(x, y, col)); while (particles.length > 120) particles.shift(); }

function getDifficultyColor(mode) {
  if (mode === "EASY") return color('#39ff14'); if (mode === "NORMAL") return color('#fffa65'); if (mode === "HARD") return color('#ff9f43'); return color('#ff0055'); 
}

// 🔲 美化：高飽和度、帶彩虹感雙色漸層的可愛音遊面板
function drawNeonBox(bx, by, bw, bh, activeColor, scaleFactor = 1.0) {
  push();
  rectMode(CORNER);
  translate(bx + bw/2, by + bh/2);
  scale(scaleFactor);
  
  // 🌈 新增：底色填充，使選單方框在背景網格中更清晰
  noStroke();
  fill(red(activeColor), green(activeColor), blue(activeColor), 60);
  rect(-bw/2, -bh/2, bw, bh, 18);

  // 可愛風粗發光邊框
  noFill();
  stroke(red(activeColor), green(activeColor), blue(activeColor), 50);
  strokeWeight(10);
  rect(-bw/2, -bh/2, bw, bh, 18);
  
  // 雙色流光動態漸層填充
  let grad = drawingContext.createLinearGradient(-bw/2, -bh/2, bw/2, bh/2);
  let pulseCol = color(
    red(activeColor) + sin(uiGlowAngle) * 30, 
    green(activeColor) + cos(uiGlowAngle) * 30, 
    blue(activeColor)
  );
  grad.addColorStop(0, color(14, 2, 32, 220));
  grad.addColorStop(1, color(red(pulseCol)*0.3, green(pulseCol)*0.3, blue(pulseCol)*0.3, 220));
  
  drawingContext.fillStyle = grad;
  stroke(activeColor);
  strokeWeight(3);
  if (width > 600) {
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = activeColor;
  }
  rect(-bw/2, -bh/2, bw, bh, 18);
  pop();
}

function drawUI(remaining, beatScale) {
  push(); 
  // 總分放大彈跳
  stroke('#000'); strokeWeight(5);
  fill('#00ffff'); textSize((width < 600 ? 42 : 64) * (beatScale * 0.96)); 
  if (width > 600) {
    drawingContext.shadowBlur = 25; drawingContext.shadowColor = color(0, 255, 255);
  }
  text(score, width / 2, videoY - 45);
  
  noStroke(); textSize(width < 600 ? 15 : 22); fill(255); text(`TIME: ${nf(remaining, 1, 1)}s`, width / 2, videoY - 15);
  
  // 連擊數（Combo）街機大字化
  let textPadding = width < 600 ? 20 : 60; textAlign(RIGHT); 
  stroke('#000'); strokeWeight(4);
  fill('#ff007f'); textSize(width < 600 ? 24 : 34); 
  if (width > 600) { drawingContext.shadowBlur = 15; drawingContext.shadowColor = color('#ff007f'); }
  text(`${combo} COMBO`, width - textPadding, videoY - 40);
  
  fill(getDifficultyColor(difficulties[currentDiffIndex])); textSize(width < 600 ? 15 : 22); 
  drawingContext.shadowColor = getDifficultyColor(difficulties[currentDiffIndex]);
  text(difficulties[currentDiffIndex], width - textPadding, videoY - 12); pop();
}

function drawInGameButtons() {
  let p= (mouseX > pauseBtnX && mouseX < pauseBtnX + btnW && mouseY > btnY && mouseY < btnY + btnH);
  let r= (mouseX > restartBtnX && mouseX < restartBtnX + btnW && mouseY > btnY && mouseY < btnY + btnH);
  let h= (mouseX > homeBtnX && mouseX < homeBtnX + btnW && mouseY > btnY && mouseY < btnY + btnH);
  
  drawNeonBox(pauseBtnX, btnY, btnW, btnH, color('#00ffff'), p ? 1.05 : 1.0);
  push(); noStroke(); fill(255); textAlign(CENTER, CENTER); textSize(20); textStyle(BOLD); text((gameState === "PAUSED") ? "▶ RESUME" : "⏸ PAUSE", pauseBtnX + btnW/2, btnY + btnH/2); pop();

  drawNeonBox(restartBtnX, btnY, btnW, btnH, color('#ff00ff'), r ? 1.05 : 1.0);
  push(); noStroke(); fill(255); textAlign(CENTER, CENTER); textSize(20); textStyle(BOLD); text("🔄 AGAIN", restartBtnX + btnW/2, btnY + btnH/2); pop();

  drawNeonBox(homeBtnX, btnY, btnW, btnH, color('#fffa65'), h ? 1.05 : 1.0);
  push(); noStroke(); fill(255); textAlign(CENTER, CENTER); textSize(20); textStyle(BOLD); text("🏠 MENU", homeBtnX + btnW/2, btnY + btnH/2); pop();
}

function drawPausedScreen() { push(); fill(0, 0, 0, 190); rect(0, 0, width, height); stroke('#000'); strokeWeight(5); fill('#00ffff'); textSize(width < 600 ? 42 : 60); text("PAUSED", width / 2, height / 2); pop(); }

function drawStartScreen(bass) {
  push(); let startY = videoY - 110; if (width < 600) startY = videoY - 80; let mainTitleSize = width < 600 ? 45 : 68;
  let menuTitleGlow = map(bass, 0, 255, 25, 55); drawingContext.shadowBlur = menuTitleGlow; drawingContext.shadowColor = color('#ff007f');
  
  stroke('#00ffff'); strokeWeight(4); fill(255); textSize(mainTitleSize); text("NEON BEAM", width / 2, startY);
  noStroke(); drawingContext.shadowBlur = 0; fill(255); textSize(width < 600 ? 13 : 17); text(`READY? CHOOSE YOUR TRACK ⚡`, width / 2, startY + 45);
  
  let pickerY = videoY + (videoH / 2) - (width < 600 ? 75 : 55); 
  let boxW = videoW * (width < 600 ? 0.31 : 0.28); let boxH = width < 600 ? 130 : 110; let gap = (videoW - (boxW * 3)) / 4;
  let x1 = videoX + gap; let x2 = x1 + boxW + gap; let x3 = x2 + boxW + gap;
  
  if (mouseX > x1 && mouseX < x1 + boxW && mouseY > pickerY && mouseY < pickerY + boxH) trackHoverScale = lerp(trackHoverScale, 1.06, 0.2); else trackHoverScale = lerp(trackHoverScale, 1.0, 0.2);
  if (mouseX > x2 && mouseX < x2 + boxW && mouseY > pickerY && mouseY < pickerY + boxH) diffHoverScale = lerp(diffHoverScale, 1.06, 0.2); else diffHoverScale = lerp(diffHoverScale, 1.0, 0.2);
  if (mouseX > x3 && mouseX < x3 + boxW && mouseY > pickerY && mouseY < pickerY + boxH) modeHoverScale = lerp(modeHoverScale, 1.06, 0.2); else modeHoverScale = lerp(modeHoverScale, 1.0, 0.2);

  // 🎵 曲目、難度、手勢面板
  drawNeonBox(x1, pickerY, boxW, boxH, color('#ff007f'), trackHoverScale);
  push(); translate(x1 + boxW/2, pickerY + boxH/2); scale(trackHoverScale); noStroke(); fill('#7efff5'); textSize(20); text("◁ MUSIC ▷", 0, -boxH/2 + 25); fill('#ff0000'); textSize(20); text(tracks[currentTrackIndex].name, 0, 15); pop();
  
  let diffColor = getDifficultyColor(difficulties[currentDiffIndex]);
  drawNeonBox(x2, pickerY, boxW, boxH, diffColor, diffHoverScale);
  push(); translate(x2 + boxW/2, pickerY + boxH/2); scale(diffHoverScale); noStroke(); fill('#7efff5'); textSize(20); text("◁ MODE ▷", 0, -boxH/2 + 25); fill(diffColor); textSize(20); text(difficulties[currentDiffIndex], 0, 15); pop();
  
  let modeName = handModes[currentHandModeIndex]; let modeDispColor = (modeName === "ANY HAND") ? color('#00ffff') : color('#ff007f');
  drawNeonBox(x3, pickerY, boxW, boxH, modeDispColor, modeHoverScale);
  push(); translate(x3 + boxW/2, pickerY + boxH/2); scale(modeHoverScale); noStroke(); fill('#7efff5'); textSize(20); text("◁ HANDS ▷", 0, -boxH/2 + 25); fill(modeDispColor); textSize(20); text(modeName === "ANY HAND" ? "任意手" : "雙手分色", 0, 15); pop();
  
  // 🏆 優化：查看排行榜按鈕（手機版尺寸縮放）
  let lbW = width < 600 ? 140 : 180; let lbH = width < 600 ? 30 : 35; let lbX = width/2 - lbW/2; let lbY = pickerY + boxH + 15;
  let lbHover = (mouseX > lbX && mouseX < lbX + lbW && mouseY > lbY && mouseY < lbY + lbH);
  drawNeonBox(lbX, lbY, lbW, lbH, color('#00ffff'), lbHover ? 1.05 : 1.0);
  push(); noStroke(); fill(255); textSize(20); text("🏆 LEADERBOARD", lbX + lbW/2, lbY + lbH/2); pop();

  stroke('#000'); strokeWeight(3); fill('#39ff14'); textSize(width < 600 ? 16 : 22); text("【 點擊上方視訊區域 ─ 開始轟炸節奏 】", width / 2, videoY + videoH + (width < 600 ? 35 : 52)); pop();
}

// 🏆 街機電競風格結算畫面
function drawEndScreen() {
  push(); 
  fill(10, 2, 22, 240); rect(0, 0, width, height);
  
  // 主標題描邊
  stroke('#000'); strokeWeight(5);
  drawingContext.shadowBlur = 30; drawingContext.shadowColor = color('#ff007f');
  fill(255); textSize(width < 600 ? 28 : 42); text("STAGE CLEAR!", width / 2, height * 0.12);
  drawingContext.shadowBlur = 0;
  
  let expectedNotesPerSec = (currentDiffIndex === 0) ? 1.2 : ((currentDiffIndex === 1) ? 1.8 : ((currentDiffIndex === 2) ? 2.8 : 4.5));
  let ratio = score / max(10, floor(gameTime * expectedNotesPerSec));
  let rank = "D"; let rankColor = color('#ff0055');
  if (ratio >= 0.90) { rank = "S"; rankColor = color('#00ffff'); } else if (ratio >= 0.75) { rank = "A"; rankColor = color('#ff007f'); } else if (ratio >= 0.60) { rank = "B"; rankColor = color('#fffa65'); } else if (ratio >= 0.45) { rank = "C"; rankColor = color('#7efff5'); }
  
  let blockX1 = width * 0.28;
  // 左面板：分數與評級
  drawNeonBox(blockX1 - (width<600?100:150), height*0.19, width<600?200:300, height*0.42, rankColor, 1.0);
  
  stroke('#000'); strokeWeight(6);
  textSize(width < 600 ? 70 : 110); fill(rankColor); drawingContext.shadowBlur = 30; drawingContext.shadowColor = rankColor; text(rank, blockX1, height * 0.31); drawingContext.shadowBlur = 0;
  noStroke(); fill(255); textSize(width < 600 ? 18 : 24); text(`SCORE: ${score}`, blockX1, height * 0.46);
  fill('#00ffff'); textSize(width < 600 ? 14 : 18); text(`MAX COMBO: ${maxCombo}`, blockX1, height * 0.53);

  let blockX2 = width * 0.68;
  let songName = tracks[currentTrackIndex].name; let diffName = difficulties[currentDiffIndex]; let modeName = handModes[currentHandModeIndex];
  let boardKey = `leaderboard_${songName}_${diffName}_${modeName}`;
  let boardData = JSON.parse(localStorage.getItem(boardKey)) || [];
  
  // 右面板：排行榜
  drawNeonBox(blockX2 - (width < 600 ? 130 : 190), height * 0.19, width < 600 ? 260 : 380, height * 0.42, color('#00ffff'), 1.0);
  
  noStroke(); fill('#00ffff'); textSize(width < 600 ? 13 : 20); text(`🏆 TOP 3 RANKING`, blockX2, height * 0.24);
  textSize(width < 600 ? 9 : 14); fill(180); text(`[ ${songName} - ${diffName} ]`, blockX2, height * 0.29);
  
  for (let i = 0; i < 3; i++) {
    let rankY = height * 0.36 + (i * (height * 0.07));
    if (i < boardData.length) {
      let record = boardData[i]; let entryColor = (i === 0) ? color('#fffa65') : ((i === 1) ? color('#fff') : color('#ff9f43'));
      if (record.name === playerName && record.score === score) entryColor = color('#00ffff');
      fill(entryColor); textSize(width < 600 ? 12 : 18); textAlign(LEFT); text(` 👑 No.${i+1}  ${record.name}`, blockX2 - (width < 600 ? 110 : 160), rankY);
      textAlign(RIGHT); text(`${record.score} P`, blockX2 + (width < 600 ? 110 : 160), rankY);
    } else {
      fill(100); textSize(width < 600 ? 11 : 16); textAlign(CENTER); text(`No.${i+1}  --- EMPTY ---`, blockX2, rankY);
    }
  }
  
  textAlign(CENTER);
  let endBtnW = width < 600 ? 180 : 220; let endBtnH = width < 600 ? 45 : 50;
  let btnHover = (mouseX > width/2 - endBtnW/2 && mouseX < width/2 + endBtnW/2 && mouseY > height * 0.76 && mouseY < height * 0.76 + endBtnH);
  drawNeonBox(width/2 - endBtnW/2, height * 0.76, endBtnW, endBtnH, color('#fffa65'), btnHover ? 1.05 : 1.0);
  push(); noStroke(); stroke('#000'); strokeWeight(2); fill(255); textSize(20); text("REPLAY 🎮", width / 2, height * 0.76 + endBtnH / 2); pop();
}

function handleGeneralPress(inputX, inputY) {
  if (gameState === "INTRO") {
    if (!introTransition) { introTransition = true; hitOsc.freq(600); hitOsc.amp(0.15, 0.005); hitOsc.amp(0, 0.12); } return;
  }
  if (gameState === "NAMING") {
    let btnW_n = 200; let btnH_n = 45; let btnY_n = height * 0.65;
    if (inputX > width/2 - btnW_n/2 && inputX < width/2 + btnW_n/2 && inputY > btnY_n - btnH_n/2 && inputY < btnY_n + btnH_n/2) {
      let entered = nameInput.value().trim().toUpperCase(); playerName = entered !== "" ? entered.substring(0, 10) : "PLAYER";
      nameInput.hide(); initTutorial(); hitOsc.freq(880); hitOsc.amp(0.2, 0.005); hitOsc.amp(0, 0.1);
    } return;
  }
  if (gameState === "TUTORIAL") {
    if (inputX > skipBtnX && inputX < skipBtnX + skipBtnW && inputY > skipBtnY && inputY < skipBtnY + skipBtnH) { gameState = "START"; hitOsc.freq(500); hitOsc.amp(0.15, 0.005); hitOsc.amp(0, 0.12); return; }
    if (tutorialStage === 2 && inputY < videoY + 100) { gameState = "START"; } return;
  }
  let pickerY = videoY + (videoH / 2) - (width < 600 ? 75 : 55);
  let boxW = videoW * (width < 600 ? 0.31 : 0.28); let boxH = width < 600 ? 130 : 110; let gap = (videoW - (boxW * 3)) / 4;
  let x1 = videoX + gap; let x2 = x1 + boxW + gap; let x3 = x2 + boxW + gap;
  if (gameState === "START") {
    if (inputX > x1 && inputX < x1 + boxW && inputY > pickerY && inputY < pickerY + boxH) { 
      currentTrackIndex = (currentTrackIndex + 1) % tracks.length; 
      currentDiffIndex = difficulties.indexOf(tracks[currentTrackIndex].baseDifficulty);
      return; 
    }
    if (inputX > x2 && inputX < x2 + boxW && inputY > pickerY && inputY < pickerY + boxH) { currentDiffIndex = (currentDiffIndex + 1) % difficulties.length; return; }
    if (inputX > x3 && inputX < x3 + boxW && inputY > pickerY && inputY < pickerY + boxH) { currentHandModeIndex = (currentHandModeIndex + 1) % handModes.length; return; }
    
    // 偵測點擊排行榜按鈕
    let lbW = width < 600 ? 140 : 180; let lbH = width < 600 ? 30 : 35; let lbX = width/2 - lbW/2; let lbY = pickerY + boxH + 15;
    if (inputX > lbX && inputX < lbX + lbW && inputY > lbY && inputY < lbY + lbH) { gameState = "END"; return; }

    if (!(inputY > pickerY && inputY < pickerY + boxH)) { startGame(); }
  } 
  else if (gameState === "PLAYING" || gameState === "PAUSED") {
    if (inputX > pauseBtnX && inputX < pauseBtnX + btnW && inputY > btnY && inputY < btnY + btnH) { togglePause(); return; }
    if (inputX > restartBtnX && inputX < restartBtnX + btnW && inputY > btnY && inputY < btnY + btnH) { startGame(); return; }
    if (inputX > homeBtnX && inputX < homeBtnX + btnW && inputY > btnY && inputY < btnY + btnH) { goToHome(); return; }
  }
  else if (gameState === "END") {
    let endBtnW = width < 600 ? 180 : 220; let endBtnH = width < 600 ? 45 : 50;
    if (inputX > width/2 - endBtnW/2 && inputX < width/2 + endBtnW/2 && inputY > height * 0.76 && inputY < height * 0.76 + endBtnH) { gameState = "START"; }
  }
}
function goToHome() { if (currentSong) currentSong.stop(); gameState = "START"; }
function touchStarted() { handleGeneralPress(touches[0].x, touches[0].y); return false; }
function mousePressed() { if (touches.length > 0) return; handleGeneralPress(mouseX, mouseY); }
function togglePause() {
  if (gameState === "PLAYING") { gameState = "PAUSED"; pauseStartTime = millis(); if (currentSong && currentSong.isPlaying()) currentSong.pause(); } 
  else if (gameState === "PAUSED") { gameState = "PLAYING"; pauseTimeElapsed += (millis() - pauseStartTime); if (currentSong) currentSong.play(); }
}
function startGame() {
    score = 0; combo = 0; maxCombo = 0; notes = []; particles = []; floatingTexts = []; ripples = []; shakeAmount = 0; pauseTimeElapsed = 0;
    currentSong = tracks[currentTrackIndex].file;
    if (currentSong && typeof currentSong.isPlaying === 'function') {
      if (currentSong.isPlaying()) currentSong.stop(); currentSong.setVolume(1.0); currentSong.play();
      gameTime = currentSong.duration(); if (gameTime <= 0 || !gameTime) gameTime = 30;
    } else { gameTime = 30; }
    gameState = "PLAYING"; 
}
function endGame() {
  gameState = "END"; maxCombo = max(maxCombo, combo);
  if (currentSong) { currentSong.fade(0, 0.5); setTimeout(() => { if(currentSong) currentSong.stop(); }, 500); }
  let songName = tracks[currentTrackIndex].name; let diffName = difficulties[currentDiffIndex]; let modeName = handModes[currentHandModeIndex];
  let boardKey = `leaderboard_${songName}_${diffName}_${modeName}`;
  let boardData = JSON.parse(localStorage.getItem(boardKey)) || [];
  boardData.push({ name: playerName, score: score }); boardData.sort((a, b) => b.score - a.score);
  if (boardData.length > 3) boardData = boardData.slice(0, 3);
  localStorage.setItem(boardKey, JSON.stringify(boardData));
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); calculateButtonLayout(); }