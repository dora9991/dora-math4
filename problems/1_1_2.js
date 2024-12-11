function generateProblem() {
    let problem;
    let tryCount = 0;
    do {
        problem = tryGenerateProblem();
        tryCount++;
        if (tryCount > 10) {
            console.error('有効な問題を生成できませんでした。');
            return null; // 明確にnullを返す
        }
    } while (!problem);

    return problem;
}

function tryGenerateProblem() {
    const problemPatterns = [
        // Pattern 1: (3a + 1)(2b - 4)
        {
            term1: { coefficient: 3, variable: 'a', constant: 1 },
            term2: { coefficient: 2, variable: 'b', constant: -4 },
            questionTemplate: "次の式を計算するには、どうすればいいだろう？\\( (${TERM1})(${TERM2}) \\)"
        },
        // Pattern 2: (x - 5)(x - 6)
        {
            term1: { coefficient: 1, variable: 'x', constant: -5 },
            term2: { coefficient: 1, variable: 'x', constant: -6 },
            questionTemplate: "次の式を展開しよう。\\( (${TERM1})(${TERM2}) \\)"
        },
        // Pattern 3: (2a - b)(7a + 8b)
        {
            term1: { coefficient: 2, variable: 'a', constant: -1 },
            term2: { coefficient: 7, variable: 'a', constant: 8, additionalVariable: 'b' },
            questionTemplate: "次の式を展開しよう。\\( (${TERM1})(${TERM2}) \\)"
        },
        // Pattern 4: (4x - y)(2x + 3y + 5)
        {
            term1: { coefficient: 4, variable: 'x', constant: -1, additionalVariable: 'y' },
            term2: { coefficient: 2, variable: 'x', constant: 5, additionalVariable: '3y' },
            questionTemplate: "次の式を計算するには、どうすればいいだろう？\\( (${TERM1})(${TERM2}) \\)"
        }
    ];

    const selectedPattern = problemPatterns[Math.floor(Math.random() * problemPatterns.length)];

    // フォーマットする
    const question = selectedPattern.questionTemplate
        .replace('${TERM1}', formatExpression(selectedPattern.term1))
        .replace('${TERM2}', formatExpression(selectedPattern.term2));

    // 正解を計算
    const expandedTerms = expandExpression(selectedPattern.term1, selectedPattern.term2);
    const correctAnswer = simplifyToStandardForm(expandedTerms);

    // 選択肢を生成
    const options = generateOptions(correctAnswer, selectedPattern);

    if (!options) {
        console.error("選択肢を生成できませんでした。");
        return null;
    }

    return {
        question,
        correctAnswer,
        options
    };
}

function formatExpression(term) {
    const coeffStr = term.coefficient === 1 ? '' : term.coefficient === -1 ? '-' : term.coefficient.toString();
    const variableStr = term.variable ? `${term.variable}` : '';
    const constantStr = term.constant ? (term.constant > 0 ? `+${term.constant}` : `${term.constant}`) : '';
    const additionalVarStr = term.additionalVariable ? `+${term.additionalVariable}` : '';

    return `${coeffStr}${variableStr}${constantStr}${additionalVarStr}`;
}

function expandExpression(term1, term2) {
    const results = [];

    const coefficients = [
        { c1: term1.coefficient, c2: term2.coefficient, v1: term1.variable, v2: term2.variable },
        { c1: term1.coefficient, c2: term2.constant, v1: term1.variable, v2: '' },
        { c1: term1.constant, c2: term2.coefficient, v1: '', v2: term2.variable },
        { c1: term1.constant, c2: term2.constant, v1: '', v2: '' }
    ];

    coefficients.forEach(({ c1, c2, v1, v2 }) => {
        const coefficient = c1 * c2;
        if (coefficient !== 0) {
            const term = { coefficient, variable: mergeVariables(v1, v2) };
            results.push(term);
        }
    });

    return results;
}

function mergeVariables(v1, v2) {
    if (!v1) return v2;
    if (!v2) return v1;
    if (v1 === v2) return `${v1}^{2}`;
    return `${v1}${v2}`;
}

function simplifyToStandardForm(terms) {
    const termMap = {};

    terms.forEach(term => {
        const key = term.variable || 'constant';
        termMap[key] = (termMap[key] || 0) + term.coefficient;
    });

    const result = [];
    for (const [key, value] of Object.entries(termMap)) {
        if (value === 0) continue;
        const formattedCoeff = value === 1 && key !== 'constant' ? '' : value === -1 && key !== 'constant' ? '-' : value;
        result.push(`${formattedCoeff}${key === 'constant' ? '' : key}`);
    }

    return result.join(' + ').replace(/\+\s-/g, '- ').trim();
}

function generateOptions(correctAnswer, pattern) {
    const options = [correctAnswer];
    const containsY = correctAnswer.includes('y');

    let attempts = 0;

    while (options.length < 4 && attempts < 20) {
        attempts++;

        const coeffs = correctAnswer.match(/-?\d+/g);
        if (!coeffs) continue;

        const newCoeffs = coeffs.map(c => parseInt(c, 10) + Math.floor(Math.random() * 5) - 2);
        const terms = pattern.term1.additionalVariable || pattern.term2.additionalVariable ? ['x^{2}', 'xy', 'y^{2}', 'constant'] : ['x^{2}', 'x', 'constant'];

        const newOption = simplifyToStandardForm(
            terms.map((term, index) => ({
                coefficient: newCoeffs[index] || 0,
                variable: term === 'constant' ? '' : term
            }))
        );

        if (!options.includes(newOption) && newOption !== correctAnswer) options.push(newOption);
    }

    return options.length === 4 ? options.sort(() => Math.random() - 0.5) : null;
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
