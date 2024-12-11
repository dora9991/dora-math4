function generateProblem() {
    let problem;
    let tryCount = 0;
    do {
        problem = tryGenerateProblem();
        tryCount++;
        // 無限ループ回避（10回試してダメなら諦め）
        if (tryCount > 10) {
            console.error('有効な問題を生成できませんでした。');
            break;
        }
    } while (!problem);

    return problem;
}

function tryGenerateProblem() {
    const functions = [
        { equation: (x) => 2 * x - 1, display: "y=2x-1" },
        { equation: (x) => 2 / x, display: "y=2/x" },
        { equation: (x) => 2 * x * x, display: "y=2x^2" },
        { equation: (x) => x * x, display: "y=x^2" },
        { equation: (x) => 3 * x + 2, display: "y=3x+2" }
    ];

    // ランダムなxの範囲を生成
    const startX = Math.floor(Math.random() * 3) + 1; // 1〜3
    const endX = startX + 1; // xが1増加

    // 正解となる関数をランダムに選択
    const correctIndex = Math.floor(Math.random() * functions.length);
    const correctFunction = functions[correctIndex];
    const correctRate = calculateChangeRate(correctFunction.equation, startX, endX);

    // 質問文生成
    const question = `xの値が${startX}から${endX}まで増加するときの変化の割合が${correctRate}になるものは次のうちどれだろうか？`;

    // 選択肢生成
    const options = generateOptions(functions, correctIndex);

    if (!options) return null;

    return {
        question,
        correctAnswer: correctFunction.display,
        options: options.map((opt) => opt.display),
    };
}

function calculateChangeRate(func, startX, endX) {
    const yStart = func(startX);
    const yEnd = func(endX);
    return (yEnd - yStart) / (endX - startX);
}

function generateOptions(functions, correctIndex) {
    const options = [];
    const usedIndices = new Set();

    // 正解を追加
    options.push(functions[correctIndex]);
    usedIndices.add(correctIndex);

    // その他の選択肢を追加
    while (options.length < 4) {
        const randomIndex = Math.floor(Math.random() * functions.length);
        if (!usedIndices.has(randomIndex)) {
            options.push(functions[randomIndex]);
            usedIndices.add(randomIndex);
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

function validateAnswer(selectedAnswer, correctAnswer) {
    return selectedAnswer === correctAnswer;
}

// 使用例
const problem = generateProblem();
if (problem) {
    console.log('Question:', problem.question);
    console.log('Options:', problem.options);
    console.log('Correct Answer:', problem.correctAnswer);
}
