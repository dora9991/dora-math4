// BGM再生関数
function playBGM(bgmId) {
    const bgm = document.getElementById(bgmId);
    if (bgm) {
        bgm.currentTime = 0;
        bgm.play();
    }
}

// ローカルストレージに保存または取得する関数
function initializeHeroAbilities() {
    const storedAbilities = localStorage.getItem('heroAbilities');
    if (storedAbilities) {
        return JSON.parse(storedAbilities); // 保存された値を取得
    } else {
        // 初期値を設定
        const initialAbilities = {
            計算: 1000,
            方程式: 1000,
            関数: 1000,
            図形: 1000,
            統計: 1000,
            総合: 1000
        };
        localStorage.setItem('heroAbilities', JSON.stringify(initialAbilities)); // 初期値を保存
        return initialAbilities;
    }
}

// 平均正答率を計算して表示
function displayAverageAccuracy() {
    // ローカルストレージから累積データを取得
    const totalQuestions = parseInt(localStorage.getItem('totalQuestions')) || 0;
    const correctAnswers = parseInt(localStorage.getItem('correctAnswers')) || 0;

    // 平均正答率を計算
    let averageAccuracy = 0;
    if (totalQuestions > 0) {
        averageAccuracy = ((correctAnswers / totalQuestions) * 100).toFixed(2);
    }

    // HTML内の要素に平均正答率を表示
    const accuracyDisplay = document.getElementById('averageAccuracy');
    if (accuracyDisplay) {
        accuracyDisplay.textContent = `平均正答率: ${averageAccuracy}%`;
    } else {
        console.error('平均正答率を表示する要素が見つかりません。');
    }
}

// heroAbilitiesを初期化または取得
let heroAbilities = initializeHeroAbilities();

// レーダーチャートの作成関数(変更なし)
function createRadarChart(heroAbilities) {
    const ctx = document.getElementById('radarChart').getContext('2d');

    const data = {
        labels: ['計算', '方程式', '関数', '図形', '統計', '総合'],
        datasets: [{
            label: '勇者の能力値',
            data: [
                heroAbilities.計算,
                heroAbilities.方程式,
                heroAbilities.関数,
                heroAbilities.図形,
                heroAbilities.統計,
                heroAbilities.総合
            ],
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 2,
            pointBackgroundColor: '#007BFF',
            pointBorderColor: '#FFF',
            pointBorderWidth: 2,
            pointRadius: 6
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                min: 800,
                max: 2000,
                ticks: {
                    stepSize: 200,
                    color: 'black',
                    font: { size: 14, family: 'Arial, sans-serif' }
                },
                grid: {
                    color: 'rgba(100, 100, 100, 0.5)',
                    lineWidth: 1.5
                },
                angleLines: {
                    color: 'rgba(100, 100, 100, 0.7)',
                    lineWidth: 1.5
                },
                pointLabels: {
                    font: { size: 16, family: 'Arial, sans-serif', weight: 'bold' },
                    color: 'black'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: 'black',
                    font: { size: 14, family: 'Arial, sans-serif' }
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                borderColor: '#FFF',
                borderWidth: 1
            }
        }
    };

    const radarChartContainer = document.querySelector('.radar-chart-container');
    radarChartContainer.style.backgroundColor = '#F6F6F6';
    radarChartContainer.style.borderRadius = '10px';
    radarChartContainer.style.padding = '20px';

    new Chart(ctx, {
        type: 'radar',
        data: data,
        options: options
    });
}

// レベル計算用の関数（修正）
function calculateLevelAndHP(heroAbilities, heroLevel, heroHP) {
    const baseAbilitySum = parseInt(localStorage.getItem('heroBaseAbilitySum')) || 6000;
    const currentAbilitySum =
        heroAbilities.計算 +
        heroAbilities.方程式 +
        heroAbilities.関数 +
        heroAbilities.図形 +
        heroAbilities.統計 +
        heroAbilities.総合;

    // 現在の経験値を取得（ローカルストレージから）
    let currentAbilityExp = parseInt(localStorage.getItem('currentAbilityExp')) || 0;

    // 前回の戦闘結果を確認
    const lastBattleResult = localStorage.getItem('lastBattleResult');

    // 勝利時には新たに増えた経験値を加算
    if (lastBattleResult === 'victory') {
        const gainedExp = currentAbilitySum - baseAbilitySum;
        currentAbilityExp += gainedExp;

        // 新たな基準値を保存
        localStorage.setItem('heroBaseAbilitySum', currentAbilitySum);
    }

    let experienceNeededForNextLevel = 25 + 5 * heroLevel;

    // レベルアップ判定
    while (currentAbilityExp >= experienceNeededForNextLevel) {
        currentAbilityExp -= experienceNeededForNextLevel;
        heroLevel++;
        heroHP += 8;
        experienceNeededForNextLevel = 25 + 5 * heroLevel;
    }

    // 次のレベルまでの残り経験値を計算
    const experienceRemaining = experienceNeededForNextLevel - currentAbilityExp;

    // 現在の経験値を保存（敗北時にも引き継ぐため）
    localStorage.setItem('currentAbilityExp', currentAbilityExp);

    return { heroLevel, heroHP, experienceRemaining };
}




// ページ読み込み後の処理
window.onload = function() {

// 単元ボタンと小単元ボタンのデータマッピング
const unitMapping = {
    '式の展開・因数分解': 1,
    '平方根': 2,
    '2次方程式': 3,
    '関数y=ax^2': 4,
    '図形と相似': 5,
    '円の性質': 6,
    '三平方の定理': 7,
    '標本調査': 8
};

const subunitMapping = {
    '多項式と単項式の乗除': 1,
    '平方根': 1,
    '2次方程式とその解': 1,
    '関数y=ax^2': 1,
    '相似な図形': 1,
    '円周角の定理': 1,
    '三平方の定理': 1,
    '標本調査': 1
};

    const difficultyMapping = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3
    };

    const unitToFieldMapping = {
        1: 1,
        2: 1,
        3: 2,
        4: 3,
        5: 4,
        6: 4,
        7: 4,
        8: 5,
        9: 6
    };

    // ローカルストレージからデータを取得
    let heroLevel = parseInt(localStorage.getItem("heroLevel")) || 1;
    let heroHP = parseInt(localStorage.getItem("heroHP")) || 200;

    // ここで最新のheroAbilitiesを再取得（戦闘後に更新されている可能性があるため）
    heroAbilities = JSON.parse(localStorage.getItem('heroAbilities')) || heroAbilities;

    // レベル、HP、必要経験値を再計算
    const { heroLevel: newLevel, heroHP: newHP, experienceRemaining } = calculateLevelAndHP(heroAbilities, heroLevel, heroHP);

    // 更新結果を保存
    localStorage.setItem("heroLevel", newLevel);
    localStorage.setItem("heroHP", newHP);

    // 表示を更新
    document.getElementById("heroLevel").textContent = newLevel;
    document.getElementById("heroHP").textContent = newHP;
    document.getElementById("experienceRemaining").textContent = experienceRemaining;

    // BGM再生処理
    document.body.addEventListener('click', function playOnInteraction() {
        playBGM("indexBGM");
        document.body.removeEventListener('click', playOnInteraction);
    });

    displayAverageAccuracy(); // 平均正答率を表示

    // 単元ボタンのイベントリスナーを設定
    const unitButtonsDiv = document.getElementById('unitButtons');
    const subunitButtonsDiv = document.getElementById('subunitButtons');
    const backButtonDiv = document.getElementById('backButtonDiv'); // 追加

    // 単元ボタンのイベントリスナー
    const unitButtons = document.querySelectorAll('.unit-button');
    unitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedUnit = this.getAttribute('data-unit');
            const unitNumber = unitMapping[selectedUnit]; // ナンバリングを取得
            const fieldNumber = unitToFieldMapping[unitNumber]; // 分野をマッピング

            // ローカルストレージに保存
            localStorage.setItem('selectedUnit', unitNumber); // 単元番号を保存
            localStorage.setItem('selectedField', fieldNumber); // 分野番号を保存

            console.log(`選択した単元: ${selectedUnit} (保存番号: ${unitNumber})`);
            console.log(`対応する分野: ${fieldNumber}`);

            // 単元ボタンを非表示
            unitButtonsDiv.style.display = 'none';

            // 小単元ボタンを表示
            displaySubunitButtons(selectedUnit);
        });
    });

   // 小単元ボタンの生成
    function displaySubunitButtons(selectedUnit) {
        subunitButtonsDiv.innerHTML = '';
        backButtonDiv.innerHTML = '';

        let subunits = [];

        // 小単元を単元に基づいて設定
        switch (selectedUnit) {
            case '式の展開・因数分解':
                subunits = ['多項式と単項式の乗除'];
                break;
            case '平方根':
                subunits = ['平方根'];
                break;
            case '2次方程式':
                subunits = ['2次方程式とその解'];
                break;
            case '関数y=ax^2':
                subunits = ['関数y=ax^2'];
                break;
            case '図形と相似':
                subunits = ['相似な図形'];
                break;
            case '円の性質':
                subunits = ['円周角の定理'];
                break;
            case '三平方の定理':
                subunits = ['三平方の定理'];
                break;
            case '標本調査':
                subunits = ['標本調査'];
                break;
            default:
                console.error(`不明な単元: ${selectedUnit}`);
                return;
        }

        subunits.forEach((subunit) => {
            const button = document.createElement('button');
            button.className = 'subunit-button';
            button.textContent = subunit;

            button.addEventListener('click', function () {
                const subunitNumber = subunitMapping[subunit];
                localStorage.setItem('selectedSubunit', subunitNumber);

                console.log(`選択した小単元: ${subunit} (番号: ${subunitNumber})`);
                window.location.href = 'sentou.html'; // 戦闘画面に移動
            });

            subunitButtonsDiv.appendChild(button);
        });


        // 戻るボタンを生成
        const backButton = document.createElement('button');
        backButton.textContent = '戻る';
        backButton.className = 'back-button';
        backButton.style.marginTop = '20px';
        backButton.addEventListener('click', function () {
            subunitButtonsDiv.style.display = 'none'; // 小単元ボタンを非表示
            backButtonDiv.style.display = 'none'; // 戻るボタンを非表示
            unitButtonsDiv.style.display = 'flex'; // 単元ボタンを再表示
        });
        backButtonDiv.appendChild(backButton);

        // 小単元ボタンと戻るボタンを表示
        subunitButtonsDiv.style.display = 'flex';
        backButtonDiv.style.display = 'flex';
    }

    // 難易度ボタンの設定
    const buttons = document.querySelectorAll('.difficulty-button');

    // ローカルストレージから選択された難易度を取得
    const savedDifficulty = localStorage.getItem('selectedDifficulty') || 1;

    // 保存されている難易度に基づいてボタンの初期状態を設定
    if (savedDifficulty) {
        buttons.forEach(button => {
            if (difficultyMapping[button.getAttribute('data-difficulty')] == savedDifficulty) {
                button.classList.add('active');
            }
        });
    }

    // ボタンのクリックイベントを設定
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // 他のボタンのアクティブ状態をリセット
            buttons.forEach(btn => btn.classList.remove('active'));

            // クリックされたボタンにアクティブ状態を設定
            this.classList.add('active');

            // 選択した難易度をナンバリングしてローカルストレージに保存
            const selectedDifficulty = this.getAttribute('data-difficulty');
            const difficultyNumber = difficultyMapping[selectedDifficulty];
            localStorage.setItem('selectedDifficulty', difficultyNumber);

            console.log(`選択した難易度: ${selectedDifficulty} (保存番号: ${difficultyNumber})`);
        });
    });

    // レーダーチャートを作成
    createRadarChart(heroAbilities);
}; // `window.onload` の終了位置

