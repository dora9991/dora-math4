'use strict';

// 初級レベルの問題自動生成
export function generateProblemByDifficulty() {
    let num1, num2, operator, correctAnswer;

    // 初級: 簡単な加減算
    num1 = Math.floor(Math.random() * 20) + 1; // 1〜20のランダムな数
    num2 = Math.floor(Math.random() * 20) + 1;
    operator = Math.random() > 0.5 ? '+' : '-'; // 加算または減算
    correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;

    return {
        question: `${num1} ${operator} ${num2} = ?`,
        correctAnswer,
        wrongAnswers: generateWrongAnswers(correctAnswer)
    };
}

// 誤答を生成
function generateWrongAnswers(correctAnswer) {
    const wrongAnswers = new Set();
    while (wrongAnswers.size < 3) {
        const offset = Math.floor(Math.random() * 10) - 5; // -5〜5の範囲で誤差を作る
        const wrongAnswer = correctAnswer + offset;
        if (
            wrongAnswer !== correctAnswer &&
            !wrongAnswers.has(wrongAnswer) &&
            wrongAnswer > 0 // 負の値を除外
        ) {
            wrongAnswers.add(wrongAnswer);
        }
    }
    return Array.from(wrongAnswers);
}
