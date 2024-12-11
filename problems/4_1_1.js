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
    // 問題のパターン定義
    const patterns = [
        {
            text: "yはxの2乗に比例し、x={x}のとき、y={y}である。このとき、yをxの式で表しなさい。",
            generate: () => {
                let k;
                do {
                    k = Math.floor(Math.random() * 9) - 4; // 比例定数（-4 ~ 4, 0除外）
                } while (k === 0); // 係数が0を避ける
                const x = Math.floor(Math.random() * 9) + 1; // xの値（1 ~ 9）
                const y = k * x * x; // yを計算
                const correctAnswer = formatEquation(k, "x^2");
                return {
                    question: `yはxの2乗に比例し、x=${x}のとき、y=${y}である。このとき、yをxの式で表しなさい。`,
                    correctAnswer: `y=${correctAnswer}`,
                };
            }
        }
    ];

    // ランダムなパターンを選択して問題を生成
    const pattern = patterns[0];
    const problem = pattern.generate();

    // 選択肢生成
    const options = generateOptions(problem.correctAnswer);
    if (!options) return null;

    return {
        question: problem.question,
        correctAnswer: problem.correctAnswer,
        options,
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
                let k;
                do {
                    k = Math.floor(Math.random() * 9) - 4; // -4 ~ 4 の範囲でランダム生成
                } while (k === 0); // 係数が0を避ける
                wrongAnswer = formatEquation(k, "x^2");
            } while (
                `y=${wrongAnswer}` === correctAnswer || // `y=`を含めて正誤判定
                options.includes(`y=${wrongAnswer}`)
            );
            options.push(`y=${wrongAnswer}`);
        }
    }
    return options;
}

function formatEquation(coefficient, term) {
    if (coefficient === 1) return `${term}`;
    if (coefficient === -1) return `-${term}`;
    return `${coefficient}${term}`;
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
