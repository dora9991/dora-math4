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
        generateAddSubtractSquareRootProblem,
        generateMixedSquareRootProblem
    ];

    const selectedPattern = problemPatterns[Math.floor(Math.random() * problemPatterns.length)];
    return selectedPattern();
}

// √の加減算問題を生成
function generateAddSubtractSquareRootProblem() {
    const coefficients = [1, 2, 3, 4, 5];
    const radicands = [8, 18, 20, 32, 50, 72, 98, 128, 200];

    // ランダムに選択
    const coeff1 = coefficients[Math.floor(Math.random() * coefficients.length)];
    const coeff2 = coefficients[Math.floor(Math.random() * coefficients.length)];
    const coeff3 = coefficients[Math.floor(Math.random() * coefficients.length)];
    const rad1 = radicands[Math.floor(Math.random() * radicands.length)];
    const rad2 = radicands[Math.floor(Math.random() * radicands.length)];
    const rad3 = radicands[Math.floor(Math.random() * radicands.length)];

    const question = `次の式を計算しましょう: \\( ${formatTerm(coeff1, rad1)} + ${formatTerm(coeff2, rad2)} - ${formatTerm(coeff3, rad3)} \\)`;
    const correctAnswer = simplifyExpression([
        { coeff: coeff1, radicand: rad1 },
        { coeff: coeff2, radicand: rad2 },
        { coeff: -coeff3, radicand: rad3 }
    ]);

    if (!correctAnswer) return null;

    const options = generateOptionsForExpression(correctAnswer, radicands);
    if (!options) return null;

    return {
        question,
        correctAnswer,
        options
    };
}

// √を含む混合計算問題を生成
function generateMixedSquareRootProblem() {
    const coefficients = [1, 2, 3, 4, 5];
    const radicands = [8, 18, 20, 32, 50, 72, 98, 128, 200];

    // ランダムに選択
    const coeff1 = coefficients[Math.floor(Math.random() * coefficients.length)];
    const coeff2 = coefficients[Math.floor(Math.random() * coefficients.length)];
    const rad1 = radicands[Math.floor(Math.random() * radicands.length)];
    const rad2 = radicands[Math.floor(Math.random() * radicands.length)];

    const question = `次の式を計算しましょう: \\( ${formatTerm(coeff1, rad1)} - \\frac{${coeff2}}{\\sqrt{${rad2}}} \\)`;
    const correctAnswer = simplifyExpression([
        { coeff: coeff1, radicand: rad1 },
        { coeff: -coeff2, radicand: rad2 }
    ]);

    if (!correctAnswer) return null;

    const options = generateOptionsForExpression(correctAnswer, radicands);
    if (!options) return null;

    return {
        question,
        correctAnswer,
        options
    };
}

// ルート項を簡約
function simplifySquareRoot(coeff, radicand) {
    let factor = Math.floor(Math.sqrt(radicand));
    while (factor > 1) {
        if (radicand % (factor * factor) === 0) {
            const outside = coeff * factor;
            const inside = radicand / (factor * factor);
            return { coeff: outside, radicand: inside };
        }
        factor--;
    }
    return { coeff, radicand };
}

// 式を簡約
function simplifyExpression(terms) {
    const simplified = {};

    for (let { coeff, radicand } of terms) {
        const simplifiedTerm = simplifySquareRoot(coeff, radicand);
        radicand = simplifiedTerm.radicand;
        coeff = simplifiedTerm.coeff;

        if (radicand === 1) continue; // √1を排除

        if (!(radicand in simplified)) {
            simplified[radicand] = 0;
        }
        simplified[radicand] += coeff;
    }

    const result = [];
    for (const radicand in simplified) {
        const coeff = simplified[radicand];
        if (coeff !== 0) {
            result.push(formatTerm(coeff, radicand));
        }
    }

    return result.length > 0 ? result.join(' + ').replace(/\+ -/g, '- ') : '0';
}

// 係数とルートをフォーマット
function formatTerm(coeff, radicand) {
    if (coeff === 0) return '0';
    if (coeff === 1) return `\\sqrt{${radicand}}`;
    if (coeff === -1) return `-\\sqrt{${radicand}}`;
    return `${coeff}\\sqrt{${radicand}}`;
}

// 選択肢生成
function generateOptionsForExpression(correctAnswer, radicands) {
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

                const randomRadicand = radicands[Math.floor(Math.random() * radicands.length)];
                const randomFactor = 1 + Math.floor(Math.random() * 5);

                // 同じ√の中身を持つが異なる係数の選択肢を生成
                wrongAnswer = simplifyExpression([
                    { coeff: randomFactor, radicand: randomRadicand }
                ]);

            } while (
                wrongAnswer === correctAnswer ||
                options.includes(wrongAnswer)
            );
            options.push(wrongAnswer);
        }
    }
    return options;
}

// 分数表記（小数を分数に変換）
function toFraction(decimal) {
    const tolerance = 1.0e-6;
    let numerator = 1;
    let denominator = 1;

    while (Math.abs(numerator / denominator - decimal) > tolerance) {
        if (numerator / denominator < decimal) {
            numerator++;
        } else {
            denominator++;
        }
    }

    return `\\frac{${numerator}}{${denominator}}`;
}

// 解答検証
function validateAnswer(selectedAnswer, correctAnswer) {
    return selectedAnswer === correctAnswer;
}

// グローバルスコープに登録
window.generateProblem = generateProblem;
window.validateAnswer = validateAnswer;
