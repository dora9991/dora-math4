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
        // Pattern 1: (a + b)^2
        {
            type: 'square',
            a: { coefficient: randomInt(1, 10), variable: 'x' },
            b: { coefficient: randomInt(1, 10), variable: 'y' },
            operation: '+',
            questionTemplate: "次の式を展開しよう。\\( (${TERM})^{2} \\)",
            formula: expandSquare
        },
        // Pattern 2: (a - b)^2
        {
            type: 'square',
            a: { coefficient: randomInt(1, 10), variable: 'x' },
            b: { coefficient: randomInt(1, 10), variable: 'y' },
            operation: '-',
            questionTemplate: "次の式を展開しよう。\\( (${TERM})^{2} \\)",
            formula: expandSquare
        },
        // Pattern 3: (a + b)(a - b)
        {
            type: 'differenceOfSquares',
            a: { coefficient: randomInt(1, 10), variable: 'x' },
            b: { coefficient: randomInt(1, 10), variable: 'y' },
            questionTemplate: "次の式を展開しよう。\\( (${TERM1})(${TERM2}) \\)",
            formula: expandDifferenceOfSquares
        }
    ];

    const selectedPattern = problemPatterns[Math.floor(Math.random() * problemPatterns.length)];

    // 問題文の生成
    const term = formatTerm(selectedPattern.a, selectedPattern.b, selectedPattern.operation);
    const question = selectedPattern.type === 'differenceOfSquares'
        ? selectedPattern.questionTemplate
              .replace('${TERM1}', formatTerm(selectedPattern.a, selectedPattern.b, '+'))
              .replace('${TERM2}', formatTerm(selectedPattern.a, selectedPattern.b, '-'))
        : selectedPattern.questionTemplate.replace('${TERM}', term);

    // 正解を計算
    const correctAnswer = selectedPattern.formula(selectedPattern.a, selectedPattern.b, selectedPattern.operation);

    // 選択肢を生成
    const options = generateOptions(correctAnswer);

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

function formatTerm(a, b, operation) {
    const aStr = `${a.coefficient === 1 ? '' : a.coefficient}${a.variable}`;
    const bStr = `${b.coefficient === 1 ? '' : b.coefficient}${b.variable}`;
    return `${aStr} ${operation} ${bStr}`;
}

function expandSquare(a, b, operation) {
    const a2 = formatCoefficient(a.coefficient ** 2) + `${a.variable}^2`;
    const ab2 = formatCoefficient(2 * a.coefficient * b.coefficient) + `${a.variable}${b.variable}`;
    const b2 = formatCoefficient(b.coefficient ** 2) + `${b.variable}^2`;
    const sign = operation === '+' ? '+' : '-';
    return removeZeroTerms(`${a2} ${sign} ${ab2} + ${b2}`);
}

function expandDifferenceOfSquares(a, b) {
    const a2 = formatCoefficient(a.coefficient ** 2) + `${a.variable}^2`;
    const b2 = formatCoefficient(b.coefficient ** 2) + `${b.variable}^2`;
    return removeZeroTerms(`${a2} - ${b2}`);
}

function removeZeroTerms(expression) {
    return expression
        .split(' ')
        .filter(term => term && !/^0[a-z]/.test(term) && term !== '0') // Remove terms like "0x^2" and standalone "0"
        .join(' ')
        .replace(/\+\s-/g, '- ') // Clean up "+ -" to just "-"
        .trim();
}

function formatCoefficient(coefficient) {
    if (isNaN(coefficient) || coefficient === undefined || coefficient === null) return ''; // Skip invalid coefficients
    if (coefficient === 0) return ''; // Omit '0'
    if (coefficient === 1) return ''; // Omit '1'
    if (coefficient === -1) return '-'; // Omit '-1', keep '-'
    return coefficient.toString(); // Return other coefficients as-is
}

function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    let attempts = 0;

    while (options.length < 4 && attempts < 20) {
        attempts++;
        const terms = correctAnswer.match(/-?\d*[a-z]\^?\d*/g);
        if (!terms) continue;

        const newTerms = terms.map(term => {
            const [coeff, variable] = term.split(/(?=[a-z])/);
            const newCoeff = parseInt(coeff || 1, 10) + randomInt(-2, 2); // Treat empty coefficient as 1
            return newCoeff === 0 ? null : formatCoefficient(newCoeff) + (variable || ''); // Skip 0 coefficient terms
        }).filter(Boolean);

        const newOption = newTerms.join(' + ').replace(/\+\s-/g, '- ').trim();
        if (!options.includes(newOption) && newOption !== correctAnswer) {
            options.push(newOption);
        }
    }

    return options.length === 4 ? options.sort(() => Math.random() - 0.5) : null;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
