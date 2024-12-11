function generateParallelLineProblem() {
    let problem;
    let tryCount = 0;
    do {
        problem = tryGenerateParallelLineProblem();
        tryCount++;
        if (tryCount > 10) {
            console.error("有効な問題を生成できませんでした。");
            break;
        }
    } while (!problem);

    return problem;
}

function tryGenerateParallelLineProblem() {
    // ランダムな長さを生成
    const knownSegment1 = Math.floor(Math.random() * 10) + 5; // 5〜15
    const knownSegment2 = Math.floor(Math.random() * 20) + 10; // 10〜30
    const ratio1 = Math.floor(Math.random() * 3) + 2; // 比率1: 2〜4
    const ratio2 = Math.floor(Math.random() * 3) + 2; // 比率2: 2〜4

    // 未知の長さ (x) を計算
    const x = Math.round((knownSegment1 * ratio2) / ratio1);

    // 問題文
    const question = `次の図で、平行線と比の性質を使って x の長さを求めなさい。`;

    // 選択肢を生成
    const options = generateOptions(x);

    return {
        question,
        correctAnswer: x,
        options: options,
        figureData: {
            knownSegment1,
            knownSegment2,
            ratio1,
            ratio2,
            x,
        },
    };
}

function generateOptions(correctAnswer) {
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);

    for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push(correctAnswer);
        } else {
            let wrongAnswer;
            do {
                wrongAnswer = Math.floor(correctAnswer * (Math.random() * 0.8 + 0.6)); // 誤差: ±20〜40%
            } while (options.includes(wrongAnswer) || wrongAnswer === correctAnswer);
            options.push(wrongAnswer);
        }
    }

    return shuffleArray(options);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function drawParallelLineFigure(canvasId, figureData) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const { knownSegment1, knownSegment2, ratio1, ratio2, x } = figureData;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 平行線
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(350, 50); // l
    ctx.moveTo(50, 150);
    ctx.lineTo(350, 150); // m
    ctx.moveTo(50, 250);
    ctx.lineTo(350, 250); // n
    ctx.stroke();

    // 斜線
    ctx.beginPath();
    ctx.moveTo(100, 50);
    ctx.lineTo(300, 250);
    ctx.strokeStyle = "blue";
    ctx.stroke();

    // ラベル付きセグメント
    ctx.fillStyle = "black";
    ctx.fillText(`${knownSegment1}`, 80, 100); // 上の長さ
    ctx.fillText(`${knownSegment2}`, 270, 200); // 下の長さ
    ctx.fillText("x", 170, 140); // 未知の部分
    ctx.fillText(`比: ${ratio1}:${ratio2}`, 50, 30);
}

function generateParallelLineProblemAndDisplay() {
    const problem = generateParallelLineProblem();
    if (!problem) {
        console.error("問題生成に失敗しました。");
        return;
    }

    correctAnswer = problem.correctAnswer;

    // 問題を表示
    const battleLog = document.getElementById("battleLog");
    battleLog.textContent = problem.question;

    // 図形を描画
    const figureCanvas = document.createElement("canvas");
    figureCanvas.id = "figureCanvas";
    figureCanvas.width = 400;
    figureCanvas.height = 300;
    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = ""; // 既存の選択肢をクリア
    answersDiv.appendChild(figureCanvas);
    drawParallelLineFigure(figureCanvas.id, problem.figureData);

    // 選択肢を描画
    problem.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.style.margin = "5px";
        button.textContent = `${option} cm`;
        button.onclick = () => checkAnswer(option);
        answersDiv.appendChild(button);
    });
}

function checkAnswer(selectedAnswer) {
    if (selectedAnswer === correctAnswer) {
        alert("正解です！");
    } else {
        alert("不正解です。");
    }
}
