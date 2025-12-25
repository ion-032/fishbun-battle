import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    get, 
    update, 
    set, 
    child, 
    runTransaction, 
    query, 
    orderByChild, 
    limitToLast,
    goOffline, 
    goOnline 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAQ6lqxVuVSDAjnMlalegBQ2Q_jm3695ME",
    authDomain: "newfishbun-721ab.firebaseapp.com",
    databaseURL: "https://newfishbun-721ab-default-rtdb.firebaseio.com",
    projectId: "newfishbun-721ab",
    storageBucket: "newfishbun-721ab.firebasestorage.app",
    messagingSenderId: "935215463884",
    appId: "1:935215463884:web:c1a6fae59dacef0a05b169",
    measurementId: "G-5J3KVHH596"
  };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.currentUser = null;
let topMoneyList = [];  
let topBreadsList = []; 
let currentRankType = "money";
let rankMsgMoney = "1등이 문구를 적지 않았어요!";
let rankMsgBreads = "1등이 문구를 적지 않았어요!";
let homeSnowAnimId = null;

let scorePollingTimer = null;

window.disconnectDB = function() {
    if (scorePollingTimer) {
        clearInterval(scorePollingTimer);
        scorePollingTimer = null;
    }
    goOffline(db);
};

window.connectDB = function() {
    goOnline(db);
};

async function hashPassword(plainPassword) {
    const msgBuffer = new TextEncoder().encode(plainPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function startHomeSnow() {
    const canvas = document.getElementById("home-snow-canvas");
    const container = document.getElementById("box-stall-container");
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext("2d");
    const flakeCount = 50;
    const flakes = [];

    for (let i = 0; i < flakeCount; i++) {
        flakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 1,
            d: Math.random() * flakeCount,
            vx: Math.random() * 1 - 0.5,
            vy: Math.random() * 1 + 1
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();

        for (let i = 0; i < flakeCount; i++) {
            const f = flakes[i];
            ctx.moveTo(f.x, f.y);
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
            f.y += f.vy;
            f.x += f.vx;
            if (f.y > canvas.height) {
                f.y = -10;
                f.x = Math.random() * canvas.width;
            }
            if (f.x > canvas.width + 5 || f.x < -5) {
                f.x = Math.random() * canvas.width;
                f.y = -10;
            }
        }
        ctx.fill();
        homeSnowAnimId = requestAnimationFrame(draw);
    }
    if (homeSnowAnimId) cancelAnimationFrame(homeSnowAnimId);
    draw();
}

function stopHomeSnow() {
    if (homeSnowAnimId) {
        cancelAnimationFrame(homeSnowAnimId);
        homeSnowAnimId = null;
    }
}

function fetchTeamScores() {
    if (document.hidden) return;

    get(child(ref(db), 'team_scores')).then((snapshot) => {
        const data = snapshot.val() || {};
        updateTeamScoreUI(data);
    }).catch((err) => console.warn("점수 로드 실패", err));
}

window.fetchTeamScores = fetchTeamScores;

function updateTeamScoreUI(data) {
    const r = data.redbean || 0;
    const s = data.shu || 0;
    const total = r + s;
    let rp = 50, sp = 50;
    if (total > 0) { rp = Math.round((r / total) * 100); sp = 100 - rp; }

    const barRed = document.getElementById("bar-red");
    const barShu = document.getElementById("bar-shu");
    if (barRed) { barRed.style.width = rp + "%"; barRed.innerText = `팥 ${rp}%`; }
    if (barShu) { barShu.style.width = sp + "%"; barShu.innerText = `슈 ${sp}%`; }

    const boxTeam = document.getElementById("area-team-box");
    const titleElem = document.getElementById("home-lead-title");
    const diffElem = document.getElementById("home-lead-diff");

    if (boxTeam && titleElem) {
        if (r === s) {
            titleElem.innerText = "현재 막상막하!";
            diffElem.innerText = "동점입니다!";
            boxTeam.style.backgroundColor = "#777777";
            boxTeam.style.backgroundImage = "url('assets/team_win_none.png')"; 
        } else if (r > s) {
            const diff = r - s;
            titleElem.innerText = "현재 팥붕 우세!";
            diffElem.innerText = `${diff.toLocaleString()}개 앞서는 중!`;
            boxTeam.style.backgroundColor = "#b74c4c";
            boxTeam.style.backgroundImage = "url('assets/team_win_red.png')";
        } else {
            const diff = s - r;
            titleElem.innerText = "현재 슈붕 우세!";
            diffElem.innerText = `${diff.toLocaleString()}개 앞서는 중!`;
            boxTeam.style.backgroundColor = "#f5c842";
            boxTeam.style.backgroundImage = "url('assets/team_win_shu.png')";
        }
    }
}

window.goToHome = function () {
    goOnline(db);

    const screens = ["screen-login", "screen-title", "screen-team", "screen-game", "screen-result"];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.remove("active");
    });

    const overlay = document.getElementById("team-overlay");
    if (overlay) overlay.remove();
    const confirmOverlay = document.getElementById("team-confirm-overlay");
    if (confirmOverlay) confirmOverlay.remove();

    const home = document.getElementById("screen-home");
    if (home) {
        home.classList.add("active");
        if (window.currentUser) {
            const nickElem = document.getElementById("display-my-nick");
            if (nickElem) nickElem.innerText = window.currentUser.nickname;

            const stallBox = document.querySelector(".box-stall");
            if (stallBox) {
                const myTeam = window.currentUser.team || window.currentTeam;
                stallBox.style.backgroundImage = (myTeam === 'shu') ? "url('assets/bg_stall_home_shu.png')" : "url('assets/bg_stall_home.png')";
            }
        }
        startHomeSnow();
        if (typeof updateMyStatsUI === "function") updateMyStatsUI();
        if (scorePollingTimer) clearInterval(scorePollingTimer);
        fetchTeamScores();
        scorePollingTimer = setInterval(fetchTeamScores, 10000); 
    }
};

window.updateUserTeam = function (teamId) {
    if (!window.currentUser) return;
    const nick = window.currentUser.nickname;
    const userRef = ref(db, `users/${nick}`);
    update(userRef, { team: teamId });
    window.currentUser.team = teamId;
};

const loadingScreen = document.getElementById("screen-loading");
if (loadingScreen) loadingScreen.classList.remove("active");

window.showLoginScreen = function () {
    const savedNick = localStorage.getItem("fishbun_saved_nick");
    const savedAuth = localStorage.getItem("fishbun_saved_auth");

    if (savedNick && savedAuth) {
        tryAutoLogin(); 
    } 
    else {
        const loginScr = document.getElementById("screen-login");
        if (loginScr) loginScr.classList.add("active");
    }
};
window.switchAuthMode = function (mode) {
    const tabLogin = document.getElementById("tab-login");
    const tabSignup = document.getElementById("tab-signup");
    const btnLogin = document.getElementById("btn-action-login");
    const btnSignup = document.getElementById("btn-action-signup");
    const msgLogin = document.getElementById("msg-login");
    const msgSignup = document.getElementById("msg-signup");
    const chkAuto = document.getElementById("chk-auto-login"); 
    const chkLabel = chkAuto ? chkAuto.parentElement.parentElement : null;

    if (mode === 'login') {
        tabLogin.classList.add("active"); tabSignup.classList.remove("active");
        btnLogin.classList.remove("hidden"); btnSignup.classList.add("hidden");
        msgLogin.classList.remove("hidden"); msgSignup.classList.add("hidden");
        if(chkLabel) chkLabel.style.display = "block";
    } else {
        tabLogin.classList.remove("active"); tabSignup.classList.add("active");
        btnLogin.classList.add("hidden"); btnSignup.classList.remove("hidden");
        msgLogin.classList.add("hidden"); msgSignup.classList.remove("hidden");
        if(chkLabel) chkLabel.style.display = "none";
    }
};

const inpNick = document.getElementById("inp-nick");
const inpPass = document.getElementById("inp-pass");
const btnActionLogin = document.getElementById("btn-action-login");
const btnActionSignup = document.getElementById("btn-action-signup");

function handleEnterKey(e) {
    if (e.key === "Enter") {
        if (!btnActionLogin.classList.contains("hidden")) btnActionLogin.click();
        else if (!btnActionSignup.classList.contains("hidden")) btnActionSignup.click();
    }
}
if (inpNick) inpNick.addEventListener("keydown", handleEnterKey);
if (inpPass) inpPass.addEventListener("keydown", handleEnterKey);

if (btnActionLogin) {
    btnActionLogin.addEventListener("click", async () => {
        const nick = inpNick.value.trim();
        const pass = inpPass.value.trim();
        const chkAuto = document.getElementById("chk-auto-login");

        if (!nick || !pass) { alert("입력해주세요."); return; }

        const hashedPassword = await hashPassword(pass);
        const userRef = ref(db, `users/${nick}`);

        try {
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                alert("존재하지 않는 아이디입니다.");
                return; 
            }

            const userData = snapshot.val();
            if (userData.authKey !== hashedPassword) {
                alert("비밀번호가 틀렸습니다.");
                return;
            }

            await update(userRef, {
                lastPlayed: Date.now()
            });

            console.log("로그인 성공");

            if (chkAuto && chkAuto.checked) {
                localStorage.setItem("fishbun_saved_nick", nick);
                localStorage.setItem("fishbun_saved_auth", hashedPassword);
            } else {
                localStorage.removeItem("fishbun_saved_nick");
                localStorage.removeItem("fishbun_saved_auth");
            }

            window.loginSuccess(nick, { ...userData, password: hashedPassword });
            
        } catch (e) {
            console.error(e);
            alert("로그인 처리 중 오류가 발생했습니다.");
        }
    });
}

if (btnActionSignup) {
    btnActionSignup.addEventListener("click", async () => {
        const nick = inpNick.value.trim();
        const pass = inpPass.value.trim();
        
        if (!nick) { alert("닉네임을 입력해주세요."); return; }
        if (!pass) { alert("비밀번호를 입력해주세요."); return; }
        if (/[.#$[\]]/.test(nick)) { alert("닉네임에 특수문자 금지."); return; }

        const hashedPassword = await hashPassword(pass);
        
        const userRef = ref(db, `users/${nick}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            alert("이미 존재하는 닉네임입니다.");
            return;
        }

        const updates = {};
        updates[`users/${nick}`] = {
            team: 'none',
            bestMoney: 0,
            totalBreads: 0,
            createdAt: Date.now(),
            authKey: hashedPassword
        };
        updates[`secrets/${nick}`] = hashedPassword; 

        try {
            await update(ref(db), updates);
            window.loginSuccess(nick, { team: 'none', password: hashedPassword }); 
        } catch (e) {
            console.error(e);
            alert("가입 실패 (이미 존재하거나 오류): " + e.message);
        }
    });
}

window.loginSuccess = function(nick, data) {
    window.currentUser = { nickname: nick, ...data };
    loadLeaderboard();

    if (!data.team || data.team === 'none') {
        if (window.startTeamSelect) window.startTeamSelect();
    } else {
        window.currentTeam = data.team;
        window.goToHome();
    }
};

async function loadLeaderboard(forceRefresh = false) {
  const CACHE_TIME = 5 * 60 * 1000;
  const now = Date.now();
  const lastFetch = localStorage.getItem("rank_cache_time");
  
  if (!forceRefresh && lastFetch && (now - parseInt(lastFetch) < CACHE_TIME)) {
      try {
          const cachedMoney = JSON.parse(localStorage.getItem("rank_cache_money"));
          const cachedBreads = JSON.parse(localStorage.getItem("rank_cache_breads"));
          
          if (cachedMoney && cachedBreads) {
              topMoneyList = cachedMoney;
              topBreadsList = cachedBreads;
              
              if (currentRankType === 'money') updateRankingUI();
              else if (currentRankType === 'breads') updateRankingUI();
              updateMyStatsUI();
              return; 
          }
      } catch (e) {
          console.warn("캐시 데이터 오류, 서버에서 다시 받아옵니다.");
      }
  }
  const moneyQuery = query(ref(db, 'ranks'), orderByChild('seasonBestMoney'), limitToLast(20));
  const breadsQuery = query(ref(db, 'ranks'), orderByChild('seasonBreads'), limitToLast(20));
  
  try {
      const moneySnap = await get(moneyQuery);
      const moneyData = moneySnap.val();
      topMoneyList = moneyData ? Object.entries(moneyData)
          .map(([key, val]) => ({
              nickname: key,
              bestMoney: val.bestMoney || 0,        // 평생 기록 (표시용)
              seasonBestMoney: val.seasonBestMoney || 0, // 시즌 기록 (랭킹용)
              team: val.team || 'redbean'
          }))
          .sort((a, b) => b.seasonBestMoney - a.seasonBestMoney) : [];

      const breadSnap = await get(breadsQuery);
      const breadData = breadSnap.val();
      topBreadsList = breadData ? Object.entries(breadData)
          .map(([key, val]) => ({
              nickname: key,
              totalBreads: val.totalBreads || 0,
              seasonBreads: val.seasonBreads || 0,
              team: val.team || 'redbean'
          }))
          .sort((a, b) => b.seasonBreads - a.seasonBreads) : [];

      localStorage.setItem("rank_cache_money", JSON.stringify(topMoneyList));
      localStorage.setItem("rank_cache_breads", JSON.stringify(topBreadsList));
      localStorage.setItem("rank_cache_time", now.toString());

      if (currentRankType === 'money') updateRankingUI();
      else if (currentRankType === 'breads') updateRankingUI();
      updateMyStatsUI();

  } catch (error) {
      console.error("랭킹 로드 실패:", error);
  }
}

function updateRankingUI() {
    const listArea = document.getElementById("rank-list-area");
    if (!listArea) return;

    let targetList = (currentRankType === "money") ? topMoneyList : topBreadsList;
    const topList = targetList.slice(0, 5); 
    let html = "";

    if (topList.length > 0) {
        for (let i = 0; i < topList.length; i++) {
            const u = topList[i];
            let teamClass = "team-none";
            if (u.team === 'redbean') teamClass = "team-red";
            else if (u.team === 'shu') teamClass = "team-shu";

            const val = (currentRankType === "money")
                ? `${(u.seasonBestMoney || 0).toLocaleString()}원`
                : `${(u.seasonBreads || 0).toLocaleString()}개`;
            
            const safeNick = escapeHtml(u.nickname);

            if (i === 0) {
                const rawMsg = (currentRankType === "money") ? rankMsgMoney : rankMsgBreads;
                const safeMsg = escapeHtml(rawMsg);
                html += `
                      <div class="rank-row rank-1 ${teamClass}">
                          <div class="rank-1-top">
                            <span>1위 - ${safeNick}</span>
                            <span>${val}</span>
                          </div>
                          <div class="rank-1-msg">${safeMsg}</div>
                        </div>
                    `;
            } else {
                html += `
                      <div class="rank-row ${teamClass}">
                        <span>${i + 1}위 - ${safeNick}</span>
                        <span>${val}</span>
                      </div>
                    `;
            }
        }
        for (let i = topList.length; i < 5; i++) {
            html += `<div class="rank-row team-none" style="color:#aaa;"><span>${i + 1}위 - ...</span><span>-</span></div>`;
        }
    } else {
        html = "<div style='padding:20px;'>데이터 없음</div>";
    }
    listArea.innerHTML = html;
}

function updateMyStatsUI() {
    if (!window.currentUser) return;
    const myNick = window.currentUser.nickname;
    
    const myBestMoney = window.currentUser.bestMoney || 0;
    const mySeasonBestMoney = window.currentUser.seasonBestMoney || 0;
    const myTotalBreads = window.currentUser.totalBreads || 0;
    const mySeasonBreads = window.currentUser.seasonBreads || 0;

    const rankIdx = topMoneyList.findIndex(u => u.nickname === myNick);
    const rankText = (rankIdx !== -1) ? `${rankIdx + 1}위` : "100위 밖";
    
    const myStatsElem = document.getElementById("my-stats-text");
    if (myStatsElem) {
        myStatsElem.innerHTML = `
            <div style="margin:0; margin-bottom: -10px;">내 최고 수익 ${myBestMoney.toLocaleString()}원</div>
            <div style="margin:0; margin-bottom: -10px;">(시즌 ${mySeasonBestMoney.toLocaleString()}원)</div>
            <div style="margin:0; margin-bottom: -10px;">수익 랭킹: ${rankText}</div>
            <div style="margin:0; margin-bottom: -10px;">누적 붕어빵 ${myTotalBreads.toLocaleString()}개</div>
            <div style="margin:0;">(시즌 ${mySeasonBreads.toLocaleString()}개)</div>
        `;
    }
    const nickElem = document.getElementById("display-my-nick");
    if (nickElem) nickElem.innerText = myNick;
}

onValue(ref(db, 'rank_top/money_message'), (snapshot) => {
    rankMsgMoney = snapshot.val() || "1등이 문구를 적지 않았어요!";
    updateRankingUI();
});
onValue(ref(db, 'rank_top/breads_message'), (snapshot) => {
    rankMsgBreads = snapshot.val() || "1등이 문구를 적지 않았어요!";
    updateRankingUI();
});

window.handleGameOver = function (team, sessionBreads, sessionMoney) {
    if (!window.currentUser) return;

    goOnline(db);

    setTimeout(() => {
        try {
            let maxSeasonMoney = 0;
            let maxSeasonBreads = 0;
            let bestBreadsNick = "";

            if (topMoneyList && topMoneyList.length > 0) {
                maxSeasonMoney = topMoneyList[0].seasonBestMoney || 0;
            }
            if (topBreadsList && topBreadsList.length > 0) {
                maxSeasonBreads = topBreadsList[0].seasonBreads || 0;
                bestBreadsNick = topBreadsList[0].nickname;
            }
            const myNick = window.currentUser.nickname;
            const myCurrentSeasonBreads = (window.currentUser.seasonBreads || 0) + sessionBreads;
        
            const isRank1_Money = (sessionMoney >= maxSeasonMoney);
            const isRank1_Breads = (myCurrentSeasonBreads >= maxSeasonBreads);

            const isAlreadyBreadKing = (bestBreadsNick === myNick && maxSeasonBreads > 0);

            let msgMoney = null;
            let msgBreads = null;

            if (isRank1_Money) {
                if (sessionMoney > 0) {
                    let input = prompt(`축하합니다! 수익 랭킹 1위를 달성했습니다!\n(${sessionMoney.toLocaleString()}원)\n\n랭킹판에 남길 한마디를 입력해주세요.`, "");
                    msgMoney = (input && input.trim().length > 0) ? input.trim() : "1등이 문구를 적지 않았어요!";
                }
            }

            if (isRank1_Breads && !isAlreadyBreadKing) {
                if (myCurrentSeasonBreads > 0) {
                    let input = prompt(`축하합니다! 구운 붕어빵 랭킹 1위를 달성했습니다!\n(${myCurrentSeasonBreads.toLocaleString()}개)\n\n랭킹판에 남길 한마디를 입력해주세요.`, "");
                    msgBreads = (input && input.trim().length > 0) ? input.trim() : "1등이 문구를 적지 않았어요!";
                }
            }

            window.sendGameData(team, sessionBreads, sessionMoney, msgMoney, msgBreads);

        } catch (err) {
            console.error("랭킹 체크 중 오류 발생(무시하고 저장 진행):", err);
            window.sendGameData(team, sessionBreads, sessionMoney, null, null);
        }
    }, 800); 
};

window.getMyCurrentRank = function(currentSessionBest = 0) {
    try {
        if (!window.currentUser) return "-";
        if (!topMoneyList || !Array.isArray(topMoneyList)) return "-";
        
        const myNick = window.currentUser.nickname;
        const mySeasonBest = window.currentUser.seasonBestMoney || 0;
        const myRealBest = Math.max(mySeasonBest, currentSessionBest);

        let tempList = [...topMoneyList];
        tempList = tempList.filter(u => u.nickname !== myNick);
        
        tempList.push({
            nickname: myNick,
            seasonBestMoney: myRealBest,
            team: window.currentUser.team
        });

        tempList.sort((a, b) => b.seasonBestMoney - a.seasonBestMoney);

        const rankIdx = tempList.findIndex(u => u.nickname === myNick);
        if (rankIdx !== -1) return rankIdx + 1;
        else return "100위 밖";
    } catch (e) {
        console.warn(e);
        return "-"; 
    }
};

window.sendGameData = function (team, sessionBreads, sessionMoney, msgMoney, msgBreads) {
    if (!window.currentUser) return;
    const nick = window.currentUser.nickname;
    const myAuthKey = window.currentUser.password;

    goOnline(db);

    if (!myAuthKey) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        return;
    }
    const teamKey = (team === 'shu') ? 'shu' : 'redbean';

    runTransaction(ref(db, `team_scores/${teamKey}`), (current) => (current || 0) + sessionBreads);

    const currentBest = window.currentUser.bestMoney || 0;
    const currentTotal = window.currentUser.totalBreads || 0;
    const currentSeason = window.currentUser.seasonBreads || 0;
    const currentSeasonBest = window.currentUser.seasonBestMoney || 0;
    const newBestMoney = Math.max(currentBest, sessionMoney);       // 평생 최고
    const newTotalBreads = currentTotal + sessionBreads;            // 평생 누적
    const newSeasonBreads = currentSeason + sessionBreads;          // 시즌 누적
    const newSeasonBestMoney = Math.max(currentSeasonBest, sessionMoney); // 시즌 최고

    const nowTime = Date.now();

    const userUpdates = {};
    const userPath = `users/${nick}`;
    userUpdates[`${userPath}/bestMoney`] = newBestMoney;
    userUpdates[`${userPath}/totalBreads`] = newTotalBreads;
    userUpdates[`${userPath}/seasonBreads`] = newSeasonBreads;
    userUpdates[`${userPath}/seasonBestMoney`] = newSeasonBestMoney;
    userUpdates[`${userPath}/lastPlayed`] = nowTime;
    userUpdates[`${userPath}/team`] = window.currentUser.team;

    update(ref(db), userUpdates)
    .then(() => {
        const rankUpdates = {};
        const rankPath = `ranks/${nick}`;
        rankUpdates[`${rankPath}/bestMoney`] = newBestMoney;
        rankUpdates[`${rankPath}/totalBreads`] = newTotalBreads;
        rankUpdates[`${rankPath}/seasonBreads`] = newSeasonBreads;
        rankUpdates[`${rankPath}/seasonBestMoney`] = newSeasonBestMoney;
        rankUpdates[`${rankPath}/team`] = window.currentUser.team;
        
        if (msgMoney) rankUpdates['rank_top/money_message'] = msgMoney;
        if (msgBreads) rankUpdates['rank_top/breads_message'] = msgBreads;
        return update(ref(db), rankUpdates);
    })
    .then(() => {
        console.log("데이터 저장 완료");
        window.currentUser.bestMoney = newBestMoney;
        window.currentUser.totalBreads = newTotalBreads;
        window.currentUser.seasonBreads = newSeasonBreads;
        window.currentUser.seasonBestMoney = newSeasonBestMoney;
        loadLeaderboard(true); 
    })
    .catch((err) => {
        console.error("저장 실패:", err);
        alert("데이터 저장 중 오류가 발생했습니다: " + err.message);
    });
};

document.querySelectorAll(".rank-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".rank-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentRankType = tab.dataset.type;
        updateRankingUI();
    });
});

const startBtn = document.getElementById("btn-game-start");
if (startBtn) {
    startBtn.addEventListener("click", () => {
        stopHomeSnow();
        if (scorePollingTimer) {
            clearInterval(scorePollingTimer);
            scorePollingTimer = null;
        }

        document.getElementById("screen-home").classList.remove("active");
        if (window.checkTutorialAndStart) {
            window.checkTutorialAndStart();
        } else {
            if (window.enterGameWithTutorial) window.enterGameWithTutorial();
        }
    });
}

async function tryAutoLogin() {
    const savedNick = localStorage.getItem("fishbun_saved_nick");
    const savedAuth = localStorage.getItem("fishbun_saved_auth");

    if (!savedNick || !savedAuth) {
        document.getElementById("screen-login").classList.add("active");
        return;
    }

    try {
        const userRef = ref(db, `users/${savedNick}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.authKey === savedAuth) {
                window.loginSuccess(savedNick, { ...userData, password: savedAuth });

                const loginScreen = document.getElementById("screen-login");
                if(loginScreen) loginScreen.classList.remove("active");
                
            } else {
                localStorage.removeItem("fishbun_saved_auth");
                alert("비밀번호가 변경되어 다시 로그인이 필요합니다.");
                document.getElementById("screen-login").classList.add("active");
            }
        } else {
            console.warn("유저 없음 -> 로그인 창 띄움");
            localStorage.removeItem("fishbun_saved_nick");
            document.getElementById("screen-login").classList.add("active");
        }
    } catch (e) {
        console.error("자동 로그인 오류:", e);
        document.getElementById("screen-login").classList.add("active");
    }
}


window.openSettings = function() {
    const screen = document.getElementById("screen-settings");
    if (screen) screen.classList.add("active");
};

window.closeSettings = function() {
    const screen = document.getElementById("screen-settings");
    if (screen) screen.classList.remove("active");
};

window.logout = function() {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
        localStorage.removeItem("fishbun_saved_nick");
        localStorage.removeItem("fishbun_saved_auth");
        window.location.reload(); 
    }
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
            el.style.backgroundImage = `url('assets/${url}')`;
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

let isRefreshing = false;

window.refreshRankingManual = function() {
    if (window.isRefreshing) {
        return; 
    }

    const btn = document.getElementById("btn-rank-refresh");

    if (btn) {
        btn.style.transition = "filter 0.3s"; 
        btn.style.filter = "brightness(0.4)"; 
        btn.style.cursor = "not-allowed";  
    }

    window.isRefreshing = true;

    
    if (typeof loadLeaderboard === "function") {
        loadLeaderboard(true);
    }

    setTimeout(() => {
        window.isRefreshing = false;
        if (btn) {
            btn.style.filter = "brightness(1)"; 
            btn.style.cursor = "pointer";      
        }
    }, 1000);
};

window.resetSeasonManually = async function() {
    const MY_ADMIN_NICKNAME = "032"; 

    if (!window.currentUser) {
        alert("먼저 게임에 로그인해주세요.");
        return;
    }
    if (window.currentUser.nickname !== MY_ADMIN_NICKNAME) {
        alert(`권한 거부`);
        return;
    }

    console.log("관리자 스위치(admin_mode) 확인 중...");
    const adminSnap = await get(ref(db, 'admin_mode'));
    const isAdminMode = adminSnap.val();
    if (isAdminMode !== true && isAdminMode !== "true") {
        alert("파이어베이스 콘솔에서 ''를 true로 켜고 다시 시도하세요.");
        return;
    }

    if (!confirm(`[개발자 확인: ${MY_ADMIN_NICKNAME}]\n정말로 시즌을 초기화하시겠습니까?`)) return;

    console.log("시즌 초기화 시작...");

    try {
        const usersSnap = await get(ref(db, 'users'));
        
        if (usersSnap.exists()) {
            const updates = {};
            
            usersSnap.forEach((child) => {
                const nick = child.key;
                updates[`users/${nick}/seasonBreads`] = 0;
                updates[`ranks/${nick}/seasonBreads`] = 0;
                updates[`users/${nick}/seasonBestMoney`] = 0;
                updates[`ranks/${nick}/seasonBestMoney`] = 0;
            });

            await update(ref(db), updates);
            
            console.log("시즌 데이터 초기화 완료!");

            await set(ref(db, 'admin_mode'), false);
            console.log("관리자 모드(admin_mode)를 자동으로 껐습니다.");

            alert("성공! 시즌이 초기화되었습니다.");
            location.reload(); 
        }
    } catch (e) {
        console.error("초기화 실패:", e);
        alert("❌ 실패! 에러 내용: " + e.message);
    }

};