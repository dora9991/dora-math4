function generateDrawProblem() {
    let problem;
    let tryCount = 0;
    do {
        problem = tryGenerateGraphProblem();
        tryCount++;
        // 無限ループ回避（10回試してダメなら諦め）
        if (tryCount > 10) {
            console.error('有効な問題を生成できませんでした。');
            break;
        }
    } while (!problem);

    return problem;
}

function tryGenerateGraphProblem() {
    // 正解となる係数（ランダム生成）
    let k;
    do {
        k = Math.floor(Math.random() * 9) - 4; // -4 ~ 4, 0除外
    } while (k === 0);

    const correctAnswer = formatEquation(k);
    const question = `${correctAnswer} このグラフは次のうちどれだろうか？`;
    const graphs = generateGraphOptions(k);

    return {
        question,
        correctAnswer,
        options: graphs,
    };
}

function generateGraphOptions(correctCoefficient) {
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);

    for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push({
                graph: generateGraph(correctCoefficient),
                equation: formatEquation(correctCoefficient),
            });
        } else {
            let wrongCoefficient;
            do {
                wrongCoefficient = Math.floor(Math.random() * 9) - 4;
            } while (
                wrongCoefficient === 0 || 
                wrongCoefficient === correctCoefficient ||
                options.some(opt => opt.equation === formatEquation(wrongCoefficient))
            );

            options.push({
                graph: generateGraph(wrongCoefficient),
                equation: formatEquation(wrongCoefficient),
            });
        }
    }
    return options;
}

function generateGraph(coefficient) {
    // グラフデータ生成
    const data = [];
    for (let x = -4; x <= 4; x += 0.5) {
        const y = coefficient * x * x;
        data.push({ x, y });
    }

    return {
        type: 'scatter',
        data: {
            datasets: [{
                data: data,
                showLine: true,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    min: -3,
                    max: 3,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 10, // 数字を小さく詰めて表示
                        }
                    }
                },
                y: {
                    type: 'linear',
                    min: -9,
                    max: 9,
                    ticks: {
                        stepSize: 3,
                        font: {
                            size: 10, // 数字を小さく詰めて表示
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // 凡例を表示しない
                }
            },
            layout: {
                padding: 0, // グラフ内余白を最小化
            }
        }
    };
}

function formatEquation(coefficient) {
    if (coefficient === 1) return `y=x^2`;
    if (coefficient === -1) return `y=-x^2`;
    return `y=${coefficient}x^2`;
}

function validateAnswer(selectedAnswer, correctAnswer) {
    return selectedAnswer === correctAnswer;
}
