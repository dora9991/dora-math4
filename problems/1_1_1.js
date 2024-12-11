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
        { coefficient: -3, variable: 'a', power: 1 },
        { coefficient: 4, variable: 'a', power: 1 },
        { coefficient: -5, variable: 'b', power: 1 },
        { coefficient: 6, variable: 'x', power: 2 },
        { coefficient: -4, variable: 'x', power: 1 }
    ];

    const operations = [
        { text: '\\times', type: 'multiply' },
        { text: '\\div', type: 'divide' }
    ];

    const operation = operations[Math.floor(Math.random() * operations.length)];
    const term1 = terms[Math.floor(Math.random() * terms.length)];
    const term2 = terms[Math.floor(Math.random() * terms.length)];

    // 正解を求める
    let correctAnswer;
    if (operation.type === 'multiply') {
        correctAnswer = multiplyTerms(term1, term2);
    } else {
        correctAnswer = divideTerms(term1, term2);
    }

    // 不正な結果（nullや小数）が出た場合は失敗とする
    if (!correctAnswer) return null;

    // 選択肢生成
    const options = generateOptions(correctAnswer, terms);
    if (!options) return null;

    // 質問文生成（LaTeX形式）
    const term1Formatted = formatTerm(term1);
    const term2Formatted = formatTermWithBrackets(term2);

    const question = (operation.type === 'divide')
        ? `次の式を計算しましょう。\\( \\frac{${term1Formatted}}{${term2Formatted}} \\)`
        : `次の式を計算しましょう。\\( ${term1Formatted} \\;${operation.text}\\; ${term2Formatted} \\)`;

    console.log('Generated question:', question);
    console.log('Correct answer:', correctAnswer);

    return {
        question,
        correctAnswer,
        options
    };
}


function formatTerm(term) {
    // 係数の表示
    let coeffStr;
    if (term.coefficient === 1) {
        coeffStr = '';
    } else if (term.coefficient === -1) {
        coeffStr = '-';
    } else {
        coeffStr = term.coefficient.toString();
    }

    // 変数とべき乗の表示
    let varStr = term.variable ? term.variable : '';
    if (term.power > 1) {
        varStr = `${varStr}^{${term.power}}`;
    }

    return coeffStr + varStr;
}

function formatTermWithBrackets(term) {
    // 負数の場合のみ括弧を付ける
    const formatted = formatTerm(term);
    return (term.coefficient < 0) ? `(${formatted})` : formatted;
}

function multiplyTerms(term1, term2) {
    const coefficient = term1.coefficient * term2.coefficient;

    // 変数処理
    let variables = [];
    if (term1.variable) variables.push({v: term1.variable, p: term1.power});
    if (term2.variable) variables.push({v: term2.variable, p: term2.power});

    // 同種変数は指数を足し合わせ、異なる変数は並べる
    // まず変数名ごとにまとめる
    const varMap = {};
    for (const item of variables) {
        if (!varMap[item.v]) {
            varMap[item.v] = item.p;
        } else {
            varMap[item.v] += item.p;
        }
    }

    // アルファベット順に並べる
    const sortedVars = Object.keys(varMap).sort();
    let variableStr = '';
    let powerOverall = 1; // 実質、変数ごとにパワーを持つためこのまま結合
    // ここでは、`formatTerm`が1つの変数に対するもの想定のため、
    // まとめ方を修正する必要がある。複数変数対応:
    // 例: a^2 * b^1 => a^2b
    // ここでは複数変数時、formatTermの拡張が必要だが、簡易対応として
    // a^2 b^1 など連続して表記する。
    for (const v of sortedVars) {
        const p = varMap[v];
        if (p === 1) {
            variableStr += v;
        } else {
            variableStr += `${v}^{${p}}`;
        }
    }

    // 係数が0なら0
    if (coefficient === 0) {
        return '0';
    }

    const result = coefficientToStr(coefficient) + variableStr;
    return result === '' ? '1' : result;
}

function divideTerms(term1, term2) {
    // 割り算は、同じ変数で指数を引き算
    if (term1.variable !== term2.variable) {
        // 異なる変数同士の割り算は、整数結果にならない可能性が大きいので回避
        return null;
    }

    if (term2.coefficient === 0) return null;

    const coefficient = term1.coefficient / term2.coefficient;
    if (!Number.isInteger(coefficient)) return null;

    const power = term1.power - term2.power;
    // 変数処理
    // powerが0になれば変数はなくなる
    const variable = (power > 0) ? term1.variable : '';
    const finalTerm = { coefficient, variable, power: power > 0 ? power : 1 };

    // powerが0なら単に係数だけ
    if (power <= 0) {
        return coefficientToStr(coefficient) || '1';
    }

    return formatTerm(finalTerm);
}

function coefficientToStr(coefficient) {
    if (coefficient === 1) return '';
    if (coefficient === -1) return '-';
    return coefficient.toString();
}

function generateOptions(correctAnswer, terms) {
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);

    let attempts = 0;
    for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push(correctAnswer);
        } else {
            let wrongAnswer;
            let safeCount = 0;
            do {
                safeCount++;
                if (safeCount > 20) return null; // 回避策
                const randomTerm1 = terms[Math.floor(Math.random() * terms.length)];
                const randomTerm2 = terms[Math.floor(Math.random() * terms.length)];

                if (Math.random() > 0.5) {
                    wrongAnswer = multiplyTerms(randomTerm1, randomTerm2);
                } else {
                    wrongAnswer = divideTerms(randomTerm1, randomTerm2);
                }

            } while (
                !wrongAnswer ||
                wrongAnswer === correctAnswer ||
                options.includes(wrongAnswer)
            );
            options.push(wrongAnswer);
        }
    }
    return options;
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
