
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
let GAME_SCALE = 1;

const CRITICAL_IMAGES = [
  // 타이틀 관련
  "assets/title_bg.png", "assets/title_logo.png", "assets/title.png", "assets/title_image.png", "assets/title_button.png",
  
  // 팀/튜토리얼
  "assets/team_1.png", "assets/team_2.png", "assets/team_3.png", "assets/team_4.png", "assets/team_5.png",
  "assets/tuto.png", "assets/tuto2.png", "assets/game_start.png",

  // 도구 버튼
  "assets/tool_batter.png",
  "assets/tool_flip.png",
  "assets/tool_filling.png", "assets/tool_filling1.png",
  "assets/tool_filling_shu.png", "assets/tool_filling1_shu.png",

  // 봉투
  "assets/bag_0.png", "assets/bag_1.png", "assets/bag_2.png", "assets/bag_3.png",
  "assets/bag_special_1.png", "assets/bag_special_2.png", "assets/bag_special_3.png",

  // 체력(HP)
  "assets/hp.png", "assets/hp1.png", "assets/hp2.png", "assets/hp3.png", "assets/hp4.png",

  // 붕어빵 틀 상태
  "assets/pan_empty.png", "assets/pan_batter1.png",
  "assets/pan_fill.png", "assets/pan_fill_shu.png",
  "assets/pan_phase1.png", "assets/pan_phase2.png",
  "assets/pan_done.png", "assets/pan_done_special.png",
  "assets/pan_burnt.png",

  // 커서
  "assets/cursor_batter.png", "assets/cursor_filling.png", "assets/cursor_filling_shu.png", "assets/cursor_flip.png",

  // 드래그 잔상
  "assets/drag_bread.png", "assets/drag_bread_special.png",
  "assets/drag_bread_undercooked.png", "assets/drag_bread_burnt.png",
  "assets/drag_bag.png", "assets/drag_bag_special.png",

  // 기타
  "assets/display_glass.png",
];

function collectInlineBackgroundUrls() {
  const els = document.querySelectorAll("[style*='background-image']");
  const out = [];
  els.forEach(el => {
    const u = normalizeUrl(el.style.backgroundImage);
    if (u) out.push(u);
  });
  return out;
}

function collectUrlsFromObject(obj) {
  if (!obj) return [];
  return Object.values(obj).map(normalizeUrl).filter(Boolean);
}

function collectInlineBackgroundUrls() {
  const els = document.querySelectorAll("[style*='background-image']");
  const out = [];
  els.forEach(el => {
    const u = normalizeUrl(el.style.backgroundImage);
    if (u) out.push(u);
  });
  return out;
}

async function preloadAllGameImages() {
  const list = [];
  const MANUAL_ASSETS = [
    "assets/title_bg.png", "assets/title_logo.png", "assets/title.png", "assets/title_image.png", "assets/title_button.png",
    "assets/team_1.png", "assets/team_2.png", "assets/team_3.png", "assets/team_4.png", "assets/team_5.png",
    "assets/shu_1.png", "assets/shu_2.png", "assets/shu_3.png", "assets/red_1.png", "assets/red_2.png", "assets/red_3.png",
    "assets/tuto.png", "assets/tuto2.png", "assets/tuto_2.png", "assets/game_start.png",
    "assets/game_over.png", "assets/game_over_shu.png", "assets/game_over_bg.png", "assets/game_over_smoke.png", "assets/game_over_smoke2.png", "assets/game_over_paper.png",
    "assets/button_retry.png", "assets/unnatural_play.png", "assets/music1.png", "assets/music2.png", "assets/music3.png",
    "assets/hp.png", "assets/hp1.png", "assets/hp2.png", "assets/hp3.png", "assets/hp4.png",
    "assets/fishing.png", "assets/yume_chan.png",
    "assets/tool_batter.png", "assets/tool_flip.png", 
    "assets/tool_filling.png", "assets/tool_filling1.png", "assets/tool_filling_shu.png", "assets/tool_filling1_shu.png",
    "assets/cursor_batter.png", "assets/cursor_filling.png", "assets/cursor_filling_shu.png", "assets/cursor_flip.png",
    "assets/game.mp3", "assets/home1.mp3", "assets/home2.mp3", 
    "assets/pop.mp3", "assets/popp.mp3", "assets/bag.mp3", "assets/sucess.mp3", "assets/fail.mp3", "assets/faill.mp3", 
    "assets/grilling.mp3", "assets/burnt.mp3", "assets/customer_in.mp3", "assets/game_over.mp3", "assets/smoke.mp3","assets/gold.mp3",
    "assets/yume_jumpscare.mp4",
    "assets/customers/nero_0.png", 
    "assets/customers/nero_1.png",
    "assets/burning.png",
    "assets/fire.mp4",
  ];
  list.push(...MANUAL_ASSETS);
  
  list.push(...collectUrlsFromObject(PanImageURL));
  list.push("assets/pan_fill_shu.png");
  list.push(...collectUrlsFromObject(BagImageURL));
  list.push(...collectUrlsFromObject(DragGhostURL));
  
  for (let typeId = 0; typeId <= CUSTOMER_MAX_ID; typeId++) {
    for (let stateIndex = 0; stateIndex <= 2; stateIndex++) {
      list.push(`assets/customers/${typeId}_${stateIndex}.png`);
    }
  }
  
  if (ENABLE_SPECIAL_CUSTOMERS) {
    Object.values(SPECIAL_CUSTOMER_DATA).forEach(data => {
      if (data.images) {
        data.images.forEach(img => list.push(`assets/customers/${img}`));
      }
    });
  }
  
  list.push(...collectInlineBackgroundUrls());
  await preloadImages(list);
}

const IMAGE_CACHE = new Map();

function normalizeUrl(u) {
  if (!u) return null;
  const m = String(u).match(/url\(['"]?([^'")]+)['"]?\)/);
  return m ? m[1] : u;
}

function cacheImage(src) {
  const url = normalizeUrl(src);
  if (!url) return null;
  if (IMAGE_CACHE.has(url)) return IMAGE_CACHE.get(url);
  const img = new Image();
  img.src = url;
  IMAGE_CACHE.set(url, img);
  return img;
}

async function preloadImages(list) {
  const flat = list.flat ? list.flat() : [].concat(...list);
  const unique = [...new Set(flat.map(normalizeUrl).filter(Boolean))];
  return Promise.all(unique.map((url) => {
    if (IMAGE_CACHE.has(url)) return Promise.resolve();
    return new Promise((resolve) => {
      const ext = url.split('.').pop().toLowerCase();
      if (ext === 'mp3' || ext === 'wav') {
        const audio = new Audio();
        audio.onloadeddata = () => resolve();
        audio.onerror = () => resolve();
        audio.src = url;
        audio.load();
      } else if (ext === 'mp4' || ext === 'webm') {
        const video = document.createElement('video');
        video.onloadeddata = () => resolve();
        video.onerror = () => resolve();
        video.src = url;
        video.preload = 'auto';
      } else {
        const img = new Image();
        img.src = url;
        // [수정] 이미지를 미리 디코딩해서 게임 중 렉 방지
        if (img.decode) {
            img.decode().then(() => {
                IMAGE_CACHE.set(url, img);
                resolve();
            }).catch(() => {
                IMAGE_CACHE.set(url, img);
                resolve();
            });
        } else {
            img.onload = () => { IMAGE_CACHE.set(url, img); resolve(); };
            img.onerror = () => resolve();
        }
      }
    });
  }));
}

function getDifficultyFactor() {
  const MAX_DIFFICULTY_TIME_MS = 300000;
  return elapsedMs / MAX_DIFFICULTY_TIME_MS;
}

const ENABLE_SPECIAL_CUSTOMERS = true; 
let activeSpecialType = null; 
let lastSpecialType = null;   


let isYumeGameOver = false;


const SPECIAL_CUSTOMER_DATA = {
  
  "beggar": {
    id: "beggar",
    prob: 0.2,
    images: ["beggar_0.png", "beggar_1.png", "beggar_2.png"],
    
    dialogOrder: [
      (n) => `돈은 없지만 붕어빵 ${n}개만 적선해주쇼.`,
      (n) => `공짜로 ${n}개만 주소`
    ],
    dialogSuccess: ["흠...나쁘지않군.","음, 고맙수다."],
    dialogFail: ["너무하네 증말!", "쳇.", "인심 참 고약하네."],
    
    rantLines: [
      "그렇게 장사해서 되겠냐?",
      "붕어빵 굽는 솜씨가 영 엉망이구만.",
      "라때는 말야, 어?",
      "상부상조하며 장사하는거야!",
      "재료를 그렇게 아껴서 부자가 되겠나?",
      "에잉 쯧쯧.. 요즘 젊은 사람들은..",
      "손님이 왕이라는 말도 모르나?",
      "거 참.....",
      "내 다시는 오나 봐라.",
      "으휴..."
    ],
    logic: {
      type: "freebie_rant",
    }
  },

  
  "nero": {
    id: "nero",
    prob: 0.15,
    images: ["nero_0.png", "nero_1.png", "nero_2.png"],
    dialogOrder: ["전 탄 붕어빵이 좋아요!!"],
    dialogSuccess: ["맛있게 드세요!"], 
    dialogFail: ["..."],
    logic: {
      type: "arsonist",
    }
  },
  
  "yume": {
    id: "yume",
    prob: 0.2, 
    images: ["yume_0.png", "yume_1.png", "yume_2.png"],
    dialogOrder: [
      (n) => `사장삐, 나 먼저 줄거지? ${n}개만 줘도 돼!`,
      (n) => `사장삐~ ${n}개만 주라! 나 먼저 주면 좋겠어~!`
    ],
    dialogSuccess: ["꺄~최고야~!!"],
    dialogFail: ["피엥..사장삐가 날 무시했어."],
    logic: {
      type: "priority_death", 
    }
  },


  "snowman": {
    id: "snowman",
    prob: 0.2, 
    images: ["snowman_0.png", "snowman_1.png", "snowman_2.png"],
    dialogOrder: ["(눈사람은 말할 수 없다. 눈사람이라서...)"],
    dialogSuccess: ["(눈사람은 몸이 녹을 것 같다. 눈사람이라서...)"],
    dialogFail: ["(눈사람은 떠나야 한다. 눈사람이라서...)"],
    logic: { type: "snowman" }
  },

  "fisher": {
    id: "fisher",
    prob: 0.2, 
    images: ["fisher_0.png", "fisher_0.png", "fisher_0.png"],
    dialogOrder: [
      "여기가 소문으로 듣던 황금어장이군!",
    ],
    dialogSuccess: ["월척이요!"],
    dialogFail: ["..."], 
logic: {
      type: "thief", 
    }
  },
  "otaku": {
    id: "otaku",
    prob: 0.25,
    images: ["otaku_0.png", "otaku_1.png", "otaku_2.png"],
    dialogOrder: ["..."],
    dialogSuccess: ["호오.. 겉바속촉의 밸런스가 나쁘지 않군요.", "합격입니다."],
    dialogFail: ["제 말을 전혀 듣지 않으셨군요.", "흐음. 제 주문이 너무 어려웠던걸까요? 사.장.님?"],
    logic: {
      type: "sequential_talk",
      getSequences: function(n) {
          const toKor = (v) => (v === 3 ? "세 개" : v === 6 ? "여섯 개" : "아홉 개");
          
          const orderTemplates = [
              "일단 OOO로 주문하겠습니다.",
              "제 배 상태를 보니 OOO가 적당하겠군요.",
              "어디 보자... OOO를 먹으면 딱 좋겠는데.",
              "오늘은 가볍게 OOO만 먹어볼까요?",
              "생각해보니 역시 OOO가 낫겠습니다.",
              "잠깐, OOO가 황금비율입니다.",
              "흠, 그냥 OOO로 주십시오.",
              "아니다, OOO가 더 효율적이겠군요. 그걸로 하죠.",
              "음... OOO 정도면 열량 보존 법칙에 위배되지 않겠군요.",
              "친구 몫까지 합쳐서 OOO를 포장해야겠군요. 친.구.가 먹는겁니다. 제가 절.대 다 먹는거 아닙니다.",
              "지금 습도에는 OOO가 가장 바삭함을 유지합니다."
          ];

          const fillers = [
              "붕어빵의 기원은 일본의 타이야키에서 유래했습니다.",
              "밀가루 반죽의 글루텐 형성이 식감에 아주 중요합니다.",
              "마이야르 반응이 일어난 갈색 껍질이 핵심 포인트죠.",
              "저는 사실 슈크림이나 팥이나 둘 다 좋아합니다만.",
              "머리부터 먹는지 꼬리부터 먹는지는 중요치 않습니다.",
              "반죽의 숙성도가 굽기 결과에 큰 영향을 미칩니다.",
              "적절한 온도로 구워야 눅눅해지지 않고 바삭하죠.",
              "잉어빵과 붕어빵의 차이를 아십니까?",
              "붕어빵엔 거의 밀가루만 들어가지만 잉어빵엔 찹쌀과 기름이 들어가죠.",
              "습도가 높은 날에는 반죽이 눅눅해지기 쉽습니다.",
              "붕어빵 틀의 재질은 주철이 열전도율 면에서 유리하죠.",
              "일본에서는 도미빵, 한국에서는 붕어빵. 흥미롭지 않나요?",
              "한 삼십개 정도 주문하겠습니다. 아, 농담입니다. 이건 무시하십쇼."
          ];

          const mentionCount = Math.floor(Math.random() * 3) + 1;
          const numSequence = [];
          const otherOpts = [3, 6, 9].filter(x => x !== n);

          for (let i = 0; i < mentionCount - 1; i++) {
              numSequence.push(otherOpts[Math.floor(Math.random() * otherOpts.length)]);
          }
          numSequence.push(n);

          const finalDialogs = [];
          
          numSequence.forEach((val) => {
              if (Math.random() < 0.6) {
                  finalDialogs.push(fillers[Math.floor(Math.random() * fillers.length)]);
              }
              const tmpl = orderTemplates[Math.floor(Math.random() * orderTemplates.length)];
              finalDialogs.push(tmpl.replace("OOO", toKor(val)));
          });

          finalDialogs.push("그럼, 부탁합니다.");
          return finalDialogs;
      }
    }
  },
};

function playBgmSequence(type) {
  if (window.isBgmOn === false) {
    if (bgmAudio) {
      bgmAudio.pause();
      bgmAudio.currentTime = 0;
    }
    return;
  }

  if (currentBgmType === type && bgmAudio && !bgmAudio.paused) return;

  if (bgmAudio) {
    bgmAudio.onended = null;
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  }

  currentBgmType = type;

  if (type === "home") {
    playHomeTrack(0);
  } else if (type === "game") {
    if (!window.isBgmOn) return; 

    bgmAudio = new Audio("assets/game.mp3");
    bgmAudio.loop = true;
    bgmAudio.volume = 0.5;
    tryPlayBgm(bgmAudio);
  }
}

function playHomeTrack(index) {
  if (currentBgmType !== "home") return;
  if (!isBgmOn) return;
  if (window.isBgmOn === false) return;

  homeTrackIndex = index;
  const fileName = (index === 0) ? "assets/home1.mp3" : "assets/home2.mp3";

  if (bgmAudio) {
    bgmAudio.onended = null;
    bgmAudio.pause();
  }

  bgmAudio = new Audio(fileName);
  bgmAudio.loop = false; 
  bgmAudio.volume = 0.5;

  bgmAudio.onended = () => {
    if (currentBgmType === "home") {
      playHomeTrack((homeTrackIndex + 1) % 2);
    }
  };

  tryPlayBgm(bgmAudio);
}

function tryPlayBgm(audioObj) {
  const playPromise = audioObj.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      const resume = () => {
        if (bgmAudio) bgmAudio.play();
        window.removeEventListener("pointerdown", resume);
        window.removeEventListener("keydown", resume);
      };
      window.addEventListener("pointerdown", resume);
      window.addEventListener("keydown", resume);
    });
  }
}

const SFX_CACHE = {};

function playSfx(fileName, volume = 1.0) {
  if (!isSfxOn) return;
  if (window.isSfxOn === false) return;

  if (!SFX_CACHE[fileName]) {
    const audio = new Audio(fileName);
    audio.preload = 'auto'; 
    audio.load();
    SFX_CACHE[fileName] = audio;
  }


  const sfx = SFX_CACHE[fileName].cloneNode();
  sfx.volume = volume;
  sfx.play().catch(() => {});
}

function resizeGame() {

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  window.scrollTo(0, 0);
  
  const scaler = document.getElementById("total-scale-root");
  const overlay = document.getElementById("rotate-overlay");
  
  if (!scaler) return;

  
  const ORIGINAL_WIDTH = 1280;
  const ORIGINAL_HEIGHT = 820; 

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const isPortrait = vh > vw;

  
  let scale = Math.min(vw / ORIGINAL_WIDTH, vh / ORIGINAL_HEIGHT);
  
  
  if (!isFinite(scale) || scale <= 0) scale = 1;

  GAME_SCALE = scale; 

  
  const displayW = ORIGINAL_WIDTH * scale;
  const displayH = ORIGINAL_HEIGHT * scale;

  const left = (vw - displayW) / 2;
  const top  = (vh - displayH) / 2;

  
// [수정] 직접 좌표 계산 대신 CSS 중앙 정렬 사용 (아이패드 쏠림 방지)
  scaler.style.position = "absolute";
  scaler.style.left = "50%";
  scaler.style.top = "50%";
  // translate(-50%, -50%)로 정중앙을 맞추고, 그 상태에서 scale을 적용
  scaler.style.transform = `translate(-50%, -50%) scale(${scale})`;
  scaler.style.transformOrigin = "center center";
  
// [추가] 사파리 확대/스크롤 원천 차단
  document.documentElement.style.touchAction = "none";
  document.body.style.touchAction = "none";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.body.style.height = "100%";

  // 사파리 제스처(핀치줌, 더블탭) 강제 무시 리스너 등록 (중복 등록 방지)
  if (!window.safariZoomBlockerAdded) {
      window.safariZoomBlockerAdded = true;
      // 핀치 줌(손가락 벌리기) 방지
      document.addEventListener('gesturestart', function(e) { e.preventDefault(); }, {passive: false});
      // 더블 클릭(PC/모바일 공통) 방지
      document.addEventListener('dblclick', function(e) { e.preventDefault(); }, {passive: false});
      // 빠른 더블 탭 방지 (가장 중요)
      let lastTouchEnd = 0;
      document.addEventListener('touchend', function(event) {
          const now = (new Date()).getTime();
          if (now - lastTouchEnd <= 300) { event.preventDefault(); }
          lastTouchEnd = now;
      }, {passive: false});
  }

  
  if (overlay) {
    overlay.style.display = isPortrait ? "flex" : "none";
  }

  
  const toolCursor = document.getElementById("tool-cursor");
  if (toolCursor) {
    const baseSize = 240;
    const size = baseSize * GAME_SCALE;
    toolCursor.style.width = size + "px";
    toolCursor.style.height = size + "px";
  }
}

let resizeTimer = null;

function onSafeResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
      if (typeof resizeGame === "function") {
          resizeGame(); 
      }
      window.scrollTo(0, 0);
      
  }, 200);
}

window.addEventListener("resize", onSafeResize);
window.addEventListener("orientationchange", onSafeResize);

window.addEventListener("load", async () => {
  const keySounds = ["assets/pop.mp3", "assets/popp.mp3", "assets/bag.mp3", "assets/sucess.mp3", "assets/fail.mp3"];
  keySounds.forEach(src => {
      const a = new Audio(src);
      a.preload = 'auto';
      a.load();
      SFX_CACHE[src] = a;
  });  
  setScreen(STATE_LOADING);
  resizeGame();
  if (window.goToHome) {
        const originGoToHome = window.goToHome;
        window.goToHome = function() {
            originGoToHome();
            playBgmSequence("home");
        };
    }
  if (typeof preloadAllGameImages === "function") {
    await preloadAllGameImages();
  } else {
    await preloadImages(CRITICAL_IMAGES);
  }

  cacheDomElements();
  loadStats();
  setupEvents();
  if (window.fetchTeamScores) window.fetchTeamScores();
  initSnow();
  initMusicButton();
  setScreen(STATE_TITLE);
});


function scaledPx(value) {
  return (value * (GAME_SCALE || 1)) + "px";
}

function showTeamConfirmSequence(teamId) {
    const parent = document.getElementById("screen-login") || document.body;
    const old = document.getElementById("team-confirm-overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.id = "team-confirm-overlay";
    const prefix = (teamId === "shu") ? "shu" : "red";
    const make = (cls, file) => {
        const el = document.createElement("div");
        el.className = `confirm-asset ${cls}`;
        el.style.backgroundImage = `url('assets/${file}')`;
        return el;
    };
    overlay.appendChild(make("confirm1", `${prefix}_1.png`));
    overlay.appendChild(make("confirm2", `${prefix}_2.png`));
    overlay.appendChild(make("confirm3", `${prefix}_3.png`));
    parent.appendChild(overlay);

    const teamOverlay = document.getElementById("team-overlay");
    if (teamOverlay) teamOverlay.style.display = "none";
    requestAnimationFrame(() => overlay.classList.add("anim-in"));

    setTimeout(() => {
        const ok = window.confirm("이 팀으로 결정하시겠습니까?");
        if (ok) {
            currentTeam = teamId; 
            if (window.updateUserTeam) window.updateUserTeam(teamId);
            
            const overlay = document.getElementById("team-confirm-overlay");
            if(overlay) overlay.remove();
            const teamOverlay = document.getElementById("team-overlay");
            if(teamOverlay) teamOverlay.remove();
            
            const loginBox = document.getElementById("login-box-container");
            if(loginBox) loginBox.classList.remove("fade-out");

            if (window.goToHome) window.goToHome();
        } else {
            const overlay = document.getElementById("team-confirm-overlay");
            if(overlay) overlay.remove();
            const teamOverlay = document.getElementById("team-overlay");
            if (teamOverlay) teamOverlay.style.display = "block";
        }
    }, 1800);
}

function attachTeamPickHandlers(overlay) {
  const t4 = overlay.querySelector(".team4");
  const t5 = overlay.querySelector(".team5");
  if (t4) {
    t4.addEventListener("click", () => {
      if (teamLocked) return;
      showTeamConfirmSequence("redbean");
    });
  }
  if (t5) {
    t5.addEventListener("click", () => {
      if (teamLocked) return;
      showTeamConfirmSequence("shu");
    });
  }
}



const STATE_LOADING = "loading";
const STATE_TITLE = "title";
const STATE_TEAM = "team";
const STATE_TUTORIAL = "tutorial";
const STATE_GAME = "game";
const STATE_RESULT = "result";
let isGamePlayStarted = false;   
let tutoOffsetX = 0;
let tutoDragging = false;
let tutoDragStartX = 0;
let tutoDragStartOffset = 0;

const TUTO_SCALE = 0.92;       
const TUTO_SCREEN_SHIFT = -20; 
const TUTO_HINT_OFFSET = -40;  
const screenLoading = document.getElementById("screen-loading");
let grillingAudio = new Audio("assets/grilling.mp3");
grillingAudio.volume = 1.0;
grillingAudio.loop = true;
let burntAudio = new Audio("assets/burnt.mp3");
burntAudio.loop = true;
const NUM_PANS = 8;
const NUM_CUSTOMERS = 3;
const NUM_TRAY_SLOTS = 6;
const TRAY_LIFETIME = Infinity;

function enterGameWithTutorial() {
  if(window.disconnectDB) window.disconnectDB();
  isGamePlayStarted = false;

  resetGameData();
  setScreen(STATE_GAME);

  showTutorialOverlay();

  startGameLoop();
}



const CUSTOMER_RESULT_STAY_MS = 1200;  
const CUSTOMER_LEAVE_MOVE_MS = 800;    

const WEIRD_ORDERS = [
  "아이스 아메리카노요!",
  "국밥 한그릇만 주이소",
  "피자 붕어빵은없나요?",
  "초코 붕어빵이요!",
  "음....뭐 시키려고 했더라.",
  "아아 한잔만 주세요.",
  "여기 로또 파나요?",
  "보드카 마티니, 젓지 말고 흔들어서.",
  "그그 뭐더라 아 그 뭐지 그...",
  "말차 붕어빵이 있으면 좋을텐데요.",
  "진짜 붕어가 들어간 붕어빵은 없나요?"
];

const WEIRD_EXIT_DIALOGS = [
  "아, 없나봐요.",
  "왜없지?",
  "아깝네..",
  "다른데 가봐야겠다.",
  "쩝..."
];

const BUSY_LEAVE_DIALOGS = [
  "앗! 죄송해요, 급한 전화가 와서!",
  "아, 지갑을 안 가져왔네...",
  "죄송합니다, 제가 바빠서요!",
  "너무 오래 걸리네요. 그냥 갈게요.",
  "버스 왔다! 죄송해요!",
  "어? 약속 시간이 다 됐네.",
  "다음에 다시 올게요!"
];

const CUSTOMER_TEXTS = {
  order: [
    (n) => `붕어빵 ${n}개 주세요.`,
    (n) => `따땃한 붕어빵 ${n}개만 부탁드려요.`,
    (n) => `${n}개 포장해 주세요.`,
    (n) => `붕어빵 ${n}개 주세요!`,
    (n) => `붕빵 ${n}`,
    (n) => `${n}개의 붕어빵이 있다면 제 인생이 더 윤택해지겠죠.`,
    (n) => `붕어빵 ${n}개만 주이소.`,
    (n) => `음...너무 많이 먹으면 좀 그렇고 ${n}개가 적당할것같아요.`,
    (n) => `붕어빵 ${n}개만 주세요.`,
    (n) => `퍼뜩 ${n}개 가져온나.`,
    (n) => `3개? 아니 씁 9개? 아니다 그냥 ${n}개 주세요.`,
    (n) => `${n}`,
    (n) => `${n}개의 붕어빵을 간청드립니다.`,
    (n) => `${n}개 빨리요!!`,
    (n) => `${n}개의 붕어빵이면 제 생명을 살릴 수 있습니다.`,
    (n) => `${n}마리만 낚아주세요.`,
    (n) => `${n}개 맛있게 구워주세요~`,
    (n) => `오늘은 ${n}개만 먹어야겠다~`,
    (n) => `와, 벌써 붕어빵 시즌이네요. ${n}개요!`,
    (n) => `어머~ 붕어빵이잖아? ${n}개만 부탁해요~`,
    (n) => `${n}개 부탁드립니다.`,
    (n) => `어 ${n}개.`,
    (n) => `${n}개요~!`,
    (n) => `${n}마리만 있다면 세계를 구할 수 있습니다.`,
    (n) => `태초에, ${n}개의 붕어빵이 선택되었다.`,
    (n) => `${n}개가 딱 적당해요!`,
    (n) => `캬~ 역시 겨울엔 뜨끈하고 따뜻하게 붕어빵 ${n}개지.`,
    (n) => `맛있게 ${n}개만 찵여와주세요.`,
    (n) => `${n}개요.`,
    (n) => `신선한 놈으로 ${n}마리만 골라주세요.`,
    (n) => `${n}개만 주세요!`,
    (n) => `붕빵 ${n}마리요.`,
    (n) => `붕어 ${n}마리 주세요!`,
    (n) => `${n}개만 건네주거라.`,
    (n) => `1인분이요! 그러니깐 ${n}개요.`,
    (n) => `${n}개만 주세요. 뭐라고? 넌 안먹는다고? 그럼 ${n}개만 주세요.`,
  ],
  success: [
    "와, 이거지예.",
    "감삼다.",
    "붕어빵!!",
    "겨울엔 붕어빵이 최고죠.",
    "감사합니다!",
    "감사합니다~",
    "오라오라오라오라",
    "야르~",
    "이렇게 완벽한 붕어빵은 처음 봐요.",
    "붕어빵에서 윤이 나네요.",
    "우와아앙",
    "wow.",
    "최고에요!",
    "많이 파세요~!",
    "내년에도 장사해주세요!",
    "대기업이 당신을 캐스팅 해야해요.",
    "이 따뜻한 봉투를 쥐고나서야 비로소 겨울이 왔다는게 실감나요.",
    "따숩군.",
    "어메~이징.",
    "너무 신선해서 바로 바다로 돌려보내도 되겠어요.",
    "너무 기대돼요!",
    "붕어빵 학과 나오셨어요?",
    "붕어빵의 장인으로 임명합니다.",
    "대단하세요!",
    "엄마 저는 커서 붕어빵집 사장이 될래요.",
    "빛이 있으라!",
    "세상은 아직 살만하네요.",
    "제 인생의 의미를 찾았어요. 아주 오랫동안 찾아왔죠.",
    "광명을 되찾았다!",
    "GOAT.",
    "그저 빛...",
    "이예이~",
    "붕어빵 학원 다니셨나요?",
    "프랜차이즈 문의 받나요?",
    "붕어빵, 내 삶의 빛. 나의 영혼이여.",
    "레전드로다.",
    "울랄라!",
    "겨울에도 활기가 도네요.",
    "겨울이 있는 이유는 이 붕어빵을 만나기 위해서였죠.",
    "붕어빵만 있어도 인생은 견딜만하죠.",
    "위대한 업적입니다.",
    "바삭바삭바삭.",
    "부자되세요!",
    "붕어빵!!",
    "잘 먹겠습니다!",
    "역시 여기 붕어빵이 최고네요.",
    "앗 뜨뜨!!",
    "따뜻하니 좋네요",
    "겨울엔 역시 붕어빵이죠.",
    "붕어빵 포식이다!!",
    "마을에 잔치를 열어도 되겠어요.",
    "애들이 좋아할거에요!",
    "인생붕어빵이에요!",
    "흐흐흐",
    "붕어빵, 너무 아름답고 부드러워요.",
    "캬, 예술이네요.",
    "우흐흐흫ㅎ흐흐흐하하하ㅏ하하핳하",
    "붕어의 전설이로다!",
    "명품 붕어빵, 바로 이곳에!",
    "인생 별거있나요? 붕어빵이 전부죠.",
    "찬란하도다! 영광스럽도다!",
    "고마워요!",
    "고맙습니데이.",
    "진심으로 감사드립니다. 제 영웅이세요.",
    "아자스!",
    "크르르르륵 크르릉 캬옹캬옹!!!",
    "퍼가요~",
  ],
  fail: [
    "제가 바빠서요. 죄송합니다.",
    "곤란.",
    "죄송합니다! 조금 바빠서.",
    "지금까지 붕어빵을 사랑해주셔서 감사합니다.",
    "에반데.",
    "기각되었습니다.",
    "아~!!",
    "아......",
    "음...",
    "흠.",
    "리뷰 남길게요~",
    "너무하세요~",
    "소비자권익위원회에 신고하겠습니다.",
    "고소하겠습니다.",
    "붕어빵의 원수!",
    "붕어빵이나 굽는 사람이 다~ 그렇죠 뭐.",
    "자네는 붕어빵을 구울 자격이 없어.",
    "느리구나, 붕어빵을 굽는 것조차.",
    "이건 않이지예.",
    "조금 아쉽네요...",
    "다음에는 제대로 부탁드릴게요.",
    "통탄스럽도다! 말세로다!",
  ],
};

function setBubbleFontSize(textEl, text) {
  if (!textEl) return;
  const len = text ? text.length : 0;

  let size;
  if (len <= 10) {
    size = 24;          
  } else if (len <= 20) {
    size = 22;
  } else if (len <= 30) {
    size = 20;
  } else if (len <= 40) {
    size = 18;
  } else {
    size = 17;          
  }

  textEl.style.fontSize = size + "px";
}



function pickCustomerLine(kind, count) {
  const list = CUSTOMER_TEXTS[kind];
  if (!list || !list.length) return "";
  const idx = Math.floor(Math.random() * list.length);
  const line = list[idx];
  return (typeof line === "function") ? line(count) : line;
}


const TICK_MS = 200;

const PHASE1_TIME = 2500;
const PHASE2_TIME = 2500;
const SMOKE_TIME = 8000;

const BASE_UNIT_PRICE = 1000;
const MISTAKE_LIMIT = 5;
const SPECIAL_CHANCE = 0.05;


const CUSTOMER_POS_SLOTS = [80, 450, 830];
const CUSTOMER_POS_OUT_LEFT = -350;
const CUSTOMER_POS_OUT_RIGHT = 1300;
const CUSTOMER_MAX_ID = 14;
const CUSTOMER_TYPES = Array.from({ length: CUSTOMER_MAX_ID + 1 }, (_, i) => i);


const PanState = {
  EMPTY: "empty",
  BATTER1: "batter1",
  FILL: "fill",
  PHASE1: "phase1",
  SMOKE1: "smoke1",
  PHASE2: "phase2",
  SMOKE2: "smoke2",
  DONE: "done",
  BURNT: "burnt",
};

const PanImageURL = {
  [PanState.EMPTY]: "url('assets/pan_empty.png')",
  [PanState.BATTER1]: "url('assets/pan_batter1.png')",
  [PanState.FILL]: "url('assets/pan_fill.png')",
  [PanState.PHASE1]: "url('assets/pan_phase1.png')",
  [PanState.SMOKE1]: "url('assets/pan_phase1.png')",
  [PanState.PHASE2]: "url('assets/pan_phase2.png')",
  [PanState.SMOKE2]: "url('assets/pan_phase2.png')",
  [PanState.DONE]: "url('assets/pan_done.png')",
  [PanState.BURNT]: "url('assets/pan_burnt.png')",
  "done_special": "url('assets/pan_done_special.png')",
};

function getPanImageUrl(pan) {
  if (pan.state === PanState.DONE && pan.hasSpecial) {
    return PanImageURL["done_special"]; 
  }
  if (pan.state === PanState.FILL && isShuTeam()) {
    return "url('assets/pan_fill_shu.png')";
  }
  return PanImageURL[pan.state];
}
const BagImageURL = {
  empty: "url('assets/bag_0.png')",
  normal_1: "url('assets/bag_1.png')",
  normal_2: "url('assets/bag_2.png')",
  normal_3: "url('assets/bag_3.png')",
  special_1: "url('assets/bag_special_1.png')",
  special_2: "url('assets/bag_special_2.png')",
  special_3: "url('assets/bag_special_3.png')",
};

const ToolCursorURL = {
  batter: "url('assets/cursor_batter.png')",
  filling: "url('assets/cursor_filling.png')",
  flip: "url('assets/cursor_flip.png')",
};

function getToolCursorImage(toolName) {
  if (toolName === "filling") {
    return isShuTeam()
      ? "url('assets/cursor_filling_shu.png')"
      : "url('assets/cursor_filling.png')";
  }
  return ToolCursorURL[toolName] || "none";
}


const DragGhostURL = {
  bread: "url('assets/drag_bread.png')",
  bread_special: "url('assets/drag_bread_special.png')",
  bread_undercooked: "url('assets/drag_bread_undercooked.png')", 
  bread_burnt: "url('assets/drag_bread_burnt.png')",             
  bag: "url('assets/drag_bag.png')",
  bag_special: "url('assets/drag_bag_special.png')",
};

function updateHpBar() {
  if (!hpBar) return;

  const remain = Math.max(0, MISTAKE_LIMIT - mistakes);

  let img = "hp4.png"; 
  if (remain >= 5) img = "hp.png";
  else if (remain === 4) img = "hp1.png";
  else if (remain === 3) img = "hp2.png";
  else if (remain === 2) img = "hp3.png";
  else img = "hp4.png";

  hpBar.style.backgroundImage = `url('assets/${img}')`;
}
function triggerHpShake() {
  const hpBar = document.getElementById("hp-bar");
  if (!hpBar) return;

  
  hpBar.classList.remove("shake");
  void hpBar.offsetWidth; 
  hpBar.classList.add("shake");
}


const NUM_CUSTOMER_TYPES = 3;

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeCustomerOrderText(size) {
  const fn = randChoice(CUSTOMER_ORDER_LINES);
  return fn(size);
}

function pickDialog(kind) {
  const list = CUSTOMER_DIALOGS[kind] || [];
  return list.length ? randChoice(list) : "";
}


let hasSeenTutorial = localStorage.getItem("fishbun_tuto_done") === "true";

window.checkTutorialAndStart = function() {
    if (window.disconnectDB) window.disconnectDB();

    if (window.currentUser && window.currentUser.team) {
        currentTeam = window.currentUser.team;
    }

    const hasSeen = localStorage.getItem("fishbun_tuto_done") === "true";

    resetGameData();
    setScreen(STATE_GAME);
    if (window.resizeGame) window.resizeGame();

    const snowLayer = document.getElementById("snow-layer");
    if (snowLayer) snowLayer.style.display = "block";

    if (hasSeen) {
        isGamePlayStarted = true;
        startGameLoop();
    } else {
        isGamePlayStarted = false;
        showTutorialOverlay();
    }
};

function enterGameWithTutorial() {
  isGamePlayStarted = false;
  resetGameData();
  setScreen(STATE_GAME);
  
  
  if(typeof resizeGame === 'function') resizeGame(); 

  showTutorialOverlay();
  hasSeenTutorial = true;
  startGameLoop();
}


let gameState = STATE_TITLE;
let currentTeam = "shu";
function isShuTeam() {
  return currentTeam === "shu";   
}
let isMouseDown = false;
let mySessionBreads = 0; 
let teamLocked = false;

let pans = [];
let trayBreads = [];
let customers = [];
let bagCount = 0;
let bagHasSpecial = false;
let bagBadCount = 0;
let money = 0;
let mistakes = 0;
let combo = 0;
let elapsedMs = 0;
let customerCooldowns = [];
let currentTool = null;
let gameTimer = null;
let breadsBaked = 0;
let bestMoney = 0;
let bestBreads = 0;
let ranking = [];
let dragData = null;
let dragActive = false;
const isTouchDevice =
  ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);


window.addEventListener("pointerdown", (e) => {
  if (e.pointerType) {
    lastPointerType = e.pointerType;
  }
});
let tapEffectTimer = null;

let bgmAudio = null;
let isBgmOn = true;
let isSfxOn = true;
let currentBgmType = "none"; 
let homeTrackIndex = 0;


let securityClickHistory = [];
const MAX_CPS = 300; 

function isAbnormalClickSpeed() {
  const now = Date.now();

  securityClickHistory = securityClickHistory.filter(
    t => now - t < 1000
  );

  securityClickHistory.push(now);

  if (securityClickHistory.length > MAX_CPS) {
    triggerCheaterLockdown();
    return true;
  }

  return false;
}

let snowCanvas = null;
let snowCtx = null;
let snowflakes = [];
const SNOW_COUNT = 120;

function makeSnowflake(randomY) {
  return {
    x: Math.random() * GAME_WIDTH,
    y: randomY ? Math.random() * GAME_HEIGHT : -10,
    r: 1 + Math.random() * 3,
    vy: 0.5 + Math.random() * 1.5,
    vx: -0.5 + Math.random() * 1.0,
  };
}

function initSnow() {
  snowCanvas = document.getElementById("snow-canvas");
  if (!snowCanvas) return;
  snowCtx = snowCanvas.getContext("2d");
  snowCanvas.width = GAME_WIDTH;
  snowCanvas.height = GAME_HEIGHT;

  snowflakes = [];
  for (let i = 0; i < SNOW_COUNT; i++) {
    snowflakes.push(makeSnowflake(true));
  }
  requestAnimationFrame(snowLoop);
}

function snowLoop() {
  if (!snowCtx) return;
  if (window.isSnowOn === false) {
      snowCtx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      return; 
  }
  snowCtx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  snowCtx.fillStyle = "rgba(255,255,255,0.9)";

  for (let flake of snowflakes) {
    flake.x += flake.vx;
    flake.y += flake.vy;

    if (flake.y > GAME_HEIGHT + 10) {
      flake.y = -10;
      flake.x = Math.random() * GAME_WIDTH;
    }
    if (flake.x < -10) flake.x = GAME_WIDTH + 10;
    if (flake.x > GAME_WIDTH + 10) flake.x = -10;

    snowCtx.beginPath();
    snowCtx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    snowCtx.fill();
  }

  requestAnimationFrame(snowLoop);
}



const screenTitle = document.getElementById("screen-title");
const screenTeam = document.getElementById("screen-team");
const screenTutorial = document.getElementById("screen-tutorial");
const screenGame = document.getElementById("screen-game");
const screenResult = document.getElementById("screen-result");

const teamCards = document.querySelectorAll(".team-card");
const btnTitleStart = document.getElementById("title-button");
const btnTeamStart = document.getElementById("btn-team-start");
const btnTutorialStart = document.getElementById("btn-tutorial-start");


const hudMoney = document.getElementById("hud-money");
const hudMistake = document.getElementById("hud-mistake");
const hudTeam = document.getElementById("hud-team");
const hudBest = document.getElementById("hud-best");
const hudBreads = document.getElementById("hud-breads");
const hpBar = document.getElementById("hp-bar");

const panImageElems = [];
const smokeImageElems = [];
const trayBreadElems = [];

const customerGroupElems = document.querySelectorAll(".customer-group");

const bagCountElem = document.getElementById("bag-count");
const bagImageElem = document.getElementById("bag-img");

const customerUIElems = document.querySelectorAll(".customer-ui");
const displayTrayUIElem = document.getElementById("display-tray-ui");
const panUIElems = document.querySelectorAll(".pan-ui");
const toolButtonUIElems = document.querySelectorAll(".tool-btn-ui");
const bagUIElem = document.getElementById("bag-ui");

const toolCursor = document.getElementById("tool-cursor");

const toolImageElems = {
  batter: document.getElementById("tool-img-batter"),
  filling: document.getElementById("tool-img-filling"),
  flip: document.getElementById("tool-img-flip"),
};


const resultMoneyText = document.getElementById("result-money-text");
const resultBreadText = document.getElementById("result-bread-text");
const resultBestMoneyText = document.getElementById("result-best-money-text");
const resultBestBreadText = document.getElementById("result-best-bread-text");
const resultRankingList = document.getElementById("result-ranking-list"); 
const resultCommentText = document.getElementById("result-comment-text");
const btnResultRetry = document.getElementById("btn-result-retry");

function startGameOverEffects() {
  
  if (gameOverSmoke1 && gameOverSmoke2) {
    gameOverSmoke1.classList.add("go-smoke-visible");
    gameOverSmoke2.classList.remove("go-smoke-visible");

    if (gameOverSmokeTimer) clearInterval(gameOverSmokeTimer);
    gameOverSmokeTimer = setInterval(() => {
      const v1 = gameOverSmoke1.classList.contains("go-smoke-visible");
      gameOverSmoke1.classList.toggle("go-smoke-visible", !v1);
      gameOverSmoke2.classList.toggle("go-smoke-visible", v1);
    }, 500); 
  }

  
  if (gameOverPaperWrap) {
    gameOverPaperWrap.classList.remove("drop-in");
    
    void gameOverPaperWrap.offsetWidth;

    if (gameOverPaperTimer) clearTimeout(gameOverPaperTimer);
    gameOverPaperTimer = setTimeout(() => {
      gameOverPaperWrap.classList.add("drop-in");
    }, 300); 
  }
}

function stopGameOverEffects() {
  if (gameOverSmokeTimer) {
    clearInterval(gameOverSmokeTimer);
    gameOverSmokeTimer = null;
  }
  if (gameOverPaperTimer) {
    clearTimeout(gameOverPaperTimer);
    gameOverPaperTimer = null;
  }
}



const gameOverSmoke1 = document.getElementById("gameover-smoke1");
const gameOverSmoke2 = document.getElementById("gameover-smoke2");
const gameOverPaperWrap = document.getElementById("gameover-paper-wrap");

let gameOverPaperTimer = null;

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes shiver {
    0% { transform: translate(0, 0); }
    25% { transform: translate(-3px, 1px); }
    50% { transform: translate(3px, -2px); }
    75% { transform: translate(-2px, 2px); }
    100% { transform: translate(0, 0); }
  }
  .customer-shiver {
    animation: shiver 0.1s infinite;
  }
`;
document.head.appendChild(styleSheet);

function cacheDomElements() {
  for (let i = 0; i < NUM_PANS; i++) {
    panImageElems.push(document.getElementById(`pan-img-${i}`));
    smokeImageElems.push(document.getElementById(`smoke-img-${i}`));
  }
  for (let i = 0; i < NUM_TRAY_SLOTS; i++) {
    trayBreadElems.push(document.getElementById(`tray-bread-${i}`));
  }
}


function loadStats() {
  if (window.currentUser) {
    bestMoney = window.currentUser.bestMoney || 0;
    bestBreads = window.currentUser.totalBreads || 0; 
  } else {
    bestMoney = 0;
    bestBreads = 0;
  }
}

function setScreen(state) {
  gameState = state;
  if (state === STATE_GAME) {
      playBgmSequence("game");
    } else {
      playBgmSequence("home");
    }

  if (screenLoading) {
    screenLoading.classList.toggle("active", state === STATE_LOADING);
  }

  if (screenTitle) {
    screenTitle.classList.toggle("active", state === STATE_TITLE);
    if (state === STATE_TITLE) {
      screenTitle.classList.remove("anim-start");
      void screenTitle.offsetWidth;
      screenTitle.classList.add("anim-start");
    }
  }

  screenTeam.classList.toggle("active", state === STATE_TEAM);
  screenTutorial.classList.toggle("active", state === STATE_TUTORIAL);
  screenGame.classList.toggle("active", state === STATE_GAME);
  screenResult.classList.toggle("active", state === STATE_RESULT);
}





function resetGameData() {
  mySessionBreads = 0;
  isYumeGameOver = false;
  const snowLayer = document.getElementById("snow-layer");
  const gameScreen = document.getElementById("screen-game");
  
  if (snowLayer && gameScreen && snowLayer.parentNode !== gameScreen) {
    gameScreen.appendChild(snowLayer);
    
    snowLayer.style.zIndex = "2"; 
    snowLayer.style.display = "block";
  }

  pans = [];
  for (let i = 0; i < NUM_PANS; i++) {
    pans.push({
      state: PanState.EMPTY,
      stateMs: 0,
      hasSpecial: false,
    });
  }
  trayBreads = [];
  customers = new Array(NUM_CUSTOMERS).fill(null);
  customerCooldowns = new Array(NUM_CUSTOMERS).fill(0);
  elapsedMs = 0;
  money = 0;
  mistakes = 0;
  combo = 0;
  bagCount = 0;
  bagHasSpecial = false;
  bagBadCount = 0;
  breadsBaked = 0;
  setTool(null);
  updateHud();
  updateAllPans();
  updateTray();
  updateAllCustomers();
  updateBag();
  if (grillingAudio) { grillingAudio.pause(); grillingAudio.currentTime = 0; }
  if (burntAudio) { burntAudio.pause(); burntAudio.currentTime = 0; }
}

function updateHud() {
  if (hudMoney) hudMoney.textContent = `수익 ${money}원`;
  if (hudBreads) hudBreads.textContent = `붕어빵 ${breadsBaked}개`;
  if (hudBest) hudBest.textContent = `최고수익 ${bestMoney}원`;

  
  if (hudMistake) hudMistake.textContent = "";

  updateHpBar();
  const hudCombo = document.getElementById("hud-combo");
    if (hudCombo) {
        if (combo > 1) {
            hudCombo.style.display = "block";
            hudCombo.textContent = `${combo} 연속!`;
            hudCombo.style.transform = "none";

        } else {
            hudCombo.style.display = "none";
        }
    }
}


function updatePan(index) {
  const pan = pans[index];
  const imgEl = panImageElems[index];
  const smokeEl = smokeImageElems[index];

  const isSmoking =
    pan.state === PanState.SMOKE1 || pan.state === PanState.SMOKE2;
  smokeEl.classList.toggle("is-smoking", isSmoking);

  const imgUrl = getPanImageUrl(pan);

  if (imgEl.style.backgroundImage !== imgUrl) {
    imgEl.style.backgroundImage = imgUrl;
  }
}


function updateAllPans() {
  for (let i = 0; i < NUM_PANS; i++) updatePan(i);
}

function updateTray() {
  for (let i = 0; i < NUM_TRAY_SLOTS; i++) {
    const bread = trayBreads[i];
    const el = trayBreadElems[i];

    if (bread) {
      el.style.display = "block";

      const quality = bread.quality || "normal";
      let imgUrl;

      if (quality === "burnt") {
        imgUrl = DragGhostURL.bread_burnt;
      } else if (quality === "undercooked") {
        imgUrl = DragGhostURL.bread_undercooked;
      } else {
        imgUrl = bread.hasSpecial
          ? DragGhostURL.bread_special
          : DragGhostURL.bread;
      }

      el.style.backgroundImage = imgUrl;
    } else {
      el.style.display = "none";
      el.style.backgroundImage = "none";
    }
  }
}


function getBreadQualityFromPan(pan) {
  if (pan.state === PanState.DONE) return "normal";
  if (pan.state === PanState.BURNT) return "burnt";
  if (pan.state === PanState.PHASE2) return "undercooked"; 
  return "normal";
}

function addBreadToBag(hasSpecial, quality) {
  playSfx("assets/bag.mp3", 1.0);playSfx("assets/bag.mp3", 1.0);
  bagCount += 1;
  if (hasSpecial) bagHasSpecial = true;
  if (quality === "burnt" || quality === "undercooked") {
    bagBadCount += 1;
  }
  updateBag();
}





function updateCustomer(index) {
  const c = customers[index];
  const groupEl = customerGroupElems[index];
  const bubbleEl = groupEl.querySelector(".speech-bubble");
  const spriteEl = groupEl.querySelector(".customer-sprite");
  const fillEl = bubbleEl.querySelector(".bubble-fill");
  const textEl = bubbleEl.querySelector(".bubble-text");

if (!c) {
    bubbleEl.classList.remove("active");
    if (spriteEl) {
      spriteEl.style.backgroundImage = "none";
      spriteEl.classList.remove("customer-shiver"); 
    }
    if (fillEl) fillEl.style.transform = "translateY(100%)";
    if (textEl) textEl.textContent = "";
    return;
  }

  
  const targetLeft = c.isLeaving
    ? CUSTOMER_POS_OUT_RIGHT
    : CUSTOMER_POS_SLOTS[index];
  groupEl.style.left = targetLeft + "px";

  

  const phase = c.phase || "order";
  const facePhase = c.facePhase || phase;

  let stateIndex = 0; 
  if (facePhase === "success") stateIndex = 1;
  else if (facePhase === "fail" || phase === "rant") {
      stateIndex = 2;
    }
  if (c.type === "fisher" || c.isWeirdOrder) {
    stateIndex = 0;
  }  
  if (spriteEl) {
    if (typeof c.type === 'string') {
      spriteEl.style.backgroundImage = `url('assets/customers/${c.type}_${stateIndex}.png')`;
    } else {
      const typeId = (typeof c.type === "number") ? c.type : 0;
      spriteEl.style.backgroundImage = `url('assets/customers/${typeId}_${stateIndex}.png')`;
    }

    
    if (c.specialId === "beggar" && phase === "rant") {
      spriteEl.classList.add("customer-shiver");
    } else {
      spriteEl.classList.remove("customer-shiver");
    }


  }

  if (c.isLeaving && !c.isWeirdOrder) {
    bubbleEl.classList.remove("active");
  } else {
    bubbleEl.classList.add("active");
  }

  
  
  if (textEl) {
    const txt = c.dialog || "";
    textEl.textContent = txt;
    setBubbleFontSize(textEl, txt);   
  }


  

  if (fillEl) {
    let tPercent = 0;
    
    if (c.phase === "rant") {
       tPercent = 100; 
    } else if (c.phase === "order" && typeof c.orderWaitMs === "number" && c.orderWaitMs > 0) {
      let remainRatio = c.waitMs / c.orderWaitMs;   
      if (remainRatio < 0) remainRatio = 0;
      if (remainRatio > 1) remainRatio = 1;
      tPercent = (1 - remainRatio) * 100;           
    } else {
      tPercent = 100; 
    }
    fillEl.style.transform = `translateY(${tPercent}%)`;
  }
}



function updateAllCustomers() {
  for (let i = 0; i < NUM_CUSTOMERS; i++) updateCustomer(i);
}


function clampTutoOffset(x) {
  const minX = -GAME_WIDTH + 140;
  const maxX = 0;
  return Math.max(minX, Math.min(maxX, x));
}

function showTutorialOverlay() {
  const old = document.getElementById("tutorial-overlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "tutorial-overlay";
  overlay.style.position = "absolute";
  overlay.style.left = "0px";
  overlay.style.top = "0px";
  overlay.style.width = GAME_WIDTH + "px";
  overlay.style.height = GAME_HEIGHT + "px";
  overlay.style.zIndex = "999";
  overlay.style.overflow = "hidden";
  overlay.style.pointerEvents = "auto";
  overlay.style.touchAction = "none";

    const scaleWrap = document.createElement("div");
    scaleWrap.id = "tutorial-scale-wrap";
    scaleWrap.style.position = "absolute";
    scaleWrap.style.left = TUTO_SCREEN_SHIFT + "px";
    scaleWrap.style.top = "19px";
    scaleWrap.style.width = (GAME_WIDTH * 2) + "px";
    scaleWrap.style.height = GAME_HEIGHT + "px";
    scaleWrap.style.transform = `scale(${TUTO_SCALE})`;
    scaleWrap.style.transformOrigin = "top left";
    
    const strip = document.createElement("div");
    strip.id = "tutorial-strip";
    strip.style.position = "absolute";
    strip.style.left = "0px";
    strip.style.top = "0px";
    strip.style.width = (GAME_WIDTH * 2) + "px";
    strip.style.height = GAME_HEIGHT + "px";
    const tutoFile = isShuTeam() ? "tuto_2.png" : "tuto.png";
    strip.style.backgroundImage = `url('assets/${tutoFile}')`;
    strip.style.backgroundRepeat = "no-repeat";
    strip.style.backgroundSize = "100% 100%";

    const btn = document.createElement("div");
    btn.id = "tutorial-start-btn";
    const btnW = 250 + 20;
    const btnH = 140 + 20;

    btn.style.position = "absolute";
    btn.style.width = btnW + "px";
    btn.style.height = btnH + "px";
    btn.style.backgroundImage = "url('assets/game_start.png')";
    btn.style.backgroundRepeat = "no-repeat";
    btn.style.backgroundSize = "100% 100%";
    btn.style.cursor = "pointer";
    
    btn.style.left = (GAME_WIDTH + (GAME_WIDTH - btnW) / 2 + 450) + "px";
    btn.style.top = (GAME_HEIGHT - btnH - 50) + "px";

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      startRealGameFromTutorial();
    });

    strip.appendChild(btn);
    scaleWrap.appendChild(strip);
    overlay.appendChild(scaleWrap);
    screenGame.appendChild(overlay);
    
    tutoOffsetX = 0
    strip.style.transform = `translateX(${tutoOffsetX}px)`;

  overlay.addEventListener("pointerdown", (e) => {
    if (e.target && e.target.id === "tutorial-start-btn") return;
    tutoDragging = true;
    tutoDragStartX = e.clientX;
    tutoDragStartOffset = tutoOffsetX;
    overlay.setPointerCapture(e.pointerId);
  });

  overlay.addEventListener("pointermove", (e) => {
    if (!tutoDragging) return;
    const dx = e.clientX - tutoDragStartX;
    tutoOffsetX = clampTutoOffset(tutoDragStartOffset + dx);
    strip.style.transform = `translateX(${tutoOffsetX}px)`;
  });

  const endDrag = (e) => {
    if (!tutoDragging) return;
    tutoDragging = false;
    try { overlay.releasePointerCapture(e.pointerId); } catch (_) {}
  };

  overlay.addEventListener("pointerup", endDrag);
  overlay.addEventListener("pointercancel", endDrag);
  overlay.addEventListener("lostpointercapture", endDrag);
}

function startRealGameFromTutorial() {
  const overlay = document.getElementById("tutorial-overlay");
  if (overlay) overlay.remove();

  
  isGamePlayStarted = true;
  hasSeenTutorial = true;
  localStorage.setItem("fishbun_tuto_done", "true");
  
  customerCooldowns = new Array(NUM_CUSTOMERS).fill(1200);
  startGameLoop();
}


function updateBag(isDragging = false) {
  let imgUrl = BagImageURL.empty;

  if (isDragging) {
    imgUrl = BagImageURL.empty;
  } else {
    if (bagCount === 1) {
      imgUrl = bagHasSpecial ? BagImageURL.special_1 : BagImageURL.normal_1;
    } else if (bagCount === 2) {
      imgUrl = bagHasSpecial ? BagImageURL.special_2 : BagImageURL.normal_2;
    } else if (bagCount >= 3) {
      imgUrl = bagHasSpecial ? BagImageURL.special_3 : BagImageURL.normal_3;
    }
  }
  bagImageElem.style.backgroundImage = imgUrl;

  bagCountElem.textContent = bagCount;
  bagCountElem.classList.toggle("active", bagCount > 0);
}

function spawnCustomer(idx) {
  const diff = getDifficultyFactor();

  let isWeird = false;
  if (
      typeof window.settingUseSpecial !== 'undefined' && window.settingUseSpecial &&
      elapsedMs > 60000 && 
      !customers.some(c => c && c.isWeirdOrder) &&
      Math.random() < 0.08
  ) {
      isWeird = true;
  }

  if (isWeird) {
      const typeId = randChoice(CUSTOMER_TYPES);
      const weirdWait = 20000 + Math.random() * 2000; 

      customers[idx] = {
        isWeirdOrder: true,    
        type: typeId,
        phase: "order",
      
        dialog: randChoice(WEIRD_ORDERS),
        
        waitMs: weirdWait,
        orderWaitMs: weirdWait,
        orderSize: 0,
        isLeaving: false
      };

    customerCooldowns[idx] = 0;

    const groupEl = customerGroupElems[idx];
      if (groupEl) {
        groupEl.style.transition = "none";
        groupEl.style.left = CUSTOMER_POS_OUT_LEFT + "px";
        void groupEl.offsetWidth; 
        groupEl.style.transition = "left 0.6s ease-in-out";
      }
      updateCustomer(idx);
      
      playSfx("assets/customer_in.mp3");
      return;
  }

  let w3 = 50 - (30 * diff); 
  let w6 = 40 + (10 * diff); 
  let w9 = 10 + (20 * diff); 

  const totalW = w3 + w6 + w9;
  let r = Math.random() * totalW;
  
  let size = 3;
  if (r < w3) size = 3;
  else if (r < w3 + w6) size = 6;
  else size = 9;
  playSfx("assets/customer_in.mp3");
  let specialData = null;

  if (
      typeof window.settingUseSpecial !== 'undefined' && window.settingUseSpecial &&
      typeof ENABLE_SPECIAL_CUSTOMERS !== 'undefined' && ENABLE_SPECIAL_CUSTOMERS && 
      idx === 1 && !activeSpecialType
  ) {
    if (typeof SPECIAL_CUSTOMER_DATA !== 'undefined') {
      let timeProbMult = 0;
      
      if (elapsedMs < 60 * 1000) {
        timeProbMult = 0;       
      } else if (elapsedMs < 180 * 1000) {
        timeProbMult = 0.4;     
      } else {
        timeProbMult = 0.9;     
                                
      }

      const roll = Math.random();
      let accumulatedProb = 0;

      for (const key in SPECIAL_CUSTOMER_DATA) {
        const data = SPECIAL_CUSTOMER_DATA[key];
        if (data.id === lastSpecialType) continue; 
        
        if (data.id === "fisher" && trayBreads.length === 0) continue;

        if (roll < accumulatedProb + (data.prob * timeProbMult)) {
          specialData = data;
          break;
        }
        accumulatedProb += (data.prob * timeProbMult);
      }
    }
  }

  
  if (specialData) {
    const groupEl = customerGroupElems[idx];

    activeSpecialType = specialData.id;
    lastSpecialType = specialData.id;

    let sequences = null;
    let initialDialog = "";
    let talkTimer = 0;

    if (specialData.logic.type === "sequential_talk") {
        sequences = specialData.logic.getSequences(size);
        initialDialog = sequences[0];
        talkTimer = 1500;
    } else {
        const rawDialog = randChoice(specialData.dialogOrder);
        initialDialog = (typeof rawDialog === "function") ? rawDialog(size) : rawDialog;
    }

    let calculatedWaitMs = (specialData.id === "fisher") ? 99999 : (size * 8000 + 8000);

    customers[idx] = {
      isSpecial: true,
      specialId: specialData.id,
      specialLogic: specialData.logic,
      orderSize: size,
      waitMs: calculatedWaitMs,          
      orderWaitMs: calculatedWaitMs,
      isLeaving: false,
      type: specialData.id, 
      phase: "order",       
      dialog: initialDialog,
      rantIndex: 0,
      rantTimer: 0,
      sequences: sequences,
      talkIndex: 0,
      talkTimer: talkTimer
    };

    customerCooldowns[idx] = 0;
    
    if (groupEl) {
      groupEl.style.transition = "none";
      groupEl.style.left = CUSTOMER_POS_OUT_LEFT + "px";
      void groupEl.offsetWidth; 
      groupEl.style.transition = "left 0.6s ease-in-out";
    }
    
    updateCustomer(idx);
    
    if (specialData.id === "fisher") {
        setTimeout(() => { runFisherSequence(idx); }, 800);
    }
    else if (specialData.id === "nero") {
        setTimeout(() => { runNeroSequence(idx); }, 100);
    }
    
    return; 
  }

  const activeTypeIds = customers
    .filter(c => c && !c.isSpecial && typeof c.type === 'number')
    .map(c => c.type);

  
  const availableTypes = CUSTOMER_TYPES.filter(id => !activeTypeIds.includes(id));

  let typeId;
  if (availableTypes.length > 0) {
    typeId = randChoice(availableTypes);
  } else {
    typeId = randChoice(CUSTOMER_TYPES);
  }

  const waitPerPiece = 8000;
  const baseWait = size * waitPerPiece + 5000;
  
  const patienceFactor = Math.max(0.3, 1.0 - (diff * 0.5)); 
  const waitMs = baseWait * patienceFactor;

  customers[idx] = {
    orderSize: size,
    waitMs: waitMs,          
    orderWaitMs: waitMs,     
    isLeaving: false,
    type: typeId,            
    phase: "order",          
    dialog: pickCustomerLine("order", size), 
  };

  if (
    window.settingUseSpecial && 
    elapsedMs > 350000 && 
    !customers[idx].isSpecial && 
    Math.random() < 0.10 
  ) {
    const leaveTime = waitMs * (0.3 + Math.random() * 0.4);
    customers[idx].earlyLeaveTrigger = leaveTime;
  }

  customerCooldowns[idx] = 0;

  const groupEl = customerGroupElems[idx];
  if (groupEl) {
    groupEl.style.transition = "none";
    groupEl.style.left = CUSTOMER_POS_OUT_LEFT + "px";
    void groupEl.offsetWidth; 
    groupEl.style.transition = "left 0.6s ease-in-out";
  }

  updateCustomer(idx);
}

function runFisherSequence(customerIndex) {
  const c = customers[customerIndex];
  if (!c) return;
  
  const gameScreen = document.getElementById("screen-game");
  if (!gameScreen) return;
  
  const currentScale = (typeof GAME_SCALE !== 'undefined' && GAME_SCALE > 0) ? GAME_SCALE : 1;
  const gameRect = gameScreen.getBoundingClientRect();

  const HOOK_W = 160;    
  const HOOK_H = 1600;   
  const FISH_W = 240;    
  const FISH_H = 120;    
  const FISH_OFFSET_Y = 50; 

  const THRESHOLD_MS = 7 * 60 * 1000;
  let maxFishCount = (typeof elapsedMs !== 'undefined' && elapsedMs >= THRESHOLD_MS) ? 2 : 1;
  
  let currentFishCount = 0;

  if (trayBreads.length === 0) {
      failSequence();
      return;
  }

  function doFishingCycle() {
      if (currentFishCount >= maxFishCount || trayBreads.length === 0) {
          successSequence();
          return;
      }

      let targetIndex = -1;
      const goldenIndices = [];
      trayBreads.forEach((bread, idx) => {
          if (bread.hasSpecial) goldenIndices.push(idx);
      });

      if (goldenIndices.length > 0) {
          targetIndex = goldenIndices[0];
      } else {
          targetIndex = Math.floor(Math.random() * trayBreads.length);
      }
      
      const targetBreadEl = document.getElementById(`tray-bread-${targetIndex}`);
      let targetRect = null;
      let breadImgUrl = "";

      if (targetBreadEl) {
          targetRect = targetBreadEl.getBoundingClientRect();
          const targetBreadData = trayBreads[targetIndex];
          if (targetBreadData.quality === "burnt") breadImgUrl = DragGhostURL.bread_burnt;
          else if (targetBreadData.quality === "undercooked") breadImgUrl = DragGhostURL.bread_undercooked;
          else breadImgUrl = targetBreadData.hasSpecial ? DragGhostURL.bread_special : DragGhostURL.bread;
      } else {
          successSequence();
          return;
      }

      const deltaX = targetRect.left - gameRect.left;
      const deltaY = targetRect.top - gameRect.top;
      const localCenterX = (deltaX / currentScale) + (targetRect.width / currentScale / 2);
      const localCenterY = (deltaY / currentScale) + (targetRect.height / currentScale / 2);

      const hook = document.createElement("div");
      hook.style.position = "absolute"; 
      hook.style.width = HOOK_W + "px";
      hook.style.height = HOOK_H + "px"; 
      hook.style.backgroundImage = "url('assets/fishing.png')";
      hook.style.backgroundRepeat = "no-repeat";
      hook.style.backgroundPosition = "bottom center";
      hook.style.backgroundSize = "contain"; 
      hook.style.zIndex = "999"; 
      hook.style.pointerEvents = "none";
      
      hook.style.left = (localCenterX - (HOOK_W / 2)) + "px";
      
      const startTop = -(HOOK_H + 100); 
      hook.style.top = startTop + "px";
      const targetTop = (localCenterY - HOOK_H) + 10; 
      const moveDistance = targetTop - startTop;

      hook.style.transition = "transform 1.5s cubic-bezier(0.5, 0, 0.5, 1)";
      gameScreen.appendChild(hook);
      void hook.offsetWidth; 
      hook.style.transform = `translateY(${moveDistance}px)`;

      setTimeout(() => {
          if (trayBreads[targetIndex]) {
              trayBreads.splice(targetIndex, 1);
              updateTray(); 

              const stolenBread = document.createElement("div");
              stolenBread.style.position = "absolute";
              stolenBread.style.width = FISH_W + "px"; 
              stolenBread.style.height = FISH_H + "px";
              stolenBread.style.bottom = "0px"; 
              stolenBread.style.left = "50%";
              stolenBread.style.transform = `translate(-50%, ${FISH_OFFSET_Y}px) rotate(90deg)`; 
              stolenBread.style.backgroundImage = breadImgUrl;
              stolenBread.style.backgroundSize = "contain";
              stolenBread.style.backgroundRepeat = "no-repeat";
              stolenBread.style.backgroundPosition = "center";
              hook.appendChild(stolenBread);
              
              currentFishCount++;
          }

          setTimeout(() => {
              hook.style.transition = "transform 0.8s cubic-bezier(0.5, 0, 0.5, 1)";
              hook.style.transform = `translateY(-${HOOK_H / 2}px)`; 

              setTimeout(() => {
                  hook.remove(); 
                  setTimeout(doFishingCycle, 200);

              }, 800);

          }, 500);

      }, 1500);
  }

  function failSequence() {
      const trayEl = document.getElementById("display-tray-ui");
      if (!trayEl) return;
      
      const tRect = trayEl.getBoundingClientRect();
      const deltaX = tRect.left - gameRect.left;
      const deltaY = tRect.top - gameRect.top;
      const lx = (deltaX / currentScale) + (tRect.width / currentScale / 2);
      const ly = (deltaY / currentScale) + (tRect.height / currentScale / 2);

      const hook = document.createElement("div");
      hook.style.position = "absolute"; hook.style.width = HOOK_W + "px"; hook.style.height = HOOK_H + "px";
      hook.style.backgroundImage = "url('assets/fishing.png')"; hook.style.backgroundRepeat = "no-repeat";
      hook.style.backgroundPosition = "bottom center"; hook.style.backgroundSize = "contain"; 
      hook.style.zIndex = "999"; hook.style.pointerEvents = "none";
      hook.style.left = (lx - (HOOK_W/2)) + "px";
      const startTop = -(HOOK_H + 100);
      hook.style.top = startTop + "px";
      const targetTop = (ly - HOOK_H) + 10;

      hook.style.transition = "transform 1.5s cubic-bezier(0.5, 0, 0.5, 1)";
      gameScreen.appendChild(hook);
      void hook.offsetWidth;
      hook.style.transform = `translateY(${targetTop - startTop}px)`;

      setTimeout(() => {
          setTimeout(() => {
              hook.style.transition = "transform 0.8s cubic-bezier(0.5, 0, 0.5, 1)";
              hook.style.transform = `translateY(-${HOOK_H/2}px)`;
              setTimeout(() => {
                  hook.remove();
                  if (customers[customerIndex]) {
                      customers[customerIndex].dialog = "허탕이군...";
                      customers[customerIndex].phase = "fail"; 
                      customers[customerIndex].waitMs = 1500;
                      updateCustomer(customerIndex);
                  }
              }, 800);
          }, 500);
      }, 1500);
  }

  function successSequence() {
      if (customers[customerIndex]) {
          customers[customerIndex].dialog = "월척이요!";
          customers[customerIndex].phase = "success";
          customers[customerIndex].waitMs = 1500;
          updateCustomer(customerIndex);
      }
  }

  doFishingCycle();
}

function gameTick() {

  const pauseScreen = document.getElementById("screen-pause");
    if (pauseScreen && pauseScreen.classList.contains("active")) {
        return;
    }

  if (gameState !== STATE_GAME) return;

  elapsedMs += TICK_MS;

  const diff = getDifficultyFactor();
  const cookMult = Math.max(0.2, 1.0 - (diff * 0.5)); 
  const smokeMult = Math.max(0.15, 1.0 - (diff * 0.7)); 

  const currentPhaseTime = PHASE1_TIME * cookMult;
  const currentSmokeTime = SMOKE_TIME * smokeMult;
  for (let i = 0; i < NUM_PANS; i++) {
    if (dragData && dragData.type === "pan" && dragData.index === i) continue;
    const pan = pans[i];
    let needsUpdate = false;

    if (
      pan.state === PanState.PHASE1 ||
      pan.state === PanState.SMOKE1 ||
      pan.state === PanState.PHASE2 ||
      pan.state === PanState.SMOKE2
    ) {
      pan.stateMs += TICK_MS;

      if (pan.state === PanState.PHASE1 && pan.stateMs >= currentPhaseTime) {
        pan.state = PanState.SMOKE1; pan.stateMs = 0; needsUpdate = true;playSfx("assets/smoke.mp3");
      } else if (pan.state === PanState.SMOKE1 && pan.stateMs >= currentSmokeTime) {
        pan.state = PanState.BURNT; pan.stateMs = 0; needsUpdate = true;
      } else if (pan.state === PanState.PHASE2 && pan.stateMs >= currentPhaseTime) {
        pan.state = PanState.SMOKE2; pan.stateMs = 0; needsUpdate = true;playSfx("assets/smoke.mp3");
      } else if (pan.state === PanState.SMOKE2 && pan.stateMs >= currentSmokeTime) {
        pan.state = PanState.BURNT; pan.stateMs = 0; needsUpdate = true;
      }
    } else if (pan.state === PanState.DONE) {
      pan.stateMs += TICK_MS;
      if (pan.stateMs >= 6000) {
        pan.state = PanState.BURNT; pan.stateMs = 0; needsUpdate = true;
      }
    } else if (pan.state === PanState.BURNT) {
      pan.stateMs += TICK_MS;
      if (pan.stateMs >= 4000) { 
        pan.state = PanState.EMPTY; pan.stateMs = 0; pan.hasSpecial = false; needsUpdate = true;
      }
    }
    if (needsUpdate) updatePan(i);
  }

  if (gameState === STATE_GAME && window.isSfxOn === true) {
      let anyNonEmpty = false;
      let anyBurnt = false;

      for (let p of pans) {
          if (p.state !== PanState.EMPTY) anyNonEmpty = true;
          if (p.state === PanState.BURNT) anyBurnt = true;
      }

      if (anyNonEmpty) {
          if (grillingAudio && grillingAudio.paused) {
              grillingAudio.play().catch(()=>{});
          }
      } else {
          if (grillingAudio && !grillingAudio.paused) {
              grillingAudio.pause();
              grillingAudio.currentTime = 0;
          }
      }

      if (anyBurnt) {
          if (burntAudio && burntAudio.paused) {
              burntAudio.play().catch(()=>{});
          }
      } else {
          if (burntAudio && !burntAudio.paused) {
              burntAudio.pause();
              burntAudio.currentTime = 0;
          }
      }
  } else {
      if (grillingAudio && !grillingAudio.paused) {
          grillingAudio.pause();
          grillingAudio.currentTime = 0;
      }
      if (burntAudio && !burntAudio.paused) {
          burntAudio.pause();
          burntAudio.currentTime = 0;
      }
  }
  
  let trayNeedsUpdate = false;
  const now = elapsedMs;
  for (let i = trayBreads.length - 1; i >= 0; i--) {
    const bread = trayBreads[i];
    if (now - bread.bakedAtMs >= TRAY_LIFETIME) {
      trayBreads.splice(i, 1);
      trayNeedsUpdate = true;
    }
  }
  if (trayNeedsUpdate) updateTray();

  
  if (!isGamePlayStarted) {
    updateHud();
    return;
  }
  
  
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    let c = customers[i];
    if (!c) {
      customerCooldowns[i] -= TICK_MS;
      if (customerCooldowns[i] <= 0) {
        const diff = getDifficultyFactor();
        let maxActive = 1;
        if (diff > 0.2) maxActive = 2; 
        if (diff > 0.4) maxActive = 3; 

        const activeCount = customers.filter((x) => x != null).length;
        
        if (activeCount < maxActive) {
          spawnCustomer(i);
        } else {
          const baseMin = 5000;
          const baseVar = 3000;
          const speedMultiplier = 1.0 - (diff * 0.8);
          const specialPenalty = activeSpecialType ? 1.5 : 1.0; 
          const nextCooldown = (baseMin + Math.random() * baseVar) * speedMultiplier * specialPenalty;
          customerCooldowns[i] = nextCooldown;
        }
      }
      continue;
    }
    
    if (c.isLeaving) {
      c.waitMs -= TICK_MS;
      if (c.waitMs <= 0) {
        if (c.isSpecial) activeSpecialType = null;
        customers[i] = null;
        customerCooldowns[i] = 8000 + Math.random() * 4000;
        updateCustomer(i);
      } else {
        updateCustomer(i);
      }
      continue;
    }

    if (c.isSpecial && c.specialLogic && c.specialLogic.type === "sequential_talk") {
        c.talkTimer -= TICK_MS;
        if (c.talkTimer <= 0 && c.sequences && c.talkIndex < c.sequences.length - 1) {
            c.talkIndex++;
            c.dialog = c.sequences[c.talkIndex];
            c.talkTimer = 1500;
            updateCustomer(i);
        }
    }
    if (c.phase === "rant") {
      c.rantTimer -= TICK_MS;
      
      if (c.isSpecial && c.specialLogic && c.specialLogic.type === "sequential_talk") {
        c.talkTimer -= TICK_MS;
        if (c.talkTimer <= 0 && c.talkIndex < c.sequences.length - 1) {
            c.talkIndex++;
            c.dialog = c.sequences[c.talkIndex];
            c.talkTimer = 1500;
            updateCustomer(i);
        }
    }

    if (c.rantTimer <= 0) {

        const rantList = SPECIAL_CUSTOMER_DATA["beggar"].rantLines;
        if (c.rantIndex < rantList.length) {
          c.dialog = rantList[c.rantIndex];
          c.rantIndex++;
          c.rantTimer = 1500; 
          updateCustomer(i);
        } else {
          c.phase = "fail";
          c.dialog = "에잇!";
          c.waitMs = 1000;
          updateCustomer(i);
        }
      }
      continue;
    }    
    
    if (!c.phase || c.phase === "order") {
      if (c.earlyLeaveTrigger && c.waitMs <= c.earlyLeaveTrigger) {

          c.earlyLeaveTrigger = null; 
          c.phase = "fail";
          c.facePhase = "order";
          c.dialog = randChoice(BUSY_LEAVE_DIALOGS);
          c.waitMs = 1500; 
          updateCustomer(i);
          continue;
      }
      c.waitMs -= TICK_MS;
      if (c.waitMs <= 0) {
        if (c.isWeirdOrder) {
            c.phase = "fail";
            c.facePhase = "order";
            c.dialog = randChoice(WEIRD_EXIT_DIALOGS);
            c.waitMs = 1500;
            updateCustomer(i);
            continue;
        }

        if (c.isSpecial && c.specialLogic && c.specialLogic.type === "thief") {
             customers[customerIndex] = null;
             customerCooldowns[customerIndex] = 5000;
             updateCustomer(customerIndex);
             if (c.isSpecial) activeSpecialType = null;
             continue;
        }

        if (c.isSpecial) {
           const logicType = c.specialLogic.type;
           if (logicType === "freebie_rant") {
              c.phase = "rant";
              c.dialog = "에잉 쯧쯧... 안 주나보네.";
              c.rantIndex = 0;
              c.rantTimer = 1000;
              updateCustomer(i);
              continue; 
           }
           else if (logicType === "priority_death") {
              triggerYumeGameOver(i, "하?!");
              return;
           }
        }

        c.phase = "fail";
        c.dialog = pickCustomerLine("fail", c.orderSize);

        if (c.isSpecial) c.dialog = randChoice(SPECIAL_CUSTOMER_DATA[c.specialId].dialogFail);
        c.waitMs = CUSTOMER_RESULT_STAY_MS; 
        if (c.isSpecial && c.specialId === "snowman" && c.orderSize >= 3) {
        } else {
             mistakes += 1;
             combo = 0;
             triggerHpShake();
             playSfx("assets/fail.mp3", 1.0);playSfx("assets/fail.mp3", 1.0);playSfx("assets/fail.mp3", 1.0);
        }
        updateHud();
        if (mistakes >= MISTAKE_LIMIT) {
          endGame();
        }
      }
    } else {
      
      c.waitMs -= TICK_MS;
      if (c.waitMs <= 0) {
        c.isLeaving = true;
        c.waitMs = CUSTOMER_LEAVE_MOVE_MS;
      }
    }

    updateCustomer(i);
  }
  if (gameState === STATE_GAME && isSfxOn) {
      let anyNonEmpty = false;
      let anyBurnt = false;

      for (let p of pans) {
          if (p.state !== PanState.EMPTY) anyNonEmpty = true;
          if (p.state === PanState.BURNT) anyBurnt = true;
      }

      if (anyNonEmpty) {
          if (grillingAudio.paused) grillingAudio.play().catch(()=>{});
      } else {
          if (!grillingAudio.paused) {
              grillingAudio.pause();
              grillingAudio.currentTime = 0;
          }
      }

      if (anyBurnt) {
          if (burntAudio.paused) burntAudio.play().catch(()=>{});
      } else {
          if (!burntAudio.paused) {
              burntAudio.pause();
              burntAudio.currentTime = 0;
          }
      }
  } else {
      if (grillingAudio && !grillingAudio.paused) grillingAudio.pause();
      if (burntAudio && !burntAudio.paused) burntAudio.pause();
  }

  updateHud();

  if (mistakes >= MISTAKE_LIMIT) endGame();
}


function setToolCursor(toolName, isTilting = false) {
  if (!toolName) {
    toolCursor.style.backgroundImage = "none";
    toolCursor.classList.remove("tilting");
    toolCursor.classList.remove("batter");
    return;
  }
  toolCursor.style.backgroundImage = getToolCursorImage(toolName); 
  if (toolName === "batter") {
    toolCursor.classList.add("batter");
  } else {
    toolCursor.classList.remove("batter");
  }

  if (isTilting) {
    toolCursor.classList.add("tilting");
  } else {
    toolCursor.classList.remove("tilting");
  }
}

function setTool(toolName) {
  if (currentTool === toolName) {
    currentTool = null;
  } else {
    currentTool = toolName;
  }

  toolButtonUIElems.forEach((btn) => {
    const t = btn.dataset.tool;
    btn.classList.toggle("active", t === currentTool);
  });

  setToolCursor(currentTool, false);

  const shouldShowCursor = (lastPointerType === "mouse") && currentTool !== null;
  toolCursor.classList.toggle("active", shouldShowCursor);
  screenGame.style.cursor = shouldShowCursor ? "none" : "auto";

  Object.entries(toolImageElems).forEach(([name, el]) => {
    if (!el) return;

    if (currentTool === "filling" && name === "filling") {
      el.style.visibility = "visible";
      el.style.backgroundImage = isShuTeam()
        ? "url('assets/tool_filling1_shu.png')" 
        : "url('assets/tool_filling1.png')";  
    } else {
      if (name === "filling") {
        el.style.backgroundImage = isShuTeam()
          ? "url('assets/tool_filling_shu.png')" 
          : "url('assets/tool_filling.png')";    
      }

      if (currentTool === name) {
        el.style.visibility = "hidden";
      } else {
        el.style.visibility = "visible";
      }
    }
  });
}


function onPointerMove(e) {
  if (gameState !== STATE_GAME) return;
  if (e.pointerType && e.pointerType !== "mouse") return;

  toolCursor.style.left = e.clientX + "px";
  toolCursor.style.top = e.clientY + "px";
}


function showToolTapEffect(e) {
  
  if (gameState !== STATE_GAME) return;
  
  if (!currentTool) return;
  
  if (!toolCursor) return;

  
  if (e.pointerType && e.pointerType === "mouse") return;

  
  const x = e.clientX;
  const y = e.clientY;

  toolCursor.style.left = x + "px";
  toolCursor.style.top  = y + "px";

  
  setToolCursor(currentTool, true);
  toolCursor.classList.add("active");

  
  if (tapEffectTimer) {
    clearTimeout(tapEffectTimer);
    tapEffectTimer = null;
  }

  tapEffectTimer = setTimeout(() => {
    toolCursor.classList.remove("active");
    setToolCursor(currentTool, false);
  }, 1000);
}




function collectPanToBag(panIndex) {
  const pan = pans[panIndex];

  
  if (
    pan.state !== PanState.DONE &&
    pan.state !== PanState.BURNT &&
    pan.state !== PanState.PHASE2
  ) {
    return;
  }

  const quality = getBreadQualityFromPan(pan);
  addBreadToBag(pan.hasSpecial, quality);

  pan.state = PanState.EMPTY;
  pan.stateMs = 0;
  pan.hasSpecial = false;
  updatePan(panIndex);
}
function collectPanToTray(panIndex) {
  const pan = pans[panIndex];

  
  if (
    pan.state !== PanState.DONE &&
    pan.state !== PanState.BURNT &&
    pan.state !== PanState.PHASE2
  ) {
    return;
  }
  if (trayBreads.length >= NUM_TRAY_SLOTS) return;
  playSfx("assets/pop.mp3");
  const quality = getBreadQualityFromPan(pan);

  trayBreads.push({
    hasSpecial: pan.hasSpecial,
    bakedAtMs: elapsedMs,
    quality: quality,        
  });

  pan.state = PanState.EMPTY;
  pan.stateMs = 0;
  pan.hasSpecial = false;
  updatePan(panIndex);
  updateTray();
}

function collectTrayToBag() {
  if (trayBreads.length <= 0) return;
  const bread = trayBreads.shift();

  const quality = bread.quality || "normal";
  addBreadToBag(bread.hasSpecial, quality);

  updateTray();
}


function triggerYumeGameOver(idx, msg) {
  const c = customers[idx];
  if(c) {
    c.phase = "fail"; 
    c.facePhase = "fail"; 
    c.dialog = msg; 
    
    
    c.waitMs = 99999;     
    
    updateCustomer(idx);
  }
  
  isYumeGameOver = true; 
  
  
  setTimeout(() => {
     
     playChromaVideo("assets/yume_jumpscare.mp4", 1300, () => {
        endGame();
     });
  }, 1000); 
}


function deliverBagToCustomer(customerIndex) {
  if (isAbnormalClickSpeed()) return;
  const c = customers[customerIndex];
  
  if (!c) return; 

  if (bagCount <= 0) return;

  if (c.isSpecial && (c.specialId === "nero" || (c.specialLogic && c.specialLogic.type === "thief"))) {
      return;
    }
  if (c.isWeirdOrder) {
      return;
  }

  if (c.phase !== "order") {
    return;
  }

  if (!c.isSpecial || c.specialId !== "yume") {
    const yumeIdx = customers.findIndex((x, idx) => 
      idx !== customerIndex && x && x.isSpecial && x.specialId === "yume" && x.phase === "order"
    );
    
    if (yumeIdx !== -1) {
       mistakes += 1;
       triggerHpShake();
       updateHud();

       const yume = customers[yumeIdx];
       yume.phase = "fail";
       yume.facePhase = "fail";
       yume.dialog = "사장삐가 날 무시했어!";
       yume.waitMs = 1000;
       updateCustomer(yumeIdx);

       if (mistakes >= MISTAKE_LIMIT) {
         endGame();
       }
       return; 
    }
  }

  const isSnowmanPass = (c.isSpecial && c.specialId === "snowman" && c.orderSize >= 3);
  if (!isSnowmanPass && bagCount < c.orderSize) {
    combo = 0;
    mistakes += 1;
    triggerHpShake();
    playSfx("assets/fail.mp3");playSfx("assets/fail.mp3");playSfx("assets/fail.mp3");
    if (c.isSpecial && c.specialLogic && c.specialLogic.type === "priority_death") {
       triggerYumeGameOver(customerIndex, "하?!");
       return;
    }

    bagCount = 0; 
    bagHasSpecial = false; 
    bagBadCount = 0;
    updateBag();
    updateHud();
    
    if (mistakes >= MISTAKE_LIMIT) {
      endGame();
      return;
    }

    c.phase = "fail";
    c.facePhase = "fail";
    
    if (c.isSpecial && SPECIAL_CUSTOMER_DATA[c.specialId]) {
      c.dialog = randChoice(SPECIAL_CUSTOMER_DATA[c.specialId].dialogFail);
    } else {
      c.dialog = pickCustomerLine("fail", c.orderSize);
    }

    c.waitMs = CUSTOMER_RESULT_STAY_MS;
    updateCustomer(customerIndex);
    return;
  }

  const chargedCount = Math.min(bagCount, c.orderSize);
  const badCount = Math.min(bagBadCount, chargedCount); 
  
  let gain = (chargedCount / 3) * BASE_UNIT_PRICE;

  if (c.isSpecial && c.specialLogic && c.specialLogic.type === "freebie_rant") {
     gain = 0;
  } else {
     if (badCount > 0) gain *= 0.5;
     if (bagHasSpecial) gain *= 2;
     gain = Math.round(gain);
  }
  
  money += gain;

  bagCount = 0;
  bagHasSpecial = false;
  bagBadCount = 0;

  c.phase = "success";
  c.facePhase = (badCount > 0) ? "fail" : "success";
  
  if (c.isSpecial && SPECIAL_CUSTOMER_DATA[c.specialId]) {
     c.dialog = randChoice(SPECIAL_CUSTOMER_DATA[c.specialId].dialogSuccess);
  } else {
     c.dialog = pickCustomerLine("success", c.orderSize);
  }
  if (c.phase === "rant") {

  } else {

      if (badCount > 0) {
          combo = 0;
          playSfx("assets/sucess.mp3", 1.0); playSfx("assets/sucess.mp3", 1.0);
      } else {
          combo++;
          playSfx("assets/sucess.mp3", 1.0);playSfx("assets/sucess.mp3", 1.0);playSfx("assets/sucess.mp3", 1.0);playSfx("sucess.mp3", 1.0);
      }
  }
  c.waitMs = CUSTOMER_RESULT_STAY_MS;

  updateBag();
  updateHud();
  updateCustomer(customerIndex);
}

function onPanClick(index, e) {
  if (isAbnormalClickSpeed()) return;
  if (gameState !== STATE_GAME) return;
  if (dragActive) return;
  
  if (Date.now() - lastDragEndTime < 200) return;

  const pan = pans[index];
  const startState = pan.state;
  const now = elapsedMs;

  if (pan.lastActionTime && (now - pan.lastActionTime < 500)) {
    return;
  }

  if (currentTool) {
    let actionDone = false;

    if (currentTool === "batter") {
      if (startState === PanState.EMPTY) {
        pan.state = PanState.BATTER1;
        pan.stateMs = 0;
        playSfx("assets/pop.mp3");
        if (window.isSfxOn && grillingAudio) {
            grillingAudio.currentTime = 0;
            if (grillingAudio.paused) grillingAudio.play().catch(()=>{});
        }
        actionDone = true;
      } else if (startState === PanState.FILL) {
        pan.state = PanState.PHASE1;
        pan.stateMs = 0;
        playSfx("assets/pop.mp3");
        actionDone = true;
      }
    } else if (currentTool === "filling") {
      if (startState === PanState.BATTER1) {
        pan.state = PanState.FILL;
        pan.stateMs = 0;
        playSfx("assets/pop.mp3");
        actionDone = true;
      }
    } else if (currentTool === "flip") {
      if (startState === PanState.SMOKE1) {
        pan.state = PanState.PHASE2;
        pan.stateMs = 0;
        playSfx("assets/pop.mp3");
        actionDone = true;
      } else if (startState === PanState.SMOKE2) {
        pan.state = PanState.DONE;
        const goldChance = Math.min(0.15, 0.01 + (combo * 0.003));
        if (Math.random() < goldChance) {
            pan.hasSpecial = true;
            playSfx("assets/gold.mp3");
        } else {
            pan.hasSpecial = false;
            playSfx("assets/popp.mp3");
        }
        
        pan.stateMs = 0;
        breadsBaked += 1;
        mySessionBreads += 1;
        actionDone = true;
      }
    }

    if (actionDone) {
      pan.lastActionTime = now;
      setToolCursor(currentTool, true);
      setTimeout(() => {
        if (toolCursor && toolCursor.classList.contains("tilting")) {
          setToolCursor(currentTool, false);
        }
      }, 200);
      updatePan(index);
      return; 
    }
  }

  if (isMouseDown) return;

  if (startState === PanState.DONE || startState === PanState.BURNT) {
    collectPanToBag(index);
    return;
  }

  if (!currentTool && startState === PanState.PHASE2) {
      collectPanToBag(index);
  }
}

function onTrayClick() {
  if (isAbnormalClickSpeed()) return;
  if (dragActive) return;
  if (Date.now() - lastDragEndTime < 200) return;
  collectTrayToBag();
}

function startDrag(type, index, pointerEvent) {
  if (gameState !== STATE_GAME) return;

  if (type === "pan") {
    const pan = pans[index];
    if (
      pan.state !== PanState.DONE &&
      pan.state !== PanState.BURNT &&
      pan.state !== PanState.PHASE2
    ) {
      return;
    }
  } else if (type === "tray") {
    if (trayBreads.length <= 0) return;
  } else if (type === "bag") {
    if (bagCount < 3) return;
  }

  dragActive = false;
  if (toolCursor) toolCursor.classList.remove("active");

  if (pointerEvent.cancelable) pointerEvent.preventDefault();

  if (pointerEvent.target && pointerEvent.target.setPointerCapture) {
     try {
       pointerEvent.target.setPointerCapture(pointerEvent.pointerId);
     } catch (e) { console.warn(e); }
  }

  dragData = { 
      type, 
      index, 
      ghost: null, 
      startX: pointerEvent.clientX, 
      startY: pointerEvent.clientY 
  };

  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragEnd);
  window.addEventListener("pointercancel", onDragEnd);
}

function onDragMove(e) {
  if (!dragData) return;

  if (!dragActive) {
      const moveDist = Math.hypot(e.clientX - dragData.startX, e.clientY - dragData.startY);
      
      if (moveDist > 20) {
          dragActive = true;
          activateDragVisuals(e);
      }
  }

  if (dragActive && dragData.ghost) {
      dragData.ghost.style.left = (e.clientX + dragData.offsetX) + "px";
      dragData.ghost.style.top = (e.clientY + dragData.offsetY) + "px";
  }
}

let lastDragEndTime = 0;

function onDragEnd(e) {
  if (!dragData) return;

  if (dragActive) {
    lastDragEndTime = Date.now();
  }

  
  if (dragActive) {
      if (e.target && e.target.releasePointerCapture) {
          try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      
      const dropElement = document.elementFromPoint(e.clientX, e.clientY);
      if (dropElement) {
          const target = findDropTarget(dropElement);
          handleDrop(target);
      }
  }

  if (dragData.ghost && dragData.ghost.parentNode) {
      dragData.ghost.remove();
  }
  if (dragData.type === "bag") updateBag(false);

  dragData = null;
  dragActive = false; 

  if (currentTool && lastPointerType === "mouse") {
    toolCursor.classList.add("active");
  }

  window.removeEventListener("pointermove", onDragMove);
  window.removeEventListener("pointerup", onDragEnd);
  window.removeEventListener("pointercancel", onDragEnd);
}

function findDropTarget(el) {
  let node = el;
  while (node) {
    if (node.id === "display-tray-ui") {
      return { type: "tray", index: 0 };
    }
    if (node.classList && node.classList.contains("customer-ui")) {
      return { type: "customer", index: parseInt(node.dataset.index, 10) };
    }
    if (node.id === "bag-ui") {
      return { type: "bag", index: null };
    }
    if (node.id === "game-root") break;
    node = node.parentElement;
  }
  return null;
}

function handleDrop(target) {
  if (!dragData || !target) return;
  const from = dragData;

  if (from.type === "pan") {
    if (target.type === "tray") {
      collectPanToTray(from.index);
    } else if (target.type === "bag") {
      collectPanToBag(from.index);
    }
  } else if (from.type === "tray") {
    if (target.type === "bag" || target.type === "tray") {
      collectTrayToBag();
    }
  } else if (from.type === "bag") {
    if (target.type === "customer") {
      deliverBagToCustomer(target.index);
    }
  }
}

window.go = () => endGame();

document.addEventListener("keydown", (e) => {
  if (e.key === "F9") {
    endGame();
  }
});

let gameOverSmokeTimer = null;

function buildResultScreen() {
  if (!screenResult) return;
  try {
    const snowLayer = document.getElementById("snow-layer");
    const gameScreen = document.getElementById("screen-game");
    if (snowLayer && gameScreen && snowLayer.parentNode !== gameScreen) {
    }
    screenResult.innerHTML = "";
    if (!isYumeGameOver && snowLayer) screenResult.appendChild(snowLayer);
  } catch(e) { console.error(e); }

  try {
    const makeLayer = (id, img, z) => {
      const el = document.createElement("div");
      el.id = id;
      el.style.position = "absolute";
      el.style.inset = "0";
      const path = img.startsWith("assets/") ? img : `assets/${img}`;
      el.style.backgroundImage = `url('${path}')`;
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundSize = "100% 100%";
      el.style.backgroundPosition = "center";
      el.style.zIndex = z;
      return el;
    };

    const bg = makeLayer("game-over-bg", "game_over_bg.png", 1);
    const smoke = makeLayer("game-over-smoke", "game_over_smoke.png", 2);
    const cTeam = (typeof currentTeam !== "undefined") ? currentTeam : "redbean";
    const overImg = (cTeam === "shu") ? "game_over_shu.png" : "game_over.png";
    const over = makeLayer("game-over-main", overImg, 3);

    let yumeLayer = null;
    if (isYumeGameOver) {
      yumeLayer = makeLayer("yume-bg", "yume_chan.png", 4);
      yumeLayer.style.zIndex = "3";
      over.style.zIndex = "2";
    }

    const paperWrap = document.createElement("div");
    paperWrap.id = "game-over-paper-wrap";
    paperWrap.style.position = "absolute";
    paperWrap.style.inset = "0";
    paperWrap.style.zIndex = 5;
    paperWrap.style.backgroundImage = "url('assets/game_over_paper.png')";
    paperWrap.style.backgroundRepeat = "no-repeat";
    paperWrap.style.backgroundSize = "100% 100%";
    paperWrap.style.backgroundPosition = "center";
    paperWrap.style.transform = "translateY(-100%)";
    paperWrap.style.transition = "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)";

    const textBox = document.createElement("div");
    textBox.id = "game-over-textbox";
    textBox.style.position = "absolute";
    textBox.style.left = "100%";
    textBox.style.top = "20%";
    textBox.style.transform = "translateX(-50%)";
    textBox.style.width = "75%";
    textBox.style.textAlign = "left";
    textBox.style.whiteSpace = "pre-line";
    textBox.style.fontFamily = "JoseonPalace, sans-serif";
    textBox.style.color = "#111";
    textBox.style.fontSize = "28px";
    textBox.style.lineHeight = "1.35";
    textBox.style.pointerEvents = "none";

    const m = (typeof money !== "undefined") ? money : 0;
    const b = (typeof breadsBaked !== "undefined") ? breadsBaked : 0;

    let bestM = 0;
    if (window.currentUser && window.currentUser.bestMoney) {
      bestM = Math.max(window.currentUser.bestMoney, m);
    } else {
      bestM = Math.max((typeof bestMoney !== "undefined") ? bestMoney : 0, m);
    }

    const myTotal = (window.currentUser && window.currentUser.totalBreads)
      ? window.currentUser.totalBreads
      : ((typeof bestBreads !== "undefined" ? bestBreads : 0) + b);

    let myRank = "-";
    try {
      if (window.getMyCurrentRank && typeof window.getMyCurrentRank === "function") {
        myRank = window.getMyCurrentRank(m);
      }
    } catch(e) { console.warn(e); }

    const statsDiv = document.createElement("div");
    statsDiv.innerHTML =
      `1. 이번 수익 : ${m.toLocaleString()}원, ${b}개<br>` +
      `2. 내 최고수익 : ${bestM.toLocaleString()}원<br>` +
      `3. 현재 순위 : ${myRank}위<br>` +
      `4. 누적 붕어빵 : ${myTotal.toLocaleString()}개`;

    const verdictDiv = document.createElement("div");
    verdictDiv.style.marginTop = "18px";
    verdictDiv.style.fontSize = "36px";
    verdictDiv.style.fontWeight = "normal";

    let msg = "";
    if (isYumeGameOver) msg = "해당 업소는 폭발과 함께\n날아가버렸으므로 슬프지만\n영업정지 처분을 내림";
    else if (m < 0) msg = "뭐 어떻게 한거냐...";
    else if (m < 20000) msg = "해당 업소는 장사를\n절망적으로 못해서\n영업정지 처분을 내림.";
    else if (m < 40000) msg = "해당 업소는 장사를 제법\n잘했으나 아무튼\n영업정지 처분을 내림.";
    else if (m < 60000) msg = "해당 업소는 장사를 아주\n잘했지만 결론적으론\n영업정지 처분을 내림.";
    else msg = "해당 업소는 장사를 너무\n잘했으므로 상으로\n영업정지 처분을 내림.";

    verdictDiv.innerText = msg;

    textBox.appendChild(statsDiv);
    textBox.appendChild(verdictDiv);

    const retryBtn = document.createElement("div");
    retryBtn.id = "btn-result-retry-img";
    retryBtn.style.position = "absolute";
    retryBtn.style.right = "4.5%";
    retryBtn.style.bottom = "0%";
    retryBtn.style.width = "440px";
    retryBtn.style.height = "260px";
    retryBtn.style.backgroundImage = "url('assets/button_retry.png')";
    retryBtn.style.backgroundRepeat = "no-repeat";
    retryBtn.style.backgroundSize = "contain";
    retryBtn.style.backgroundPosition = "center";
    retryBtn.style.cursor = "pointer";
    retryBtn.style.pointerEvents = "auto";
    retryBtn.style.zIndex = "10";

    retryBtn.onclick = function() {
      if (window.goToHome) window.goToHome();
      else location.reload();
    };

    paperWrap.appendChild(textBox);
    paperWrap.appendChild(retryBtn);

    screenResult.appendChild(bg);
    screenResult.appendChild(smoke);
    screenResult.appendChild(over);
    if (yumeLayer) screenResult.appendChild(yumeLayer);
    screenResult.appendChild(paperWrap);

    let smokeToggle = false;
    if (gameOverSmokeTimer) clearInterval(gameOverSmokeTimer);
    gameOverSmokeTimer = setInterval(() => {
      smokeToggle = !smokeToggle;
      if (smoke) {
        smoke.style.backgroundImage = smokeToggle
          ? "url('assets/game_over_smoke2.png')"
          : "url('assets/game_over_smoke.png')";
      }
    }, 500);

    setTimeout(() => {
      requestAnimationFrame(() => {
        if (paperWrap) paperWrap.style.transform = "translateY(0)";
      });
    }, 300);

  } catch (err) {
    console.error(err);
    screenResult.innerHTML =
      "<div style='color:white; font-size:30px; display:flex; justify-content:center; align-items:center; height:100%;'>결과 화면 로딩 실패<br>다시하기를 눌러주세요.<br><button onclick='location.reload()' style='padding:20px; font-size:20px; margin-top:20px; color:black;'>다시하기</button></div>";
  }
}


function startGameLoop() {
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(gameTick, TICK_MS);
}

function stopGameLoop() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function endGame() {
  stopGameLoop();
  if(window.connectDB) window.connectDB();

  playSfx("assets/game_over.mp3");
  if (grillingAudio) { grillingAudio.pause(); }
  if (burntAudio) { burntAudio.pause(); }

  setTool(null);
  if (screenGame) screenGame.style.cursor = "auto";

  const sessionMoney = money;
  const sessionBreads = breadsBaked; 
  const MAX_EARN_PER_MS = 50000 / 1000; 
  const BUFFER_MONEY = 200000;
  const theoreticalMaxMoney = (elapsedMs * MAX_EARN_PER_MS) + BUFFER_MONEY;

  if (money > theoreticalMaxMoney) {
    triggerCheaterLockdown()
    return;
  }

  if (sessionMoney > bestMoney) bestMoney = sessionMoney;

  if (window.handleGameOver) {
      window.handleGameOver(currentTeam, sessionBreads, sessionMoney);
  } else if (window.sendGameData) {
      window.sendGameData(currentTeam, sessionBreads, sessionMoney);
  }
  
  buildResultScreen();
  setScreen(STATE_RESULT);
}

function stopGameLoop() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function triggerCheaterLockdown() {
  stopGameLoop();
  isGamePlayStarted = false;
  gameState = "locked"; 

  if (bgmAudio) { 
    bgmAudio.pause(); 
    bgmAudio.src = ""; 
    bgmAudio = null; 
  }
  if (grillingAudio) { grillingAudio.pause(); grillingAudio = null; }
  if (burntAudio) { burntAudio.pause(); burntAudio = null; }
  
  isBgmOn = false;
  isSfxOn = false;

  const lockdown = document.createElement("div");
  lockdown.id = "cheater-lockdown";
  lockdown.style.position = "fixed";
  lockdown.style.top = "0";
  lockdown.style.left = "0";
  lockdown.style.width = "100vw";
  lockdown.style.height = "100vh";
  lockdown.style.backgroundColor = "black";
  lockdown.style.backgroundImage = "url('assets/unnatural_play.png')";
  lockdown.style.backgroundRepeat = "no-repeat";
  lockdown.style.backgroundPosition = "center";
  lockdown.style.backgroundSize = "100% 100%"; 
  lockdown.style.zIndex = "9999999";
  lockdown.style.pointerEvents = "all"; 

  document.body.appendChild(lockdown);
  
  console.warn("비정상 플레이 감지됨");
}

function startTeamOverlayOnTitle() {
  const inner = document.getElementById("screen-title-inner");
  if (!inner) return;

  
  let overlay = document.getElementById("team-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "team-overlay";

    const makeAsset = (cls, url, type) => {
      const el = document.createElement("div");
      el.className = `team-asset ${type} ${cls}`;
      el.style.backgroundImage = `url('${url}')`;
      return el;
    };

    overlay.appendChild(makeAsset("team1", "team_1.png", "full"));
    overlay.appendChild(makeAsset("team2", "team_2.png", "full"));
    overlay.appendChild(makeAsset("team3", "team_3.png", "full"));
    overlay.appendChild(makeAsset("team4", "team_4.png", "small"));
    overlay.appendChild(makeAsset("team5", "team_5.png", "small"));

    inner.appendChild(overlay);

    
    attachTeamPickHandlers(overlay);
  }

  overlay.style.display = "block";

  requestAnimationFrame(() => {
    overlay.classList.add("anim-in");
  });

  
  setTimeout(() => {
    const logo = document.getElementById("title-logo");
    const img = document.getElementById("title-image");
    const btn = document.getElementById("title-button");

    if (logo) logo.style.display = "none";
    if (img) img.style.display = "none";
    if (btn) btn.style.display = "none";
  }, 850);
}





function setupEvents() {
  if (btnTitleStart) {
    btnTitleStart.addEventListener("click", () => {
      
      if (window.showLoginScreen) {
         window.showLoginScreen();
      } else {
         alert("로그인 화면 함수가 없습니다.");
      }
    });
  }
  if (teamCards) {
    teamCards.forEach((card) => {
      card.addEventListener("click", () => {
        teamCards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        currentTeam = card.dataset.team;
      });
    });
  }
  if (btnTeamStart) {
    btnTeamStart.addEventListener("click", () => {
      if (!currentTeam) {
        alert("팀을 먼저 선택하세요.");
        return;
      }
      setScreen(STATE_TUTORIAL);
    });
  }
  if (btnTutorialStart) {
    btnTutorialStart.addEventListener("click", () => {
      if (!currentTeam) currentTeam = "redbean";
      enterGameWithTutorial();
    });
  }
  
  document.addEventListener("dragstart", (e) => e.preventDefault());


  window.addEventListener("pointerdown", (e) => {
    
    if (e.pointerType !== "mouse" || e.button === 0) {
      isMouseDown = true;
    }
  });

  const clearMouse = (e) => {
    if (!e || e.pointerType === "mouse") isMouseDown = false;
  };
  window.addEventListener("pointerup", clearMouse);
  window.addEventListener("pointercancel", clearMouse);
  window.addEventListener("blur", () => { isMouseDown = false; });


  
  customerUIElems.forEach((el) => {
    const idx = parseInt(el.dataset.index, 10);
    el.addEventListener("click", () => {
      if (gameState !== STATE_GAME) return;
      if (dragActive) return;
      deliverBagToCustomer(idx);
    });
  });


  toolButtonUIElems.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTool(btn.dataset.tool);
    });
  });
  
  window.addEventListener("pointermove", onPointerMove);



  
  let lastTouchedPanIndex = -1;
  
  window.addEventListener("pointermove", (e) => {
    if (gameState !== STATE_GAME) return;
    
    
    if (e.pointerType === "mouse") {
      onPointerMove(e);
    }

    
    if (isMouseDown && currentTool) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && el.classList.contains("pan-ui")) {
        const idx = parseInt(el.dataset.index, 10);
        if (idx !== lastTouchedPanIndex) {
          onPanClick(idx);
          lastTouchedPanIndex = idx;
        }
      } else {
        lastTouchedPanIndex = -1;
      }
    }

    const btnMobileFull = document.getElementById("btn-mobile-fullscreen");
    if (btnMobileFull) {

      btnMobileFull.style.display = "block";

      btnMobileFull.addEventListener("click", () => {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) docEl.requestFullscreen();
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();

        history.pushState({ page: "game" }, "game", "");
      });
    }

    window.addEventListener("popstate", () => {
      if (gameState === STATE_GAME) {
        console.log("🔙 뒤로가기 감지! 일시정지 실행");

        const pauseScreen = document.getElementById("screen-pause");
        if (pauseScreen) pauseScreen.classList.add("active");
      }
    });

    window.closePause = function() {
      const pauseScreen = document.getElementById("screen-pause");
      if (pauseScreen) pauseScreen.classList.remove("active");
      
      if (typeof gameState !== 'undefined' && gameState === "game") {
          history.pushState({ page: "game" }, "game", "");
          
          startGameLoop(); 

          if (window.isBgmOn && bgmAudio && bgmAudio.paused) {
              bgmAudio.play().catch(()=>{});
          }
      }
    };

    window.quitGameFromPause = function() {
      const pauseScreen = document.getElementById("screen-pause");
      if (pauseScreen) pauseScreen.classList.remove("active");
      
      if (typeof resetGameData === "function") resetGameData();
      window.goToHome(); 
    };
  });
  
  
  window.addEventListener("pointerup", () => { isMouseDown = false; lastTouchedPanIndex = -1; });
  window.addEventListener("pointercancel", () => { isMouseDown = false; lastTouchedPanIndex = -1; });


  panUIElems.forEach((el) => {
    const idx = parseInt(el.dataset.index, 10);

    el.addEventListener("click", () => onPanClick(idx));

    
    el.addEventListener("pointerenter", (e) => {
      if (gameState !== STATE_GAME) return;
      if (dragActive) return;
      if (!currentTool) return;
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (!isMouseDown) return;

      onPanClick(idx);
    });

    el.addEventListener("pointerdown", (e) => {
      const s = pans[idx].state;
      if (
        s === PanState.DONE ||
        s === PanState.BURNT ||
        s === PanState.PHASE2
      ) {
        startDrag("pan", idx, e);
      }
    });
  });

  displayTrayUIElem.addEventListener("click", () => onTrayClick());
  displayTrayUIElem.addEventListener("pointerdown", (e) => {
    if (trayBreads.length > 0) {
      startDrag("tray", 0, e);
    }
  });

  bagUIElem.addEventListener("pointerdown", (e) => {
    if (bagCount > 0) {
      startDrag("bag", null, e);
    }
  });
  window.addEventListener("keydown", (e) => {
    if (gameState !== STATE_GAME) return;
    if (e.repeat) return;

    
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;

    if (e.key === "1") { setTool("batter"); e.preventDefault(); }
    else if (e.key === "2") { setTool("filling"); e.preventDefault(); }
    else if (e.key === "3") { setTool("flip"); e.preventDefault(); }
  });

}


window.testSpawn = function(specialId) {
  if (!SPECIAL_CUSTOMER_DATA[specialId]) {
    console.error(`"${specialId}"라는 손님 데이터가 없습니다.`);
    return;
  }

  const idx = 1; 
  const data = SPECIAL_CUSTOMER_DATA[specialId];
  
  customers[idx] = null;
  customerCooldowns[idx] = 0;

  activeSpecialType = data.id;
  lastSpecialType = data.id;

  const sizes = [3, 6, 9]; 
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  
  let finalDialog = "";
  let sequences = null;
  let talkIndex = 0;
  let talkTimer = 0;

  if (data.logic && data.logic.type === "sequential_talk") {
      sequences = data.logic.getSequences(size);
      finalDialog = sequences[0];
      talkTimer = 1500;
  } else {
      const rawDialog = Array.isArray(data.dialogOrder) ? data.dialogOrder[0] : "...";
      finalDialog = (typeof rawDialog === "function") ? rawDialog(size) : rawDialog;
  }

  const waitMs = (data.id === "fisher") ? 99999 : (size * 8000 + 8000);

  customers[idx] = {
    isSpecial: true,
    specialId: data.id,
    specialLogic: data.logic,
    orderSize: size,       
    waitMs: waitMs,        
    orderWaitMs: waitMs,
    isLeaving: false,
    type: data.id, 
    phase: "order",
    dialog: finalDialog,
    rantIndex: 0,
    rantTimer: 0,

    sequences: sequences,
    talkIndex: talkIndex,
    talkTimer: talkTimer
  };

  customerCooldowns[idx] = 0;

  const groupEl = customerGroupElems[idx];
  if (groupEl) {
    groupEl.style.transition = "none";
    groupEl.style.left = CUSTOMER_POS_OUT_LEFT + "px";
    void groupEl.offsetWidth;
    groupEl.style.transition = "left 0.6s ease-in-out";
  }

  updateCustomer(idx);
  if (data.id === "fisher") {
      setTimeout(() => { runFisherSequence(idx); }, 800);
  }
  else if (data.id === "nero") {
      setTimeout(() => { runNeroSequence(idx); }, 100);
  }
  console.log(`특수손님 [${specialId}] 소환 완료! (주문: ${size}개)`);
};

window.startTeamSelect = function() {
    const loginBox = document.getElementById("login-box-container");
    if(loginBox) loginBox.classList.add("fade-out");

    const loginScreen = document.getElementById("screen-login");
    if (!loginScreen) return;

    let overlay = document.getElementById("team-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "team-overlay";
        const makeAsset = (cls, url, type) => {
            const el = document.createElement("div");
            el.className = `team-asset ${type} ${cls}`;
            el.style.backgroundImage = `url('${url}')`;
            return el;
        };
        overlay.appendChild(makeAsset("team1", "team_1.png", "full"));
        overlay.appendChild(makeAsset("team2", "team_2.png", "full"));
        overlay.appendChild(makeAsset("team3", "team_3.png", "full"));
        overlay.appendChild(makeAsset("team4", "team_4.png", "small"));
        overlay.appendChild(makeAsset("team5", "team_5.png", "small"));

        loginScreen.appendChild(overlay);
        attachTeamPickHandlers(overlay);
    }
    overlay.style.display = "block";
    requestAnimationFrame(() => { overlay.classList.add("anim-in"); });
};

window.getMyCurrentRank = function() {
    
    if (!window.currentUser) return "-";
    if (!topMoneyList || topMoneyList.length === 0) return "-";

    const myNick = window.currentUser.nickname;

    
    const rankIdx = topMoneyList.findIndex(u => u.nickname === myNick);

    
    if (rankIdx !== -1) {
        return rankIdx + 1;
    } else {
        return "100위 밖";
    }
};

setTimeout(() => {
  const btnMobileFull = document.getElementById("btn-mobile-fullscreen");
  if (btnMobileFull) {
      btnMobileFull.style.display = "block";
    
    btnMobileFull.style.zIndex = "999999"; 
    btnMobileFull.style.cursor = "pointer";
    
    btnMobileFull.addEventListener("click", () => {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) docEl.requestFullscreen();
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
      else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
      
      history.pushState({ page: "game" }, "game", "");
    });
  }
}, 500);

window.addEventListener("popstate", () => {
  if (typeof gameState !== 'undefined' && gameState === "game") {
    const pauseScreen = document.getElementById("screen-pause");
    if (pauseScreen) pauseScreen.classList.add("active");
  } else {
    console.log("게임중아님");
  }
});

window.closePause = function() {
  const pauseScreen = document.getElementById("screen-pause");
  if (pauseScreen) pauseScreen.classList.remove("active");
  
  if (typeof gameState !== 'undefined' && gameState === "game") {
      history.pushState({ page: "game" }, "game", "");
  }
};

window.quitGameFromPause = function() {
  const pauseScreen = document.getElementById("screen-pause");
  if (pauseScreen) pauseScreen.classList.remove("active");
  
  if (typeof gameState !== 'undefined') {
      gameState = "home"; 
  }
  if (typeof resetGameData === "function") resetGameData();
  if (typeof window.goToHome === "function") window.goToHome();
};


const savedSpecialSetting = localStorage.getItem("settingUseSpecial");

if (savedSpecialSetting === null) {
    window.settingUseSpecial = true;
    localStorage.setItem("settingUseSpecial", "true");
} else {
    window.settingUseSpecial = (savedSpecialSetting === "true");
}

console.log("현재 특수 손님 설정:", window.settingUseSpecial);

setTimeout(() => {
    const chk = document.getElementById("chk-special-toggle");
    if (chk) {
        chk.checked = window.settingUseSpecial;
        
        chk.onclick = function(e) {
            window.settingUseSpecial = e.target.checked;
            localStorage.setItem("settingUseSpecial", e.target.checked);
            console.log("특수 손님 설정 변경됨:", window.settingUseSpecial);
        };
    }
}, 100); 


window.isBgmOn = localStorage.getItem("settingBgmOn") !== "false";
window.isSfxOn = localStorage.getItem("settingSfxOn") !== "false"; 

window.openSettings = function() {
    const screen = document.getElementById("screen-settings");
    if (screen) screen.classList.add("active");

    const chkSpecial = document.getElementById("chk-special-toggle");
    const chkBgm = document.getElementById("chk-bgm-toggle");
    const chkSfx = document.getElementById("chk-sfx-toggle");
    const chkSnow = document.getElementById("chk-snow-toggle");
    const chkFull = document.getElementById("chk-fullscreen-toggle");
    const chkAuto = document.getElementById("chk-autologin-setting-toggle");

    if (chkSnow) chkSnow.checked = window.isSnowOn;

    if (chkFull) chkFull.checked = (document.fullscreenElement !== null);

    if (chkAuto) {
        const isRemembered = localStorage.getItem("rememberMe") === "true";
        chkAuto.checked = isRemembered;
        window.isAutoLoginSetting = isRemembered;
    }    

    if (chkSpecial && typeof window.settingUseSpecial !== 'undefined') {
        chkSpecial.checked = window.settingUseSpecial;
    }
    
    if (chkBgm) {
        const currentBgm = (typeof window.isBgmOn !== 'undefined') ? window.isBgmOn : (localStorage.getItem("settingBgmOn") !== "false");
        chkBgm.checked = currentBgm;
    }

    if (chkSfx) {
        const currentSfx = (typeof window.isSfxOn !== 'undefined') ? window.isSfxOn : (localStorage.getItem("settingSfxOn") !== "false");
        chkSfx.checked = currentSfx;
    }
};

const initBgm = localStorage.getItem("settingBgmOn") !== "false";
const initSfx = localStorage.getItem("settingSfxOn") !== "false";

window.isBgmOn = initBgm;
window.isSfxOn = initSfx;
if (typeof isBgmOn !== 'undefined') isBgmOn = initBgm;
if (typeof isSfxOn !== 'undefined') isSfxOn = initSfx;

setTimeout(() => {
    const chkBgm = document.getElementById("chk-bgm-toggle");
    const chkSfx = document.getElementById("chk-sfx-toggle");
    const chkSpecial = document.getElementById("chk-special-toggle");

    if (chkBgm) {
        chkBgm.checked = window.isBgmOn;
        
        chkBgm.onclick = function(e) {
            const isOn = e.target.checked;
            window.isBgmOn = isOn;
            if (typeof isBgmOn !== 'undefined') isBgmOn = isOn;
            localStorage.setItem("settingBgmOn", isOn);

            if (!isOn) {
                if (bgmAudio) bgmAudio.pause();
            } else {
                const type = (typeof gameState !== 'undefined' && gameState === "game") ? "game" : "home";
                if (typeof playBgmSequence === "function") playBgmSequence(type);
            }
        };
    }

    if (chkSfx) {
        chkSfx.checked = window.isSfxOn;
        
        chkSfx.onclick = function(e) {
            const isOn = e.target.checked;
            window.isSfxOn = isOn;
            if (typeof isSfxOn !== 'undefined') isSfxOn = isOn;
            localStorage.setItem("settingSfxOn", isOn);

            if (!isOn) {
                if (typeof grillingAudio !== 'undefined' && grillingAudio) {
                    grillingAudio.pause();
                    grillingAudio.currentTime = 0;
                }
                if (typeof burntAudio !== 'undefined' && burntAudio) {
                    burntAudio.pause();
                    burntAudio.currentTime = 0;
                }
            }
        };
    }

    if (chkSpecial && typeof window.settingUseSpecial !== 'undefined') {
        chkSpecial.checked = window.settingUseSpecial;
        chkSpecial.onclick = function(e) {
            window.settingUseSpecial = e.target.checked;
            localStorage.setItem("settingUseSpecial", e.target.checked);
        };
    }
    const chkSnow = document.getElementById("chk-snow-toggle");
    if (chkSnow) {
        chkSnow.checked = window.isSnowOn;
        chkSnow.onclick = function(e) {
            const isOn = e.target.checked;
            window.isSnowOn = isOn;
            localStorage.setItem("settingSnowOn", isOn);
            if (isOn) requestAnimationFrame(snowLoop);
        };
    }

    const chkFull = document.getElementById("chk-fullscreen-toggle");
    if (chkFull) {
        chkFull.onclick = function(e) {
            const isOn = e.target.checked;
            const docEl = document.documentElement;
            if (isOn) {
                if (docEl.requestFullscreen) docEl.requestFullscreen();
                else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
        };
    }

    const chkAuto = document.getElementById("chk-autologin-setting-toggle");
    if (chkAuto) {
        chkAuto.onclick = function(e) {
            const isOn = e.target.checked;
            window.isAutoLoginSetting = isOn;
            if (isOn) localStorage.setItem("rememberMe", "true");
            else localStorage.removeItem("rememberMe");
        };
    }

}, 500);

window.closeSettings = function() {
    const screen = document.getElementById("screen-settings");
    if (screen) screen.classList.remove("active");
};
function initMusicButton() {
    const uiLayer = document.getElementById("ui-layer");
    if (!uiLayer) return;

    const hudBest = document.getElementById("hud-best");
    if (hudBest) {
        hudBest.style.right = "90px"; 
        hudBest.style.top = "20px";   
        hudBest.style.transition = "right 0.3s";
    }

    const oldBtn = document.getElementById("btn-music-toggle");
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement("div");
    btn.id = "btn-music-toggle";
    
    Object.assign(btn.style, {
        position: "absolute",
        top: "10px",
        right: "20px",
        width: "50px",
        height: "50px",
        zIndex: "300",       
        cursor: "pointer",
        pointerEvents: "auto",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundImage: "url('assets/music1.png')"
    });

    uiLayer.appendChild(btn);

    let state = 0;
    if (!window.isBgmOn && window.isSfxOn) state = 1;
    else if (!window.isBgmOn && !window.isSfxOn) state = 2;
    
    const images = ["url('assets/music1.png')", "url('assets/music2.png')", "url('assets/music3.png')"];
    btn.style.backgroundImage = images[state];

    btn.addEventListener("click", (e) => {
        e.stopPropagation();

        state = (state + 1) % 3;
        btn.style.backgroundImage = images[state];

        let newBgm = true;
        let newSfx = true;

        if (state === 0) { newBgm = true; newSfx = true; }
        else if (state === 1) { newBgm = false; newSfx = true; }
        else if (state === 2) { newBgm = false; newSfx = false; }

        window.isBgmOn = newBgm;
        window.isSfxOn = newSfx;
        if (typeof isBgmOn !== 'undefined') isBgmOn = newBgm;
        if (typeof isSfxOn !== 'undefined') isSfxOn = newSfx;

        localStorage.setItem("settingBgmOn", newBgm);
        localStorage.setItem("settingSfxOn", newSfx);

        if (!newBgm && bgmAudio) {
            bgmAudio.pause();
        } else if (newBgm) {
            const type = (typeof gameState !== 'undefined' && gameState === "game") ? "game" : "home";
            if (typeof playBgmSequence === "function") playBgmSequence(type);
        }

        if (!newSfx) {
            if (typeof grillingAudio !== 'undefined' && grillingAudio) {
                grillingAudio.pause(); grillingAudio.currentTime = 0;
            }
            if (typeof burntAudio !== 'undefined' && burntAudio) {
                burntAudio.pause(); burntAudio.currentTime = 0;
            }
        }

        const chkBgm = document.getElementById("chk-bgm-toggle");
        const chkSfx = document.getElementById("chk-sfx-toggle");
        if(chkBgm) chkBgm.checked = newBgm;
        if(chkSfx) chkSfx.checked = newSfx;
    });
    
    btn.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
    });
}

function activateDragVisuals(e) {
  if (!dragData) return;

  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  document.body.appendChild(ghost);
  
  dragData.ghost = ghost;
  dragData.offsetX = -80;
  dragData.offsetY = -80;

  const { type, index } = dragData;

  if (type === "pan") {
    const pan = pans[index];
    let img;
    if (pan.state === PanState.BURNT) img = DragGhostURL.bread_burnt;
    else if (pan.state === PanState.PHASE2) img = DragGhostURL.bread_undercooked;
    else img = pan.hasSpecial ? DragGhostURL.bread_special : DragGhostURL.bread;

    ghost.style.backgroundImage = img;
    ghost.style.width = scaledPx(300);
    ghost.style.height = scaledPx(140);
  } 
  else if (type === "tray") {
    const bread = trayBreads[index]; 
    let img;
    if (bread) {
      const quality = bread.quality || "normal";
      if (quality === "burnt") img = DragGhostURL.bread_burnt;
      else if (quality === "undercooked") img = DragGhostURL.bread_undercooked;
      else img = bread.hasSpecial ? DragGhostURL.bread_special : DragGhostURL.bread;
    } else {
      img = DragGhostURL.bread;
    }
    ghost.style.backgroundImage = img;
    ghost.style.width = scaledPx(300);
    ghost.style.height = scaledPx(140);
  } 
  else if (type === "bag") {
    const img = bagHasSpecial ? DragGhostURL.bag_special : DragGhostURL.bag;
    ghost.style.backgroundImage = img;
    ghost.style.width = scaledPx(300);
    ghost.style.height = scaledPx(280);
    updateBag(true);
  }

  ghost.style.left = (e.clientX + dragData.offsetX) + "px";
  ghost.style.top = (e.clientY + dragData.offsetY) + "px";
}

function forcePauseGame() {
  if (gameState !== STATE_GAME) return;

  const pauseScreen = document.getElementById("screen-pause");
  if (pauseScreen && !pauseScreen.classList.contains("active")) {
      pauseScreen.classList.add("active");
  }

  stopGameLoop();

  if (bgmAudio) bgmAudio.pause();
  if (grillingAudio) { grillingAudio.pause(); grillingAudio.currentTime = 0; }
  if (burntAudio) { burntAudio.pause(); burntAudio.currentTime = 0; }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    forcePauseGame();
  }
});

window.addEventListener("blur", () => {
  forcePauseGame();
});

window.isSnowOn = localStorage.getItem("settingSnowOn") !== "false";

window.openHOF = function() {
    const screen = document.getElementById("screen-hof");
    if (screen) screen.classList.add("active");
};
window.closeHOF = function() {
    const screen = document.getElementById("screen-hof");
    if (screen) screen.classList.remove("active");
};

window.disablePause = function() {
    // 게임을 멈추는 함수를 빈 껍데기로 덮어씌워 버립니다.
    window.forcePauseGame = function() {
        console.log("🛑 일시중지 방어! (백그라운드 실행 중)");
    };
    console.log("✅ 백그라운드 일시중지가 해제되었습니다. 이제 창을 내려도 게임이 돌아갑니다.");
};

window.disablePause();

function runNeroSequence(idx) {
    const c = customers[idx];
    if (!c) return;
  
    const gameScreen = document.getElementById("screen-game");
    if (!gameScreen) return;

    setTimeout(() => {
        if (!customers[idx]) return;

        customers[idx].phase = "success"; 
        customers[idx].facePhase = "success"; 
        customers[idx].waitMs = 10000; 
        updateCustomer(idx);

        const burningOverlay = document.createElement("div");
        Object.assign(burningOverlay.style, {
            position: "absolute", 
            zIndex: "800",        
            top: "0", left: "0", 
            width: "1280px",    
            height: "720px",
            backgroundImage: "url('assets/burning.png')", 
            backgroundSize: "100% 100%",
            pointerEvents: "none",
            mixBlendMode: "normal", 
            opacity: "1" 
        });
        
        burningOverlay.animate([
            { transform: 'translate(0,0)' },
            { transform: 'translate(-5px, -5px)' }, 
            { transform: 'translate(5px, 5px)' },
            { transform: 'translate(-5px, 5px)' },
            { transform: 'translate(5px, -5px)' },
            { transform: 'translate(0,0)' }
        ], { duration: 100, iterations: Infinity });
        gameScreen.appendChild(burningOverlay);

        playChromaVideo("assets/yume_jumpscare.mp4", 2500);

        let burnedCount = 0;
        for (let i = 0; i < NUM_PANS; i++) {
            if (pans[i].state !== PanState.EMPTY) {
                pans[i].state = PanState.BURNT;
                pans[i].stateMs = 0; 
                pans[i].hasSpecial = false;
                burnedCount++;
            }
        }
        if (burnedCount > 0) {
             playSfx("assets/burnt.mp3");
             updateAllPans();
        }

        setTimeout(() => {
            if (burningOverlay) burningOverlay.remove();
            
            if (customers[idx]) {
                customers[idx].dialog = "맛있게 드세요!";
                customers[idx].facePhase = "order";
                updateCustomer(idx);

                setTimeout(() => {
                     if (customers[idx]) {
                        customers[idx].isLeaving = true;
                        customers[idx].waitMs = 1000;
                        updateCustomer(idx);
                     }
                }, 1000);
            }
        }, 2500);

    }, 1000);
}

function playChromaVideo(videoSrc, duration, onComplete) {
  if (window.location.protocol === 'file:') {
    if (onComplete) onComplete();
    return;
  }
  
  const gameScreen = document.getElementById("screen-game");
  if (!gameScreen) return;

  const vid = document.createElement("video");
  vid.src = videoSrc; 
  vid.crossOrigin = "anonymous"; 
  vid.autoplay = true;
  vid.muted = false; 
  vid.playsInline = true;

  vid.style.position = "absolute"; 
  vid.style.top = "0"; vid.style.left = "0";
  vid.style.width = "1px"; vid.style.height = "1px"; 
  vid.style.opacity = "0"; 
  vid.style.pointerEvents = "none";
  vid.style.zIndex = "801"; 
  
  gameScreen.appendChild(vid);

  const canvas = document.createElement("canvas");
  canvas.id = "chroma-canvas";
  canvas.style.position = "absolute"; 
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.width = 1280;
  canvas.height = 720;
  canvas.style.width = "1280px";
  canvas.style.height = "720px";
  canvas.style.zIndex = "802"; 
  canvas.style.pointerEvents = "none";
  
  gameScreen.appendChild(canvas);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  let animationId;
  let isFinished = false; 

  function finish() {
    if (isFinished) return;
    isFinished = true;

    cancelAnimationFrame(animationId);
    if(vid.parentNode) vid.parentNode.removeChild(vid);
    if(canvas.parentNode) canvas.parentNode.removeChild(canvas);

    if (onComplete) onComplete();
  }

  function render() {
    if (isFinished || vid.paused || vid.ended) return;

    if (canvas.width > 0 && canvas.height > 0) {
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      try {
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const len = frame.data.length / 4;
        
        for (let i = 0; i < len; i++) {
          const r = frame.data[i * 4 + 0];
          const g = frame.data[i * 4 + 1];
          const b = frame.data[i * 4 + 2];
          
          if (g > 100 && g > r * 1.4 && g > b * 1.4) {
            frame.data[i * 4 + 3] = 0; 
          }
        }
        ctx.putImageData(frame, 0, 0);
      } catch (err) {
        finish();
        return;
      }
    }
    animationId = requestAnimationFrame(render);
  }

  vid.addEventListener("play", () => { render(); });
  vid.addEventListener("ended", finish); 
  
  if (duration && duration > 0) {
    setTimeout(finish, duration);
  }
  
  vid.play().catch(e => {
    vid.muted = true;
    vid.play().catch(() => finish());
  });
}