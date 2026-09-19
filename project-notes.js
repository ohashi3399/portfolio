// Edit these notes to add first-hand context for each project.
const projectNotes = {
    'bank-profiling': '数千万ユーザーを保有する銀行様向けに、取引データをLLMで構造化し自然言語で検索可能なタグ付きDBに整えた取り組みです。約1年でプロダクト導入・国際論文採択・複数特許出願まで進めた事例です。',
    'mo-grpo': 'To be appended',
    'alignment': 'To be appended',
    'tora': 'To be appended',
    'tanuki': 'To be appended',
    'openbookqa': 'To be appended',
    'platypus': 'To be appended',
    'nemotron': 'To be appended',
    'evol-instruct': 'To be appended',
    'art': 'To be appended',
    'sake-rag': 'To be appended',
    'ca-reward': 'To be appended',
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
        const underlineY = rect.bottom + 3;
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
