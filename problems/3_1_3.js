// 問題生成関数
function generateProblem() {
    let problem;
    let tryCount = 0;
    do {
        problem = generateQuadraticFormulaProblem();
        tryCount++;
        if (tryCount > 10) {
            console.error('有効な問題を生成できませんでした。');
            break;
        }
    } while (!problem);

    return problem;
}

// 解の公式を使った二次方程式を生成
function generateQuadraticFormulaProblem() {
    const coefficientsA = [2, 3]; // a の候補
    const coefficientsB = [-7, -5, 5, 7]; // b の候補 (整数部分が 0 にならないように調整)
    const terms = [1, 2, 3]; // c の候補 (ルートの中が平方数でない条件を満たす)

    const a = coefficientsA[Math.floor(Math.random() * coefficientsA.length)];
    const b = coefficientsB[Math.floor(Math.random() * coefficientsB.length)];
    const c = terms[Math.floor(Math.random() * terms.length)];

    // 判別式 b^2 - 4ac の中身を計算
    const discriminant = b * b - 4 * a * c;

    // 条件: 判別式が平方数でない、かつ整数部分が0にならない問題のみ採用
    if (discriminant <= 0 || Number.isInteger(Math.sqrt(discriminant)) || b === 0) {
        return null;
    }

    const question = `次の二次方程式を解きましょう: \\( ${a}x^2 + ${b}x + ${c} = 0 \\)`;
    const solutions = solveUsingQuadraticFormula(a, b, discriminant);

    const options = generateOptionsForQuadraticFormula(solutions, a, b, discriminant);
    if (!options) return null; // 選択肢生成に失敗した場合は null を返す

    return {
        question,
        correctAnswer: solutions.join(', '),
        options
    };
}

// 解の公式を使って二次方程式を解く
function solveUsingQuadraticFormula(a, b, discriminant) {
    const numerator1 = -b;
    const denominator = 2 * a;
    const rootPart = `\\sqrt{${discriminant}}`;
    return [
        `\\frac{${numerator1}+${rootPart}}{${denominator}}`,
        `\\frac{${numerator1}-${rootPart}}{${denominator}}`
    ];
}

// 誤答を含む選択肢を生成
function generateOptionsForQuadraticFormula(correctSolutions, a, b, discriminant) {
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);

    for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push(correctSolutions.join(', '));
        } else {
            let wrongAnswer;
            do {
                // 奇数で平方数でない判別式を生成
                let randomDiscriminant;
                do {
                    randomDiscriminant = discriminant + (Math.floor(Math.random() * 10) * 2); // 奇数
                } while (
                    randomDiscriminant <= 0 || // 負数や0を除外
                    Number.isInteger(Math.sqrt(randomDiscriminant)) // 平方数を除外
                );

                const randomNumerator = -b + Math.floor(Math.random() * 5) - 2; // 分子をランダムに調整
                const denominator = 2 * a;
                const rootPart = `\\sqrt{${randomDiscriminant}}`;
                wrongAnswer = [
                    `\\frac{${randomNumerator}+${rootPart}}{${denominator}}`,
                    `\\frac{${randomNumerator}-${rootPart}}{${denominator}}`
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
