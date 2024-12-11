function generateProblem() {
    const numerators = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]; // 分母・分子を1～100の平方数に
    const denominators = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
    const numerator = numerators[Math.floor(Math.random() * numerators.length)];
    const denominator = denominators[Math.floor(Math.random() * denominators.length)];
    
    const question = `\\( \\sqrt{\\frac{${numerator}}{${denominator}}} \\) の値は何ですか？`; // LaTeX形式

    // 正解を整数または分数形式で表記
    const correctNumerator = Math.sqrt(numerator);
    const correctDenominator = Math.sqrt(denominator);
    const correctAnswer = formatToLatex(simplifyFraction(correctNumerator, correctDenominator));

    let options = [];
    const correctIndex = Math.floor(Math.random() * 4);

    for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push(correctAnswer);
        } else {
            let wrongAnswer;
            do {
                // 誤答も整数または分数形式で生成
                const wrongNumerator = Math.sqrt(numerators[Math.floor(Math.random() * numerators.length)]);
                const wrongDenominator = Math.sqrt(denominators[Math.floor(Math.random() * denominators.length)]);
                wrongAnswer = formatToLatex(simplifyFraction(wrongNumerator, wrongDenominator));
            } while (options.includes(wrongAnswer) || wrongAnswer === correctAnswer || wrongAnswer === '');
            options.push(wrongAnswer);
        }
    }

    return {
        question,
        correctAnswer,
        options
    };
}

function simplifyFraction(numerator, denominator) {
    if (denominator === 1) {
        // 分母が1の場合は整数で返す
        return `${Math.floor(numerator)}`;
    }
    if (numerator % denominator === 0) {
        // 分数が整数になる場合
        return `${Math.floor(numerator / denominator)}`;
    }
    return `${Math.floor(numerator)}/${Math.floor(denominator)}`; // 分数形式
}

function formatToLatex(value) {
    if (value.includes('/')) {
        const [numerator, denominator] = value.split('/');
        return `\\( \\frac{${numerator}}{${denominator}} \\)`; // 分数をLaTeX形式
    }
    return `\\( ${value} \\)`; // 整数をそのままLaTeX形式
}

function validateAnswer(selectedAnswer, correctAnswer) {
    return selectedAnswer === correctAnswer;
}

// 使用例
const problem = generateProblem();
if (problem) {
    console.log('Question:', problem.question);
    console.log('Correct Answer:', problem.correctAnswer);
    console.log('Options:', problem.options);
}
