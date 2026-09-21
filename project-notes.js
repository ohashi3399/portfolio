// Edit these notes to add first-hand context for each project.
const projectNotes = {
    'bank-profiling': '数千万ユーザーを保有する銀行様向けに、取引データをLLMで構造化し自然言語で検索可能な意味的なタグ付きDBに整えた取り組みです。1年でプロダクト導入・国際論文採択・複数特許出願まで完了した事例です。',
    'mo-grpo': '複数の評価軸を持つAIが一つの指標だけを攻略してしまう「報酬ハッキング」を、手動調整なしで抑える強化学習手法MO-GRPOを提案し、国際学術誌TACLに採択された研究です。',
    'alignment': '自由対話可能なLLMを自律移動型ロボットに載せて運用する際、ユーザーの不適切な入力に釣られて差別的な応答を返す問題を、ユーザーの選好を直接最適化する強化学習手法を用いて安全な応答文を返すモデルに整えた取り組みです。',
    'tora': '英語中心に学習されたLLMのFine-tuning前後のモデル重みから差分を抽出し別のLLMに加算するTask-Arithmeticを用いて、英語で学習された指示追従能力を、訓練無しで日本語LLMに転移させた取り組みです。',
    'tanuki': '経済産業省様主導のLLM開発プロジェクトに畠山チームとして参加し、日本語LLMの事後学習用データセットの合成に注力した取り組みです。チーム内でデータ合成とFine-tuningのコンペが行われ、最終的にGPT-3.5を超える性能を獲得したモデルを構築できた取り組みです。',
    'openbookqa': '上記の日本語LLMの事後学習用データセットの取り組みで翻訳した多肢選択式データセットです。',
    'platypus': '上記の日本語LLMの事後学習用データセットの取り組みで翻訳した数学データセットです。',
    'nemotron': '上記の日本語LLMの事後学習用データセットの取り組みで合成した、日本語話者が作成した質問に対してNemotron-4-340Bで応答文を再生成したデータセットです。',
    'evol-instruct': '上記の日本語LLMの事後学習用データセットの取り組みで合成した、Evol-Instructによる指示文の多様な拡張と、応答文を選好データに拡張したデータセットです。',
    'art': 'エージェントの振る舞いを自動採点して少しづつ成長させていくAgentic Reinforcement Trainerというライブラリについて、登壇して紹介した取り組みです。',
    'sake-rag': '日本酒の知識を外部知識として持たせた2B級のLLMと当時の最先端だったreasoningモデルと性能比較を行った取り組みを勉強会で紹介した取り組みです。',
    'ca-reward': '日本語に特化した3B級の報酬モデルを開発し、商用利用可能なライセンスで公開しました。構築手順についても紹介した取り組みです。',
};

(() => {
    let current = null;
    let hoveredButton = null;
    let tooltipHovered = false;
    let keyboardMode = false;
    let touchPinned = false;
    let hideTimer;

    function hide() {
        clearTimeout(hideTimer);
        if (!current) return;
        current.tooltip.hidden = true;
        current.connector.setAttribute('hidden', '');
        current.button.setAttribute('aria-expanded', 'false');
        current = null;
        tooltipHovered = false;
        touchPinned = false;
    }

    function position() {
        if (!current) return;
        const { button, tooltip, line, dot } = current;
        const rect = button.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) {
            hide();
            return;
        }
        const height = tooltip.offsetHeight;
        let left;
        let top;
        // Center the 1px stroke on a device pixel so it stays crisp on desktop.
        const pixelRatio = window.devicePixelRatio || 1;
        const underlineY = (Math.round((rect.bottom + 3) * pixelRatio - pixelRatio / 2) + pixelRatio / 2) / pixelRatio;
        if (innerWidth >= 1200) {
            left = document.querySelector('main').getBoundingClientRect().right + 24;
            top = underlineY - 24;
        } else {
            left = innerWidth - tooltip.offsetWidth - 16;
            top = rect.bottom + 24;
            if (top + height > innerHeight - 24) top = rect.top - height - 24;
        }
        top = Math.max(24, Math.min(top, innerHeight - height - 24));
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        let endX;
        let endY;
        let path;
        if (innerWidth >= 1200) {
            endX = left;
            endY = Math.max(top + 18, Math.min(underlineY, top + height - 18));
            path = `M ${rect.left} ${underlineY} H ${left - 12} V ${endY} H ${endX}`;
        } else {
            // On narrow screens, fold the connector into the note's top/bottom edge.
            endX = Math.max(left + 18, Math.min(rect.right, left + tooltip.offsetWidth - 18));
            endY = top >= rect.bottom ? top : top + height;
            path = `M ${rect.left} ${underlineY} H ${rect.right} V ${endY + (top >= rect.bottom ? -12 : 12)} H ${endX} V ${endY}`;
        }
        line.setAttribute('d', path);
        dot.setAttribute('cx', endX);
        dot.setAttribute('cy', endY);
    }

    function show(entry) {
        clearTimeout(hideTimer);
        if (current !== entry) hide();
        current = entry;
        entry.tooltip.hidden = false;
        entry.connector.removeAttribute('hidden');
        entry.button.setAttribute('aria-expanded', 'true');
        position();
    }

    function scheduleHide() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if (!current || touchPinned || tooltipHovered || hoveredButton === current.button) return;
            if (keyboardMode && document.activeElement === current.button) return;
            hide();
        }, 220);
    }

    document.querySelectorAll('[data-project-note]').forEach((title) => {
        const key = title.dataset.projectNote;
        if (!projectNotes[key]) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-title';
        button.textContent = title.textContent;
        button.setAttribute('aria-describedby', `note-${key}`);
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', `note-${key}`);
        title.replaceWith(button);

        const tooltip = document.createElement('div');
        tooltip.id = `note-${key}`;
        tooltip.className = 'project-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.hidden = true;
        const content = document.createElement('div');
        content.className = 'project-tooltip-content';
        const text = document.createElement('p');
        text.lang = key === 'bank-profiling' ? 'ja' : 'en';
        text.textContent = projectNotes[key];
        content.append(text);
        tooltip.append(content);
        document.body.append(tooltip);
        const svgNamespace = 'http://www.w3.org/2000/svg';
        const connector = document.createElementNS(svgNamespace, 'svg');
        connector.classList.add('project-connector');
        connector.setAttribute('aria-hidden', 'true');
        connector.setAttribute('hidden', '');
        const line = document.createElementNS(svgNamespace, 'path');
        line.setAttribute('pathLength', '1');
        const dot = document.createElementNS(svgNamespace, 'circle');
        dot.setAttribute('r', '3.5');
        connector.append(line, dot);
        document.body.append(connector);
        const entry = { button, tooltip, connector, line, dot };
        let touchWasOpen = false;

        button.addEventListener('pointerenter', (event) => {
            if (event.pointerType === 'touch') return;
            hoveredButton = button;
            show(entry);
        });
        button.addEventListener('pointerleave', (event) => {
            if (event.pointerType === 'touch') return;
            hoveredButton = null;
            scheduleHide();
        });
        button.addEventListener('pointerdown', (event) => {
            touchWasOpen = event.pointerType === 'touch' && current === entry;
        });
        button.addEventListener('focus', () => {
            if (keyboardMode) show(entry);
        });
        button.addEventListener('blur', scheduleHide);
        button.addEventListener('click', (event) => {
            if (event.pointerType === 'touch' && touchWasOpen) {
                hide();
                return;
            }
            show(entry);
            touchPinned = event.pointerType === 'touch';
        });
        tooltip.addEventListener('pointerenter', () => {
            tooltipHovered = true;
            clearTimeout(hideTimer);
        });
        tooltip.addEventListener('pointerleave', () => {
            tooltipHovered = false;
            scheduleHide();
        });
    });

    document.body.classList.add('has-project-notes');
    document.addEventListener('keydown', (event) => {
        keyboardMode = true;
        if (event.key === 'Escape') hide();
    });
    document.addEventListener('pointerdown', (event) => {
        keyboardMode = false;
        if (current && !current.button.contains(event.target) && !current.tooltip.contains(event.target)) hide();
    }, true);
    window.addEventListener('scroll', position, { passive: true });
    window.addEventListener('resize', position);
})();
