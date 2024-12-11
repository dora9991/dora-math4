document.addEventListener('DOMContentLoaded', () => {
    const checkMathJaxInterval = setInterval(() => {
        if (window.MathJax && MathJax.typesetPromise) {
            console.log("MathJax is fully loaded.");
            clearInterval(checkMathJaxInterval);
        }
    }, 500); // 500msごとにチェック
});



// ここから他のゲームの初期化スクリプトを書く

// ローカルストレージから情報を取得
const selectedUnit = localStorage.getItem('selectedUnit');
const selectedSubunit = localStorage.getItem('selectedSubunit');
const selectedDifficulty = localStorage.getItem('selectedDifficulty');
const selectedField = localStorage.getItem('selectedField');

if (!selectedUnit || !selectedSubunit || !selectedDifficulty || !selectedField) {
    console.error({
        selectedUnit,
        selectedSubunit,
        selectedDifficulty,
        selectedField
    });
    alert("必要な情報が不足しています。単元や難易度を選び直してください。");
    window.location.href = "mainmenu.html";
    throw new Error("必要な情報が不足しています。");
}

// 問題生成ファイルのパスを生成
const problemScriptPath = `problems/${selectedUnit}_${selectedSubunit}_${selectedDifficulty}.js`;

// heroAbilitiesをlocalStorageから取得
const heroAbilities = JSON.parse(localStorage.getItem('heroAbilities'));
if (!heroAbilities) {
    alert("勇者の能力値が取得できませんでした。");
    window.location.href = "mainmenu.html";
    throw new Error("勇者の能力値が取得できませんでした。");
}

// 分野番号から分野名へのマッピング
const fieldMapping = {
    '1': '計算',
    '2': '方程式',
    '3': '関数',
    '4': '図形',
    '5': '統計',
    '6': '総合'
};

// 選択された分野名と能力値を取得
const selectedFieldName = fieldMapping[selectedField];
const heroAbilityValue = heroAbilities[selectedFieldName];

if (!heroAbilityValue) {
    alert("選択された分野の能力値が取得できませんでした。");
    window.location.href = "mainmenu.html";
    throw new Error("選択された分野の能力値が取得できませんでした。");
}

// グローバル変数
let heroHP = parseInt(localStorage.getItem("heroHP")) || 100;
let heroLevel = parseInt(localStorage.getItem("heroLevel")) || 1;
let hero = { name: "勇者", hp: heroHP, attackPower: heroAbilityValue, level: heroLevel };
let correctAnswer;
let correctCount = 0;
let totalQuestions = 0;
let experiencePoints = 0; // 毎回リセットされるよう変更
let monster;


// モンスターを定義
const monsters = {
    1/*beginner*/: [
        { name: "スライム", hp: 240, attackPower: 900, image: "beginner_1.jpg", experience: 14 },
        { name: "ドラキー", hp: 220, attackPower: 1000, image: "beginner_2.jpg", experience: 15 }
    ],
    2/*middle*/ : [
        { name: "さまようよろい", hp: 300, attackPower: 1400, image: "middle_1.jpg", experience: 17 },
        { name: "ゴーレム", hp: 400, attackPower: 1200, image: "middle_2.jpg", experience: 18 }
    ],
    3/*advanced*/: [
        { name: "キラーマシン", hp: 350, attackPower: 1900, image: "advanced_1.jpg", experience: 20 },
        { name: "グレイトドラゴン", hp: 400, attackPower: 1700, image: "advanced_2.jpg", experience: 21 }
    ]
};


// モンスターを選択
function selectMonster(difficulty) {
    const levelMonsters = monsters[difficulty];
    if (!levelMonsters) {
        console.error(`指定された難易度 (${difficulty}) に対応するモンスターが見つかりません`);
        return null;
    }
    return levelMonsters[Math.floor(Math.random() * levelMonsters.length)];
}



// スクリプトを動的に読み込む関数
function loadProblemScript(path) {
    return new Promise((resolve, reject) => {
        console.log(`Loading script: ${path}`); // ロード開始をログ出力
        const script = document.createElement('script');
        script.src = path;
        script.type = 'text/javascript';
        script.onload = () => {
            console.log(`Script loaded successfully: ${path}`); // 成功時のログ
            resolve();
        };
        script.onerror = () => {
            console.error(`Failed to load script: ${path}`); // エラー時のログ
            reject(new Error(`Failed to load script: ${path}`));
        };
        document.head.appendChild(script);
    });
}

// ゲーム初期化関数
function initGame() {
    const game = document.getElementById("game");
    const heroHPLabel = document.getElementById("heroHP");
    const monsterHPLabel = document.getElementById("monsterHP");
    const battleLog = document.getElementById("battleLog");
    const answersDiv = document.getElementById("answers");
    const monsterImage = document.getElementById("monsterImage");
    const accuracyLabel = document.getElementById("accuracy");
    const returnButton = document.getElementById("returnButton");
    const monsterNameLabel = document.getElementById("monsterName");
    const heroAbilityLabel = document.getElementById("heroAbility"); // 追加
    const monsterAbilityLabel = document.getElementById("monsterAbility");
    

   // 難易度に応じたモンスターを選択
   const selectedMonster = selectMonster(selectedDifficulty);
   if (!selectedMonster) {
       alert("モンスターの選択に失敗しました。");
       window.location.href = "mainmenu.html";
       return;
   }

    // グローバル変数にモンスターをセット
    monster = { ...selectedMonster };
    
    monsterNameLabel.textContent = monster.name;
    monsterAbilityLabel.textContent = `${selectedFieldName}: ${monster.attackPower}`;

    // モンスターの画像を設定
    monsterImage.src = `images/${monster.image}`;
    monsterImage.onerror = function() {
        console.error('Failed to load image:', monsterImage.src);
    };

    // 戦闘終了後の選択画面ボタン処理
    returnButton.onclick = () => {
        localStorage.setItem("currentExperience", "0"); // 一時的な経験値をリセット
        window.location.href = "mainmenu.html"; // メインメニューにリダイレクト
    };

     // ダメージ計算
     function calculateDamage(attacker, defender) {
        const randomAdjustment = Math.floor(Math.random() * 7) - 3; // -3から3のランダム値
        const damage = Math.max(
            0,
            Math.floor((attacker.attackPower - defender.attackPower /5)/20 + randomAdjustment + 10)
        );
        return damage;
    }


   // 解答チェック
function checkAnswer(selectedAnswer) {
    battleLog.innerHTML = ""; // ログをクリア
    answersDiv.innerHTML = ""; // 答えの選択肢をクリア

    const correctSound = document.getElementById("correctSound");
    const incorrectSound = document.getElementById("incorrectSound");

    const monsterImage = document.getElementById("monsterImage");
    const wrapper = document.getElementById("wrapper");

    if (validateAnswer(selectedAnswer, correctAnswer)) { // validateAnswerは外部ファイルで定義
        const damageToMonster = calculateDamage(hero, monster);
        battleLog.innerHTML += `正解！ ${monster.name} に ${damageToMonster} のダメージ！<br>`;
        monster.hp -= damageToMonster;
        correctCount++; // 正解数をカウント

        // モンスターへのエフェクト
        monsterImage.classList.add("attack-effect");
        setTimeout(() => monsterImage.classList.remove("attack-effect"), 300);

        // 正解音を再生
        correctSound.currentTime = 0;
        correctSound.play();
    } else {
        const damageToHero = calculateDamage(monster, hero);
        battleLog.innerHTML += `ミス！ ${hero.name} は ${damageToHero} のダメージを受けた！<br>`;
        hero.hp -= damageToHero;

    // 勇者へのエフェクト（不正解時）
    if (!wrapper.classList.contains("hit-effect")) {
        wrapper.classList.add("hit-effect");
        setTimeout(() => wrapper.classList.remove("hit-effect"), 500);
    }
        // 不正解音を再生
        incorrectSound.currentTime = 0;
        incorrectSound.play();
    }

    totalQuestions++;
    updateHPLabels();
    checkGameOver();
}

function updateBattleLog(newContent, clear = false) {
    const battleLog = document.getElementById("battleLog");
    if (!battleLog) return;

    // クリアオプションが有効なら内容を初期化
    if (clear) {
        battleLog.innerHTML = "";
    }

    // 改行の代わりにスペースを挿入
    const formattedContent = `${newContent} &nbsp; &nbsp; `;
    battleLog.innerHTML += formattedContent;

    // MathJaxでLaTeXを再レンダリング
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch(err => console.error("MathJax rendering error:", err));
    }
}

// グローバルスコープに登録
window.updateBattleLog = updateBattleLog;

function generateProblemAndDisplay() {
    const problem = generateProblem(); // 問題を生成
    correctAnswer = problem.correctAnswer;

    // 問題をバトルログに表示（LaTeX形式）
    updateBattleLog(problem.question);

    // 選択肢を表示
    const answersDiv = document.getElementById("answers");
    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexWrap = 'wrap';
    optionsContainer.style.justifyContent = 'center';
    answersDiv.innerHTML = ''; // 古い選択肢をクリア

    problem.options.forEach(answer => {
        const button = document.createElement("button");
        button.style.margin = '5px';

        // LaTeX形式の選択肢をHTMLとして挿入
        button.innerHTML = `\\(${answer}\\)`;
        button.onclick = () => checkAnswer(answer);
        optionsContainer.appendChild(button);
    });

    answersDiv.appendChild(optionsContainer);

    // MathJaxで選択肢を再レンダリング
    MathJax.typeset();
}

function generateDrawProblemAndDisplay() {
    const problem = generateDrawProblem(); // 問題を生成
    correctAnswer = problem.correctAnswer;

    // 問題をバトルログに表示（LaTeX形式）
    const battleLog = document.getElementById('battleLog');
    battleLog.innerHTML = problem.question;

    // 選択肢を表示する領域をクリア
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = ''; // 古い選択肢をクリア

    // 選択肢のグラフを描画
    problem.options.forEach((option, index) => {
        // キャンバスを作成
        const canvas = document.createElement('canvas');
        canvas.id = `graphOption${index}`;
        canvas.width = 90;
        canvas.height = 200;

        // ボタンで囲む
        const button = document.createElement('button');
        button.style.margin = '1px';
        button.appendChild(canvas);
        button.onclick = () => checkAnswer(option.equation);

        // キャンバスを選択肢に追加
        answersDiv.appendChild(button);

        // グラフを描画
        drawGraph(canvas.id, option.graph, option.equation.replace('y=', '').replace('x^2', ''));
    });

    // MathJax で問題を再描画
    MathJax.typeset();
}

function drawGraph(canvasId, chartConfig) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, chartConfig);
}



    // HPラベル更新
    function updateHPLabels() {
        heroHPLabel.textContent = `HP: ${Math.max(hero.hp, 0)}`; // 0以下にならないように修正
        monsterHPLabel.textContent = `HP: ${Math.max(monster.hp, 0)}`; // 0以下にならないように修正
    }

    function checkGameOver() {
        if (hero.hp <= 0) {
            // 勇者が負けた
            battleLog.innerHTML += `${hero.name} は ${monster.name} にやられてしまった！<br>`;
            disableButtons();
            updateHPLabels();
            stopAllBGM();
            showResult(false);
        } else if (monster.hp <= 0) {
            // 勇者が勝利
            battleLog.innerHTML += `${hero.name} は ${monster.name} を倒した！<br>`;
            
            // モンスター画像をフェードアウト
            const monsterImage = document.getElementById("monsterImage");
            monsterImage.classList.add("fade-out");
            setTimeout(() => {
                monsterImage.style.visibility = "hidden";
            }, 1000);
    
            disableButtons();
            updateHPLabels();
            showResult(true);
        } else {
            if (typeof generateDrawProblem === 'function') {
                // generateDrawProblemがあれば、グラフ問題表示用関数を呼ぶ
                generateDrawProblemAndDisplay();
            } else if (typeof generateProblem === 'function') {
                // 通常のgenerateProblemがあれば、通常問題表示用関数を呼ぶ
                generateProblemAndDisplay();
            } else {
                console.error("No valid problem generation function found.");
            }
        }
    }
    
    
    
    
  // 正解音を再生
function playCorrectSound() {
    const correctSound = document.getElementById("correctSound");
    if (correctSound) {
        correctSound.pause(); // 再生前に一時停止して安全に再生
        correctSound.currentTime = 0; // 再生位置を先頭に戻す
        correctSound.play().catch(err => console.error("正解音の再生に失敗しました:", err));
    }
}

// 不正解音を再生
function playIncorrectSound() {
    const incorrectSound = document.getElementById("incorrectSound");
    if (incorrectSound) {
        incorrectSound.pause(); // 再生前に一時停止して安全に再生
        incorrectSound.currentTime = 0; // 再生位置を先頭に戻す
        incorrectSound.play().catch(err => console.error("不正解音の再生に失敗しました:", err));
    }
}


function showResult(isVictory) {
    const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(2) : '0.00';

    // 勝利した場合のみ経験値を加算
    let monsterExperience = 0;
    if (isVictory) {
        monsterExperience = monster.experience || 0;
        heroAbilities[selectedFieldName] = (heroAbilities[selectedFieldName] || 0) + monsterExperience;

        // heroAbilitiesを保存
        localStorage.setItem('heroAbilities', JSON.stringify(heroAbilities));
        console.log(`${monsterExperience} の経験値を所得！`);

        // 勝利フラグを設定
        localStorage.setItem('lastBattleResult', 'victory');

        stopAllBGM(); // BGMを停止
        // 勝利時の正解音を再生
        playCorrectSound();

        // 正解音再生後に勝利BGMを再生
        const correctSound = document.getElementById("correctSound");
        const delay = correctSound && !isNaN(correctSound.duration) ? correctSound.duration * 700 : 500; // 再生時間に基づく遅延
        setTimeout(() => {
            playBGM("endBGM");
        }, delay);
    } else {
        console.log("戦闘に敗北したため、経験値は加算されません。");

        // 敗北フラグを設定
        localStorage.setItem('lastBattleResult', 'defeat');

        // 敗北時の不正解音を再生
        playIncorrectSound();
    }

    // 累積解答数と正答数を更新
    const totalQuestionsSaved = parseInt(localStorage.getItem('totalQuestions')) || 0;
    const correctAnswersSaved = parseInt(localStorage.getItem('correctAnswers')) || 0;

    localStorage.setItem('totalQuestions', totalQuestionsSaved + totalQuestions);
    localStorage.setItem('correctAnswers', correctAnswersSaved + correctCount);

    // accuracy表示にmonsterExperienceを追記
    accuracyLabel.textContent = `問題数: ${totalQuestions} 正答率: ${accuracy}% ${isVictory ? `経験値: ${monsterExperience}` : '経験値なし'}`;

    // 戦闘後に正解数などをリセット
    correctCount = 0;
    totalQuestions = 0;

    returnButton.style.display = "inline-block";
    disableButtons();
}

    // ボタン無効化
    function disableButtons() {
        const buttons = answersDiv.getElementsByTagName("button");
        for (let button of buttons) {
            button.disabled = true;
        }
    }

    // BGM再生
    function playBGM(bgmId) {
        const bgmElements = document.querySelectorAll("audio");
        bgmElements.forEach((audio) => audio.pause()); // 全てのBGMを停止
        const bgm = document.getElementById(bgmId);
        if (bgm) {
            bgm.currentTime = 0; // 再生位置を先頭に戻す
            bgm.play();
        }
    }

    // すべてのBGMを停止する関数
    function stopAllBGM() {
        const bgmElements = document.querySelectorAll("audio");
        bgmElements.forEach((audio) => audio.pause()); // 全てのBGMを停止
    }


    // 戦闘開始
    function startBattle() {
        playBGM("battleBGM"); // 戦闘用BGM再生
    }

    // 初回ログ
    function isFirstRun() {
        const battleLog = document.getElementById("battleLog");
        if (!battleLog) {
            console.error("battleLog element not found.");
            return;
        }
        battleLog.innerHTML += `${monster.name} が現れた！<br>`;
    }
    
    // 英雄の能力値を表示
    heroAbilityLabel.textContent = `${selectedFieldName}: ${heroAbilityValue}`;

   document.addEventListener('DOMContentLoaded', () => {
    const screen = document.getElementById("screen");
    // 次の描画フレームで実行し、確実に初期表示後にフェード開始
    requestAnimationFrame(() => {
        screen.style.opacity = "0"; // 不透明度を0にしてフェードアウト開始
        screen.addEventListener('transitionend', () => {
            screen.style.display = "none"; // フェード終了後に非表示
        }, { once: true });
    });
});

    startBattle(); // 戦闘開始
    updateHPLabels();
    isFirstRun();
   // ここで、どの問題生成関数が定義されているかを確認
   if (typeof generateDrawProblem === 'function') {
    // generateDrawProblemがあれば、グラフ問題表示用関数を呼ぶ
    generateDrawProblemAndDisplay();
} else if (typeof generateProblem === 'function') {
    // 通常のgenerateProblemがあれば、通常問題表示用関数を呼ぶ
    generateProblemAndDisplay();
} else {
    console.error("No valid problem generation function found.");
}
}

// 外部スクリプトを動的に読み込む関数
// すでに上部で定義済み



loadProblemScript(problemScriptPath)
    .then(() => {
        console.log('Script loaded, initializing game...');
        // 外部スクリプト内の関数が定義されているか確認
        if (typeof generateProblem === 'function') {
            console.log('generateProblem function is defined');
        } else {
            console.error('generateProblem function is NOT defined');
        }

        if (typeof validateAnswer === 'function') {
            console.log('validateAnswer function is defined');
        } else {
            console.error('validateAnswer function is NOT defined');
        }

        initGame();               // ゲーム初期化
        // initGame()やgenerateProblemAndDisplay()後に直接呼び出す

const screen = document.getElementById("screen");
requestAnimationFrame(() => {
    screen.style.opacity = "0";
    screen.addEventListener('transitionend', () => {
        screen.style.display = "none";
    }, { once: true });
});
    })
    .catch(error => {
        console.error(`Script loading failed: ${error.message}`);
        alert(`問題生成ファイルの読み込みに失敗しました。エラー内容: ${error.message}`);
        window.location.href = "mainmenu.html";
    });
