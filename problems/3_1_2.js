// 問題生成関数
function generateProblem() {
    let problem;
    let tryCount = 0;
    do {
        problem = generateExpandedQuadraticProblem();
        tryCount++;
        if (tryCount > 10) {
            console.error('有効な問題を生成できませんでした。');
            break;
        }
    } while (!problem);

    return problem;
}

// 展開された二次方程式を生成 (例: (x+3)^2 - 10 = 0)
function generateExpandedQuadraticProblem() {
    const constants = [1, 2, 3, 4, 5, 6, 7, 8]; // k の候補
    const terms = [2, 3, 5, 6, 7, 8, 10, 12, 13, 15, 17, 18, 20]; // c の候補

    const k = constants[Math.floor(Math.random() * constants.length)];
    const c = terms[Math.floor(Math.random() * terms.length)];

    // √の中身が1になる問題を排除
    if (c === 1) return null;

    const question = `次の二次方程式を解きましょう: \\( (x + ${k})^2 - ${c} = 0 \\)`;
    const simplifiedRoot = simplifySquareRoot(c);
    const solutions = solveExpandedQuadraticProblem(k, simplifiedRoot);

    const options = generateOptionsForSquareRootSolutions(solutions, simplifiedRoot);
    if (!options) return null; // 選択肢生成に失敗した場合は null を返す

    return {
        question,
        correctAnswer: solutions.join(', '),
        options
    };
}

// 二次方程式を解く (例: (x + 3)^2 - 10 = 0)
function solveExpandedQuadraticProblem(k, simplifiedRoot) {
    return [`-${k} + ${simplifiedRoot}`, `-${k} - ${simplifiedRoot}`];
}

// ルートを簡約する関数 (例: √8 -> 2√2)
function simplifySquareRoot(value) {
    const integerRoot = Math.floor(Math.sqrt(value));
    if (integerRoot * integerRoot === value) {
        return integerRoot.toString(); // 完全平方数の場合
    }

    let factor = integerRoot;
    while (factor > 1) {
        if (value % (factor * factor) === 0) {
            const outside = factor;
            const inside = value / (factor * factor);
            return `${outside}\\sqrt{${inside}}`;
        }
        factor--;
    }
    return `\\sqrt{${value}}`; // 簡約できない場合
}

// 誤答を含む選択肢を生成
function generateOptionsForSquareRootSolutions(correctSolutions, simplifiedRoot) {
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);

    for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push(correctSolutions.join(', '));
        } else {
            let wrongAnswer;
            do {
                const randomCoefficient = Math.floor(Math.random() * 5) + 2; // √の前の係数
                wrongAnswer = [
                    `-${randomCoefficient} + ${simplifiedRoot}`,
                    `-${randomCoefficient} - ${simplifiedRoot}`
                ].join(', ');
            } while (
                wrongAnswer === correctSolutions.join(', ') || // 正解と同じでないか確認
                options.includes(wrongAnswer) // 重複を防ぐ
            );
            options.push(wrongAnswer);
        }
    }
    return options;
}

// グローバルスコープに登録
window.generateProblem = generateProblem;
window.validateAnswer = (selectedAnswer, correctAnswer) =>
    selectedAnswer === correctAnswer;
