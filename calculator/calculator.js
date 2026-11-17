// Простий калькулятор на JavaScript

class Calculator {
  constructor(expressionEl, resultEl) {
    this.expressionEl = expressionEl;
    this.resultEl = resultEl;
    this.clear();
  }

  clear() {
    this.current = '0';      // число, яке зараз вводиться
    this.previous = null;    // попереднє число
    this.operator = null;    // обрана операція
    this.resetNext = false;  // чи почати нове число при наступному вводі
    this.update();
  }

  inputDigit(digit) {
    if (this.current === 'Помилка') this.clear();
    if (this.resetNext) {
      this.current = digit;
      this.resetNext = false;
    } else {
      this.current = this.current === '0' ? digit : this.current + digit;
    }
    this.update();
  }

  inputDecimal() {
    if (this.resetNext || this.current === 'Помилка') {
      this.current = '0.';
      this.resetNext = false;
    } else if (!this.current.includes('.')) {
      this.current += '.';
    }
    this.update();
  }

  backspace() {
    if (this.resetNext || this.current === 'Помилка') return;
    this.current = this.current.length > 1 ? this.current.slice(0, -1) : '0';
    if (this.current === '-') this.current = '0';
    this.update();
  }

  negate() {
    if (this.current === '0' || this.current === 'Помилка') return;
    this.current = this.current.startsWith('-')
      ? this.current.slice(1)
      : '-' + this.current;
    this.update();
  }

  percent() {
    if (this.current === 'Помилка') return;
    this.current = String(Calculator.round(parseFloat(this.current) / 100));
    this.update();
  }

  chooseOperator(op) {
    if (this.current === 'Помилка') return;
    // Якщо вже є операція і введено нове число — спочатку обчислюємо
    if (this.operator && !this.resetNext) {
      this.compute();
      if (this.current === 'Помилка') return;
    }
    this.previous = parseFloat(this.current);
    this.operator = op;
    this.resetNext = true;
    this.update();
  }

  compute() {
    if (this.operator === null || this.previous === null) return;
    const a = this.previous;
    const b = parseFloat(this.current);
    let result;

    switch (this.operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/':
        result = b === 0 ? null : a / b;
        break;
    }

    this.current = result === null ? 'Помилка' : String(Calculator.round(result));
    this.previous = null;
    this.operator = null;
    this.resetNext = true;
    this.update();
  }

  // Прибираємо похибки на кшталт 0.1 + 0.2 = 0.30000000000000004
  static round(num) {
    return parseFloat(num.toPrecision(12));
  }

  static symbol(op) {
    return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op];
  }

  update() {
    this.resultEl.textContent = this.current;
    this.expressionEl.textContent =
      this.operator !== null ? `${this.previous} ${Calculator.symbol(this.operator)}` : '';

    document.querySelectorAll('.btn.op').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.op === this.operator && this.resetNext);
    });
  }
}

const calc = new Calculator(
  document.getElementById('expression'),
  document.getElementById('result')
);

// Обробка натискань кнопок
document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.dataset.num !== undefined) return calc.inputDigit(btn.dataset.num);
  if (btn.dataset.op) return calc.chooseOperator(btn.dataset.op);

  switch (btn.dataset.action) {
    case 'clear': calc.clear(); break;
    case 'backspace': calc.backspace(); break;
    case 'percent': calc.percent(); break;
    case 'negate': calc.negate(); break;
    case 'decimal': calc.inputDecimal(); break;
    case 'equals': calc.compute(); break;
  }
});

// Підтримка клавіатури
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/^[0-9]$/.test(key)) calc.inputDigit(key);
  else if (key === '.' || key === ',') calc.inputDecimal();
  else if (['+', '-', '*', '/'].includes(key)) { e.preventDefault(); calc.chooseOperator(key); }
  else if (key === 'Enter' || key === '=') { e.preventDefault(); calc.compute(); }
  else if (key === 'Backspace') calc.backspace();
  else if (key === 'Escape' || key.toLowerCase() === 'c') calc.clear();
  else if (key === '%') calc.percent();
});
