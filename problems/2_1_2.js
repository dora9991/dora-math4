// 問題生成関数
function generateProblem() {
    let problem;
    let tryCount = 0;
    do {
        problem = tryGenerateProblem();
        tryCount++;
        if (tryCount > 10) {
            console.error('有効な問題を生成できませんでした。');
            break;
        }
    } while (!problem);

    return problem;
}

// 問題生成パターンをランダムに選択
function tryGenerateProblem() {
    const problemPatterns = [
        generateSimplifySquareRootProblem,
        generateMultiplySquareRootProblem
    ];

    const selectedPattern = problemPatterns[Math.floor(Math.random() * problemPatterns.length)];
    return selectedPattern();
}

// √の簡約問題を生成
function generateSimplifySquareRootProblem() {
    const values = [
        18, 50, 72, 98, 200, 2 / 49, 12, 28, 45, 63,
        80, 108, 128, 180, 245, 392, 512, 20, 32, 128
    ];
    const selectedValue = values[Math.floor(Math.random() * values.length)];

    const question = `次の数の√を簡単な形にしましょう: \\( \\sqrt{${formatAsFraction(selectedValue)}} \\)`;

    const correctAnswer = simplifySquareRoot(selectedValue);
    if (!correctAnswer) return null;

    const options = generateOptionsForSquareRoot(correctAnswer);
    if (!options) return null;

    return {
        question,
        correctAnswer,
        options
    };
}

// √の乗算問題を生成
function generateMultiplySquareRootProblem() {
    const pairs = [
        [8, 32], [12, 18], [50, 72], [28, 45], [63, 80],
        [18, 50], [72, 98], [200, 2 / 49], [12, 28], [128, 180],
        [245, 392], [512, 20], [32, 128], [98, 72], [18, 245],
        [108, 200], [45, 28], [63, 32], [128, 50], [392, 72]
    ];

    const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
    const question = `次の式を計算しましょう: \\( \\sqrt{${a}} \\times \\sqrt{${b}} \\)`;

    const correctAnswer = simplifySquareRoot(a * b);
    const options = generateOptionsForSquareRoot(correctAnswer);
    if (!options) return null;

    return {
        question,
        correctAnswer,
        options
    };
}

// √の簡約
function simplifySquareRoot(value) {
    const sqrtValue = Math.sqrt(value);
    if (Number.isInteger(sqrtValue)) return sqrtValue.toString();

    let factor = Math.floor(Math.sqrt(value));
    while (factor > 1) {
        if (value % (factor * factor) === 0) {
            const outside = factor;
            const inside = value / (factor * factor);
            return formatTerm(outside, inside);
        }
        factor--;
    }

    return `\\sqrt{${value}}`;
}

// √の分数を処理
function formatAsFraction(value) {
    if (Number.isInteger(value)) return value.toString();
    const fraction = value.toString().split('/');
    if (fraction.length === 2) {
        return `\\frac{${fraction[0]}}{${fraction[1]}}`;
    }
    return value.toString();
}

// 係数が1の場合は省略
function formatTerm(outside, inside) {
    if (outside === 1) return `\\sqrt{${inside}}`;
    return `${outside}\\sqrt{${inside}}`;
}

// 選択肢生成
function generateOptionsForSquareRoot(correctAnswer) {
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);

    let attempts = 0;
    for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push(correctAnswer);
        } else {
            let wrongAnswer;
            do {
                attempts++;
                if (attempts > 20) return null;

                const randomFactor = 1 + Math.floor(Math.random() * 5);
                const randomInside = 1 + Math.floor(Math.random() * 50);
                wrongAnswer = formatTerm(randomFactor, randomInside);

            } while (
                wrongAnswer === correctAnswer ||
                options.includes(wrongAnswer)
            );
            options.push(wrongAnswer);
        }
    }
    return options;
}

// 解答検証
function validateAnswer(selectedAnswer, correctAnswer) {
    return selectedAnswer === correctAnswer;
}

// グローバルスコープに登録
window.generateProblem = generateProblem;
window.validateAnswer = validateAnswer;
