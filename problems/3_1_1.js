// 問題生成関数
function generateProblem() {
    let problem;
    let tryCount = 0;
    do {
        problem = generateIntegerSolutionQuadratic();
        tryCount++;
        if (tryCount > 10) {
            console.error('有効な問題を生成できませんでした。');
            break;
        }
    } while (!problem);

    return problem;
}

// 答えが整数になる問題を生成
function generateIntegerSolutionQuadratic() {
    const coefficients = [2, 3, 4, 5, 6, 7, 8]; // a の候補
    const terms = [4, 9, 16, 25, 36, 49, 64, 81, 100]; // c の候補

    let a, c, sqrtC;
    do {
        a = coefficients[Math.floor(Math.random() * coefficients.length)];
        c = terms[Math.floor(Math.random() * terms.length)];
        sqrtC = Math.sqrt(c / a); // √(c / a)
    } while (!Number.isInteger(sqrtC)); // √(c / a) が整数でない場合は再生成

    const question = `次の二次方程式を解きましょう: \\( ${a}x^2 - ${c} = 0 \\)`;
    const solutions = solveIntegerSolutionQuadratic(a, c);

    const options = generateOptionsForIntegerSolutions(solutions);
    if (!options) return null; // 選択肢生成に失敗した場合は null を返す

    return {
        question,
        correctAnswer: solutions.join(', '),
        options
    };
}

// 二次方程式を解く (答えが整数になる場合)
function solveIntegerSolutionQuadratic(a, c) {
    const sqrtC = Math.sqrt(c / a);
    return [`+${sqrtC}`, `-${sqrtC}`];
}

// 誤答を含む選択肢を生成
function generateOptionsForIntegerSolutions(correctSolutions) {
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);

    for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push(correctSolutions.join(', '));
        } else {
            let wrongAnswer;
            do {
                const randomValue = Math.floor(Math.random() * 15) + 1; // 1〜15のランダム整数
                wrongAnswer = `+${randomValue}, -${randomValue}`; // 絶対値が同じ誤答を生成
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
