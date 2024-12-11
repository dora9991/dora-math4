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
    const terms = [
        { coefficient: 1, variable: 'x', constant: -5 },
        { coefficient: 1, variable: 'x', constant: -6 },
        { coefficient: 2, variable: 'a', constant: -1 },
        { coefficient: -1, variable: 'b', constant: 0 },
        { coefficient: 7, variable: 'a', constant: 0 },
        { coefficient: 8, variable: 'b', constant: 0 }
    ];

    const term1 = terms[Math.floor(Math.random() * terms.length)];
    const term2 = terms[Math.floor(Math.random() * terms.length)];

    if (!term1 || !term2 || term1 === term2) return null;

    // 問題式を生成
    const expression1 = formatExpression(term1);
    const expression2 = formatExpression(term2);

    // 質問文生成
    const question = `次の式を展開しましょう。\\( (${expression1})(${expression2}) \\)`;

    console.log('Generated question:', question);

    return {
        question,
        correctAnswer: expandExpression(term1, term2)
    };
}

function formatExpression(term) {
    const coeffStr = term.coefficient === 1 ? '' : term.coefficient === -1 ? '-' : term.coefficient.toString();
    const variableStr = term.variable ? `${term.variable}` : '';
    const constantStr = term.constant ? (term.constant > 0 ? `+${term.constant}` : `${term.constant}`) : '';

    return `${coeffStr}${variableStr}${constantStr}`;
}

function expandExpression(term1, term2) {
    const expandedTerms = [];

    // 展開式を計算 (a + b)(c + d) = ac + ad + bc + bd
    const coefficients = [
        { c1: term1.coefficient, c2: term2.coefficient, v1: term1.variable, v2: term2.variable },
        { c1: term1.coefficient, c2: term2.constant, v1: term1.variable, v2: '' },
        { c1: term1.constant, c2: term2.coefficient, v1: '', v2: term2.variable },
        { c1: term1.constant, c2: term2.constant, v1: '', v2: '' }
    ];

    coefficients.forEach(({ c1, c2, v1, v2 }) => {
        const coefficient = c1 * c2;
        const variable = mergeVariables(v1, v2);
        if (coefficient !== 0) {
            expandedTerms.push(formatTerm({ coefficient, variable }));
        }
    });

    return expandedTerms.join(' + ').replace(/\+ -/g, '- ');
}

function mergeVariables(v1, v2) {
    if (!v1) return v2;
    if (!v2) return v1;
    if (v1 === v2) return `${v1}^{2}`;
    return `${v1}${v2}`;
}

function formatTerm({ coefficient, variable }) {
    const coeffStr = coefficient === 1 ? '' : coefficient === -1 ? '-' : coefficient.toString();
    return `${coeffStr}${variable}`;
}

function validateAnswer(selectedAnswer, correctAnswer) {
    return selectedAnswer === correctAnswer;
}

// 使用例
const problem = generateProblem();
if (problem) {
    console.log('Question:', problem.question);
    console.log('Correct Answer:', problem.correctAnswer);
}
