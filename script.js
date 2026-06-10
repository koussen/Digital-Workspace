// ============================================================
// GLOBAL SYSTEM STATE REGISTRY
// ============================================================
const MockDatabase = {
    notes: [
        { id: "n1", title: "Project Deployment Vector", content: "<p>Analyze structural parameters for immediate rollout. Review each subsystem before initiating the next phase.</p>", modified: Date.now() - 3600000, created: Date.now() - 86400000, pinned: true, color: "#4f46e5" },
        { id: "n2", title: "Framework Initialization Index", content: "<p>Review standard operating hooks for front-end modules. Map all dependency chains.</p>", modified: Date.now() - 7200000, created: Date.now() - 172800000, pinned: false, color: "#10b981" }
    ],
    tasks: [
        { id: "t1", title: "Configure system modules", desc: "Map variable fields to dashboard metrics.", status: "todo", priority: "high", due: "2026-06-12" },
        { id: "t2", title: "Audit layout responsiveness", desc: "Run edge checks on structural widths.", status: "progress", priority: "medium", due: "2026-06-08" },
        { id: "t3", title: "Write unit tests", desc: "Cover all critical code paths.", status: "review", priority: "low", due: "2026-06-20" }
    ],
    events: [
        { id: "e1", title: "Operational Sync", date: "2026-06-15", start: "10:00", end: "11:30", color: "#4f46e5" },
        { id: "e2", title: "Design Review", date: "2026-06-18", start: "14:00", end: "15:00", color: "#10b981" }
    ],
    focusLogs: [
        { id: "l1", type: "Pomodoro", timestamp: Date.now() - 14400000, duration: 25 }
    ],
    generateId: (prefix) => `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
};

// ============================================================
// TOAST UTILITY COMPONENT
// ============================================================
const ToastEngine = {
    show(message, type = 'success') {
        const outlet = document.getElementById('toastOutlet');
        if (!outlet) return;
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.innerText = message;
        outlet.appendChild(el);
        setTimeout(() => {
            el.style.transition = 'opacity 0.4s ease';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 400);
        }, 3600);
    }
};

// ============================================================
// GLOBAL MODAL SERVICE LAYER
// ============================================================
const ModalComponent = {
    overlay: null, title: null, body: null, form: null, onCommit: null,
    init() {
        this.overlay = document.getElementById('appUniversalModal');
        this.title = document.getElementById('modalTitle');
        this.body = document.getElementById('modalDynamicBody');
        this.form = document.getElementById('modalFormPayload');
        document.getElementById('modalCloseAction')?.addEventListener('click', () => this.hide());
        document.getElementById('modalCancelAction')?.addEventListener('click', () => this.hide());
        this.overlay?.addEventListener('click', (e) => { if (e.target === this.overlay) this.hide(); });
        this.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.onCommit) {
                const data = new FormData(this.form);
                const params = Object.fromEntries(data.entries());
                this.onCommit(params);
            }
            this.hide();
        });
    },
    present({ title, bodyHTML, onCommit, submitLabel = 'Save' }) {
        if (!this.overlay) return;
        this.title.innerText = title;
        this.body.innerHTML = bodyHTML;
        this.onCommit = onCommit;
        document.getElementById('modalSubmitAction').innerText = submitLabel;
        this.overlay.classList.add('active');
        // Focus first input
        setTimeout(() => this.body.querySelector('input,textarea,select')?.focus(), 50);
    },
    hide() {
        if (!this.overlay) return;
        this.overlay.classList.remove('active');
        if (this.form) this.form.reset();
    }
};

// ============================================================
// CORE APPLICATION SHELL MANAGER
// ============================================================
class AppCore {
    constructor() {
        this.currentView = 'dashboard-view';
        this.theme = localStorage.getItem('app-theme') || 'light';
        document.body.setAttribute('data-theme', this.theme);
        this.initDOMHooks();
        this.startClockEngine();
        this.initGlobalSearch();
    }

    initDOMHooks() {
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.switchWorkspaceView(target);
            });
        });
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) themeBtn.addEventListener('click', () => this.toggleSystemTheme());
    }

    switchWorkspaceView(viewId) {
        document.querySelectorAll('.workspace-view').forEach(v => v.classList.remove('active-view'));
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(m => m.classList.remove('active'));
        const viewEl = document.getElementById(viewId);
        const menuEl = document.querySelector(`[data-target="${viewId}"]`);
        if (viewEl && menuEl) {
            viewEl.classList.add('active-view');
            menuEl.classList.add('active');
            this.currentView = viewId;
        }
    }

    toggleSystemTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.theme);
        localStorage.setItem('app-theme', this.theme);
        ToastEngine.show(`Switched to ${this.theme} mode`);
    }

    startClockEngine() {
        const display = document.getElementById('headerClock');
        const update = () => {
            if (!display) return;
            const now = new Date();
            display.innerText = now.toLocaleString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        };
        setInterval(update, 1000);
        update();
    }

    initGlobalSearch() {
        const input = document.getElementById('globalAppSearch');
        if (!input) return;
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                input.focus();
            }
        });
        input.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (!q) return;
            // Find matching note
            const note = MockDatabase.notes.find(n => n.title.toLowerCase().includes(q));
            if (note) {
                this.switchWorkspaceView('notes-view');
                setTimeout(() => window.NotesInstance?.selectNote(note.id), 100);
                input.value = '';
            }
        });
    }
}

// ============================================================
// MODULE 1 — DASHBOARD
// ============================================================
class DashboardModule {
    constructor() {
        this.renderChart();
        this.updateMetrics();
        this.updateNextEvent();
        this.bindQuickActions();
        this.updateGreeting();
    }

    updateGreeting() {
        const el = document.getElementById('dashGreeting');
        if (!el) return;
        const h = new Date().getHours();
        const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
        el.innerText = `${greeting}, Operator`;
    }

    updateMetrics() {
        const notesCount = document.getElementById('statNotesCount');
        const tasksCount = document.getElementById('statTasksCount');
        const focusStreak = document.getElementById('statFocusStreak');
        if (notesCount) notesCount.innerText = MockDatabase.notes.length;
        if (tasksCount) tasksCount.innerText = MockDatabase.tasks.filter(t => t.status !== 'done').length;
        if (focusStreak) {
            const today = new Date().toDateString();
            const todaySessions = MockDatabase.focusLogs.filter(l => new Date(l.timestamp).toDateString() === today).length;
            focusStreak.innerText = todaySessions;
        }
    }

    updateNextEvent() {
        const el = document.getElementById('statNextEvent');
        if (!el) return;
        const now = new Date();
        const upcoming = MockDatabase.events
            .filter(e => new Date(e.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        if (upcoming.length > 0) {
            const next = upcoming[0];
            el.innerText = `${next.title}\n${next.date}`;
        } else {
            el.innerText = 'None';
        }
    }

    renderChart() {
        const container = document.getElementById('weeklyVelocityChart');
        if (!container) return;
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const values = [3, 7, 5, 9, 6, 4, 8];
        const max = Math.max(...values);
        container.innerHTML = days.map((day, i) => {
            const pct = Math.round((values[i] / max) * 100);
            return `<div class="chart-bar-wrapper">
                <div class="chart-bar" style="height:${pct}%" data-value="${values[i]}"></div>
                <span class="chart-label">${day}</span>
            </div>`;
        }).join('');
    }

    bindQuickActions() {
        document.getElementById('actionQuickNote')?.addEventListener('click', () => {
            window.AppInstance.switchWorkspaceView('notes-view');
            setTimeout(() => window.NotesInstance?.createNewNote(), 150);
        });
        document.getElementById('actionQuickTask')?.addEventListener('click', () => {
            window.AppInstance.switchWorkspaceView('kanban-view');
            setTimeout(() => window.KanbanInstance?.openAddCardModal('todo'), 150);
        });
        document.getElementById('actionQuickEvent')?.addEventListener('click', () => {
            window.AppInstance.switchWorkspaceView('calendar-view');
            setTimeout(() => window.CalendarInstance?.openAddEventModal(), 150);
        });
    }
}

// ============================================================
// MODULE 2 — NOTES
// ============================================================
class NotesModule {
    constructor() {
        this.activeNoteId = null;
        this.saveTimer = null;
        this.render();
        this.bindEvents();
    }

    render() {
        this.renderList();
        if (MockDatabase.notes.length > 0) {
            // Select first pinned, else first
            const pinned = MockDatabase.notes.find(n => n.pinned);
            this.selectNote((pinned || MockDatabase.notes[0]).id);
        }
    }

    getSortedNotes(query = '') {
        const sort = document.getElementById('notesSortSelect')?.value || 'modified';
        let notes = [...MockDatabase.notes];
        if (query) notes = notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()));
        notes.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            if (sort === 'modified') return b.modified - a.modified;
            if (sort === 'created') return b.created - a.created;
            if (sort === 'alpha') return a.title.localeCompare(b.title);
            return 0;
        });
        return notes;
    }

    renderList(query = '') {
        const list = document.getElementById('notesDOMList');
        if (!list) return;
        const notes = this.getSortedNotes(query);
        if (notes.length === 0) {
            list.innerHTML = `<li style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No notes found</li>`;
            return;
        }
        list.innerHTML = notes.map(n => {
            const date = new Date(n.modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const preview = n.content.replace(/<[^>]+>/g, '').slice(0, 60);
            return `<li class="note-item${n.id === this.activeNoteId ? ' active' : ''}${n.pinned ? ' pinned' : ''}" data-id="${n.id}">
                <div class="note-item-meta">
                    <span class="note-item-title">
                        <span class="pin-badge">📌 </span>${n.title}
                    </span>
                    <span class="note-item-date">${date}</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span class="tag-indicator" style="background:${n.color || '#6b7280'}"></span>
                    <span class="note-item-preview">${preview || 'Empty note'}</span>
                </div>
            </li>`;
        }).join('');

        list.querySelectorAll('.note-item').forEach(el => {
            el.addEventListener('click', () => this.selectNote(el.dataset.id));
        });
    }

    selectNote(id) {
        const note = MockDatabase.notes.find(n => n.id === id);
        if (!note) return;
        this.activeNoteId = id;

        const titleInput = document.getElementById('editorNoteTitle');
        const editor = document.getElementById('editorWYSIWYG');
        const pinBtn = document.getElementById('pinNoteToggleBtn');

        if (titleInput) { titleInput.value = note.title; titleInput.disabled = false; }
        if (editor) { editor.innerHTML = note.content; editor.contentEditable = 'true'; }
        if (pinBtn) pinBtn.innerText = note.pinned ? 'Unpin' : 'Pin';

        // Highlight active color
        document.querySelectorAll('.color-opt').forEach(c => {
            c.classList.toggle('selected', c.dataset.color === note.color);
        });

        this.renderList(document.getElementById('notesSearchField')?.value || '');
        this.setStatus('Synced');
    }

    createNewNote() {
        const id = MockDatabase.generateId('n');
        const note = { id, title: 'Untitled Note', content: '', modified: Date.now(), created: Date.now(), pinned: false, color: '#6b7280' };
        MockDatabase.notes.unshift(note);
        this.renderList();
        this.selectNote(id);
        setTimeout(() => document.getElementById('editorNoteTitle')?.select(), 50);
        ToastEngine.show('New note created');
        window.DashboardInstance?.updateMetrics();
    }

    saveActiveNote() {
        if (!this.activeNoteId) return;
        const note = MockDatabase.notes.find(n => n.id === this.activeNoteId);
        if (!note) return;
        const title = document.getElementById('editorNoteTitle')?.value?.trim();
        const content = document.getElementById('editorWYSIWYG')?.innerHTML;
        note.title = title || 'Untitled Note';
        note.content = content || '';
        note.modified = Date.now();
        this.setStatus('Saved ✓');
        this.renderList(document.getElementById('notesSearchField')?.value || '');
        window.DashboardInstance?.updateMetrics();
    }

    deleteActiveNote() {
        if (!this.activeNoteId) return;
        const idx = MockDatabase.notes.findIndex(n => n.id === this.activeNoteId);
        if (idx === -1) return;
        MockDatabase.notes.splice(idx, 1);
        this.activeNoteId = null;
        document.getElementById('editorNoteTitle').value = '';
        document.getElementById('editorNoteTitle').disabled = true;
        document.getElementById('editorWYSIWYG').innerHTML = '';
        document.getElementById('editorWYSIWYG').contentEditable = 'false';
        this.renderList();
        ToastEngine.show('Note deleted', 'danger');
        window.DashboardInstance?.updateMetrics();
        if (MockDatabase.notes.length > 0) this.selectNote(MockDatabase.notes[0].id);
    }

    setStatus(msg) {
        const el = document.getElementById('editorSaveIndicator');
        if (el) el.innerText = msg;
    }

    bindEvents() {
        document.getElementById('createNewNoteBtn')?.addEventListener('click', () => this.createNewNote());

        document.getElementById('deleteNoteBtn')?.addEventListener('click', () => {
            if (!this.activeNoteId) return;
            if (confirm('Delete this note?')) this.deleteActiveNote();
        });

        document.getElementById('pinNoteToggleBtn')?.addEventListener('click', () => {
            const note = MockDatabase.notes.find(n => n.id === this.activeNoteId);
            if (!note) return;
            note.pinned = !note.pinned;
            document.getElementById('pinNoteToggleBtn').innerText = note.pinned ? 'Unpin' : 'Pin';
            ToastEngine.show(note.pinned ? 'Note pinned' : 'Note unpinned');
            this.renderList();
        });

        // Auto-save on editor input
        document.getElementById('editorWYSIWYG')?.addEventListener('input', () => {
            this.setStatus('Saving...');
            clearTimeout(this.saveTimer);
            this.saveTimer = setTimeout(() => this.saveActiveNote(), 800);
        });
        document.getElementById('editorNoteTitle')?.addEventListener('input', () => {
            clearTimeout(this.saveTimer);
            this.saveTimer = setTimeout(() => this.saveActiveNote(), 800);
        });

        // Toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.execCommand(btn.dataset.cmd, false, null);
                document.getElementById('editorWYSIWYG')?.focus();
            });
        });

        // Color picker
        document.querySelectorAll('.color-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                const note = MockDatabase.notes.find(n => n.id === this.activeNoteId);
                if (!note) return;
                note.color = opt.dataset.color;
                document.querySelectorAll('.color-opt').forEach(c => c.classList.remove('selected'));
                opt.classList.add('selected');
                this.renderList();
            });
        });

        // Search filter
        document.getElementById('notesSearchField')?.addEventListener('input', (e) => {
            this.renderList(e.target.value);
        });

        // Sort change
        document.getElementById('notesSortSelect')?.addEventListener('change', () => {
            this.renderList(document.getElementById('notesSearchField')?.value || '');
        });
    }
}

// ============================================================
// MODULE 3 — CALENDAR
// ============================================================
class CalendarModule {
    constructor() {
        this.currentDate = new Date();
        this.viewMode = 'month'; // 'month' | 'week'
        this.render();
        this.bindEvents();
    }

    render() {
        this.updateTitle();
        if (this.viewMode === 'month') this.renderMonthView();
        else this.renderWeekView();
    }

    updateTitle() {
        const el = document.getElementById('calMonthYearTitle');
        if (!el) return;
        if (this.viewMode === 'month') {
            el.innerText = this.currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        } else {
            const startOfWeek = this.getWeekStart(this.currentDate);
            const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(endOfWeek.getDate() + 6);
            el.innerText = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return d;
    }

    getEventsForDate(dateStr) {
        return MockDatabase.events.filter(e => e.date === dateStr);
    }

    renderMonthView() {
        const container = document.getElementById('monthCellsContainer');
        if (!container) return;
        document.getElementById('calendarMonthPerspective').style.display = 'block';
        document.getElementById('calendarWeekPerspective').style.display = 'none';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const today = new Date();

        let cells = '';
        // Prev month padding
        for (let i = firstDay - 1; i >= 0; i--) {
            cells += `<div class="calendar-cell other-month"><span class="cell-num">${daysInPrevMonth - i}</span></div>`;
        }
        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
            const events = this.getEventsForDate(dateStr);
            const eventPills = events.map(e => `<div class="event-pill" style="background:${e.color}" data-id="${e.id}" title="${e.title}">${e.title}</div>`).join('');
            cells += `<div class="calendar-cell${isToday ? ' today-cell' : ''}" data-date="${dateStr}">
                <span class="cell-num">${d}</span>
                ${eventPills}
            </div>`;
        }
        // Next month padding
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        for (let d = 1; d <= totalCells - firstDay - daysInMonth; d++) {
            cells += `<div class="calendar-cell other-month"><span class="cell-num">${d}</span></div>`;
        }

        container.innerHTML = cells;

        // Click on day cell to add event
        container.querySelectorAll('.calendar-cell:not(.other-month)').forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (e.target.classList.contains('event-pill')) {
                    this.openEditEventModal(e.target.dataset.id);
                } else {
                    this.openAddEventModal(cell.dataset.date);
                }
            });
        });
    }

    renderWeekView() {
        const container = document.getElementById('weekCellsContainer');
        if (!container) return;
        document.getElementById('calendarMonthPerspective').style.display = 'none';
        const weekEl = document.getElementById('calendarWeekPerspective');
        weekEl.style.display = 'flex';

        const weekStart = this.getWeekStart(this.currentDate);
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
        });
        const today = new Date().toDateString();
        const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

        const dayHeaders = `<div class="week-header-cell"></div>` + days.map(d => {
            const isToday = d.toDateString() === today;
            return `<div class="week-header-cell" style="${isToday ? 'color:var(--accent-color)' : ''}">${d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</div>`;
        }).join('');

        const timeRows = hours.map((h, hi) => {
            const dayCells = days.map(d => {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const events = this.getEventsForDate(dateStr).filter(e => {
                    const startHour = parseInt(e.start.split(':')[0]);
                    return startHour === hi;
                });
                const evtHtml = events.map(e => `<div class="week-event-card" style="background:${e.color}" data-id="${e.id}">${e.title}</div>`).join('');
                return `<div class="week-time-slot" data-date="${dateStr}" data-hour="${hi}">${evtHtml}</div>`;
            }).join('');
            return `<div class="time-slot-label">${h}</div>${dayCells}`;
        }).join('');

        container.innerHTML = dayHeaders + timeRows;

        container.querySelectorAll('.week-time-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                if (e.target.classList.contains('week-event-card')) {
                    this.openEditEventModal(e.target.dataset.id);
                } else {
                    const startHour = String(slot.dataset.hour).padStart(2, '0');
                    this.openAddEventModal(slot.dataset.date, `${startHour}:00`);
                }
            });
        });
    }

    openAddEventModal(date = '', startTime = '') {
        ModalComponent.present({
            title: 'Add Event',
            submitLabel: 'Add Event',
            bodyHTML: `
                <div class="form-group"><label>Title</label><input name="title" class="form-control" placeholder="Event title" required></div>
                <div class="form-group"><label>Date</label><input name="date" type="date" class="form-control" value="${date}" required></div>
                <div class="form-group"><label>Start Time</label><input name="start" type="time" class="form-control" value="${startTime}"></div>
                <div class="form-group"><label>End Time</label><input name="end" type="time" class="form-control"></div>
                <div class="form-group"><label>Color</label>
                    <select name="color" class="form-control">
                        <option value="#4f46e5">Indigo</option>
                        <option value="#10b981">Green</option>
                        <option value="#f59e0b">Amber</option>
                        <option value="#ef4444">Red</option>
                        <option value="#3b82f6">Blue</option>
                    </select>
                </div>`,
            onCommit: (params) => {
                if (!params.title || !params.date) return;
                MockDatabase.events.push({ id: MockDatabase.generateId('e'), ...params });
                this.render();
                window.DashboardInstance?.updateNextEvent();
                ToastEngine.show('Event added');
            }
        });
    }

    openEditEventModal(id) {
        const ev = MockDatabase.events.find(e => e.id === id);
        if (!ev) return;
        ModalComponent.present({
            title: 'Edit Event',
            submitLabel: 'Save Changes',
            bodyHTML: `
                <div class="form-group"><label>Title</label><input name="title" class="form-control" value="${ev.title}" required></div>
                <div class="form-group"><label>Date</label><input name="date" type="date" class="form-control" value="${ev.date}"></div>
                <div class="form-group"><label>Start Time</label><input name="start" type="time" class="form-control" value="${ev.start || ''}"></div>
                <div class="form-group"><label>End Time</label><input name="end" type="time" class="form-control" value="${ev.end || ''}"></div>
                <div class="form-group"><label>Color</label>
                    <select name="color" class="form-control">
                        <option value="#4f46e5" ${ev.color === '#4f46e5' ? 'selected' : ''}>Indigo</option>
                        <option value="#10b981" ${ev.color === '#10b981' ? 'selected' : ''}>Green</option>
                        <option value="#f59e0b" ${ev.color === '#f59e0b' ? 'selected' : ''}>Amber</option>
                        <option value="#ef4444" ${ev.color === '#ef4444' ? 'selected' : ''}>Red</option>
                        <option value="#3b82f6" ${ev.color === '#3b82f6' ? 'selected' : ''}>Blue</option>
                    </select>
                </div>
                <div class="form-group" style="margin-top:8px;">
                    <button type="button" class="btn btn-danger" id="deleteEventBtn" style="width:100%">Delete Event</button>
                </div>`,
            onCommit: (params) => {
                Object.assign(ev, params);
                this.render();
                window.DashboardInstance?.updateNextEvent();
                ToastEngine.show('Event updated');
            }
        });
        setTimeout(() => {
            document.getElementById('deleteEventBtn')?.addEventListener('click', () => {
                MockDatabase.events = MockDatabase.events.filter(e => e.id !== id);
                ModalComponent.hide();
                this.render();
                window.DashboardInstance?.updateNextEvent();
                ToastEngine.show('Event deleted', 'danger');
            });
        }, 50);
    }

    navigate(dir) {
        if (this.viewMode === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + dir);
        } else {
            this.currentDate.setDate(this.currentDate.getDate() + dir * 7);
        }
        this.render();
    }

    bindEvents() {
        document.getElementById('calPrevBtn')?.addEventListener('click', () => this.navigate(-1));
        document.getElementById('calNextBtn')?.addEventListener('click', () => this.navigate(1));
        document.getElementById('calToggleMonthView')?.addEventListener('click', () => {
            this.viewMode = 'month';
            document.getElementById('calToggleMonthView')?.classList.add('active');
            document.getElementById('calToggleWeekView')?.classList.remove('active');
            this.render();
        });
        document.getElementById('calToggleWeekView')?.addEventListener('click', () => {
            this.viewMode = 'week';
            document.getElementById('calToggleWeekView')?.classList.add('active');
            document.getElementById('calToggleMonthView')?.classList.remove('active');
            this.render();
        });
    }
}

// ============================================================
// MODULE 4 — KANBAN BOARD
// ============================================================
class KanbanModule {
    constructor() {
        this.draggedCardId = null;
        this.render();
        this.bindEvents();
    }

    render() {
        ['todo', 'progress', 'review', 'done'].forEach(status => {
            const col = document.querySelector(`#col-${status} .cards-container`);
            const badge = document.getElementById(`badge-${status}`);
            if (!col) return;
            const tasks = MockDatabase.tasks.filter(t => t.status === status);
            if (badge) badge.innerText = tasks.length;
            col.innerHTML = tasks.map(t => this.renderCard(t)).join('');
            col.querySelectorAll('.kanban-card').forEach(card => this.setupCardDrag(card));
            col.querySelectorAll('.kanban-card').forEach(card => {
                card.addEventListener('click', () => this.openEditCardModal(card.dataset.id));
            });
        });
    }

    renderCard(task) {
        const today = new Date().toISOString().slice(0, 10);
        const isOverdue = task.due && task.due < today && task.status !== 'done';
        const dueLabel = task.due ? new Date(task.due + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
        return `<div class="kanban-card" draggable="true" data-id="${task.id}">
            <span class="card-priority-tag priority-${task.priority}">${task.priority}</span>
            <div class="card-title">${task.title}</div>
            <div class="card-desc">${task.desc || ''}</div>
            <div class="card-footer">
                <span class="due-indicator${isOverdue ? ' overdue' : ''}">📅 ${dueLabel}${isOverdue ? ' ⚠' : ''}</span>
            </div>
        </div>`;
    }

    setupCardDrag(card) {
        card.addEventListener('dragstart', (e) => {
            this.draggedCardId = card.dataset.id;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            this.draggedCardId = null;
        });
    }

    openAddCardModal(status) {
        ModalComponent.present({
            title: 'Add Card',
            submitLabel: 'Add Card',
            bodyHTML: `
                <div class="form-group"><label>Title</label><input name="title" class="form-control" placeholder="Task title" required></div>
                <div class="form-group"><label>Description</label><textarea name="desc" class="form-control" rows="3" placeholder="Optional description"></textarea></div>
                <div class="form-group"><label>Priority</label>
                    <select name="priority" class="form-control">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group"><label>Due Date</label><input name="due" type="date" class="form-control"></div>`,
            onCommit: (params) => {
                if (!params.title) return;
                MockDatabase.tasks.push({ id: MockDatabase.generateId('t'), status, ...params });
                this.render();
                window.DashboardInstance?.updateMetrics();
                ToastEngine.show('Card added');
            }
        });
    }

    openEditCardModal(id) {
        const task = MockDatabase.tasks.find(t => t.id === id);
        if (!task) return;
        ModalComponent.present({
            title: 'Edit Card',
            submitLabel: 'Save Changes',
            bodyHTML: `
                <div class="form-group"><label>Title</label><input name="title" class="form-control" value="${task.title}" required></div>
                <div class="form-group"><label>Description</label><textarea name="desc" class="form-control" rows="3">${task.desc || ''}</textarea></div>
                <div class="form-group"><label>Priority</label>
                    <select name="priority" class="form-control">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="form-group"><label>Status</label>
                    <select name="status" class="form-control">
                        <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Backlog</option>
                        <option value="progress" ${task.status === 'progress' ? 'selected' : ''}>In Production</option>
                        <option value="review" ${task.status === 'review' ? 'selected' : ''}>Testing/Review</option>
                        <option value="done" ${task.status === 'done' ? 'selected' : ''}>Finalized</option>
                    </select>
                </div>
                <div class="form-group"><label>Due Date</label><input name="due" type="date" class="form-control" value="${task.due || ''}"></div>
                <div class="form-group" style="margin-top:8px;">
                    <button type="button" class="btn btn-danger" id="deleteCardBtn" style="width:100%">Delete Card</button>
                </div>`,
            onCommit: (params) => {
                Object.assign(task, params);
                this.render();
                window.DashboardInstance?.updateMetrics();
                ToastEngine.show('Card updated');
            }
        });
        setTimeout(() => {
            document.getElementById('deleteCardBtn')?.addEventListener('click', () => {
                MockDatabase.tasks = MockDatabase.tasks.filter(t => t.id !== id);
                ModalComponent.hide();
                this.render();
                window.DashboardInstance?.updateMetrics();
                ToastEngine.show('Card deleted', 'danger');
            });
        }, 50);
    }

    bindEvents() {
        // Column drop zones
        document.querySelectorAll('.kanban-column').forEach(col => {
            col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
            col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
            col.addEventListener('drop', (e) => {
                e.preventDefault();
                col.classList.remove('drag-over');
                if (!this.draggedCardId) return;
                const task = MockDatabase.tasks.find(t => t.id === this.draggedCardId);
                if (task) {
                    task.status = col.dataset.status;
                    this.render();
                    window.DashboardInstance?.updateMetrics();
                    ToastEngine.show('Card moved');
                }
            });
        });

        // Add card buttons in each column
        document.querySelectorAll('.add-card-trigger').forEach(btn => {
            btn.addEventListener('click', () => this.openAddCardModal(btn.dataset.status));
        });

        // Global add card button
        document.getElementById('addKanbanCardGlobalBtn')?.addEventListener('click', () => this.openAddCardModal('todo'));
    }
}

// ============================================================
// MODULE 5 — FOCUS TIMER (POMODORO)
// ============================================================
class FocusModule {
    constructor() {
        this.DURATIONS = { pomodoro: 25 * 60, short: 5 * 60, long: 15 * 60 };
        this.type = 'pomodoro';
        this.totalSeconds = this.DURATIONS.pomodoro;
        this.remaining = this.totalSeconds;
        this.running = false;
        this.interval = null;
        this.CIRCUMFERENCE = 2 * Math.PI * 120; // r=120

        const ring = document.getElementById('timerProgressRing');
        if (ring) {
            ring.style.strokeDasharray = this.CIRCUMFERENCE;
            ring.style.strokeDashoffset = 0;
        }

        this.renderLog();
        this.updateDisplay();
        this.bindEvents();
    }

    updateDisplay() {
        const mins = String(Math.floor(this.remaining / 60)).padStart(2, '0');
        const secs = String(this.remaining % 60).padStart(2, '0');
        const el = document.getElementById('timerTimeStr');
        if (el) el.innerText = `${mins}:${secs}`;
        document.title = this.running ? `${mins}:${secs} — Focus` : 'Digital Workspace Pro';

        const ring = document.getElementById('timerProgressRing');
        if (ring) {
            const progress = this.remaining / this.totalSeconds;
            ring.style.strokeDashoffset = this.CIRCUMFERENCE * (1 - progress);
        }
    }

    start() {
        if (this.running) return;
        this.running = true;
        document.getElementById('timerStartPauseBtn').innerText = 'Pause';
        this.interval = setInterval(() => {
            this.remaining--;
            this.updateDisplay();
            if (this.remaining <= 0) {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        this.running = false;
        clearInterval(this.interval);
        document.getElementById('timerStartPauseBtn').innerText = 'Resume';
    }

    reset() {
        this.running = false;
        clearInterval(this.interval);
        this.remaining = this.totalSeconds;
        document.getElementById('timerStartPauseBtn').innerText = 'Start';
        document.title = 'Digital Workspace Pro';
        this.updateDisplay();
    }

    complete() {
        this.running = false;
        clearInterval(this.interval);
        document.getElementById('timerStartPauseBtn').innerText = 'Start';
        document.title = 'Digital Workspace Pro';

        // Log session
        const log = { id: MockDatabase.generateId('l'), type: this.type === 'pomodoro' ? 'Pomodoro' : this.type === 'short' ? 'Short Break' : 'Long Break', timestamp: Date.now(), duration: this.totalSeconds / 60 };
        MockDatabase.focusLogs.unshift(log);
        this.renderLog();
        window.DashboardInstance?.updateMetrics();

        ToastEngine.show(`${log.type} session complete! 🎉`);

        // Browser notification if permitted
        if (Notification.permission === 'granted') {
            new Notification('Session Complete', { body: `${log.type} (${log.duration} min) finished.` });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        // Auto reset
        this.remaining = this.totalSeconds;
        this.updateDisplay();
    }

    setType(type) {
        this.type = type;
        this.totalSeconds = this.DURATIONS[type];
        this.reset();
        document.querySelectorAll('.timer-tab').forEach(t => t.classList.toggle('active', t.dataset.type === type));
    }

    renderLog() {
        const list = document.getElementById('timerLogDOMList');
        if (!list) return;
        if (MockDatabase.focusLogs.length === 0) {
            list.innerHTML = `<li style="text-align:center;color:var(--text-muted);font-size:0.8rem;padding:12px;">No sessions logged yet</li>`;
            return;
        }
        list.innerHTML = MockDatabase.focusLogs.slice(0, 10).map(l => {
            const time = new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return `<li class="log-item"><span>${l.type}</span><span>${l.duration} min · ${time}</span></li>`;
        }).join('');
    }

    bindEvents() {
        document.getElementById('timerStartPauseBtn')?.addEventListener('click', () => {
            if (this.running) this.pause();
            else this.start();
        });

        document.getElementById('timerResetBtn')?.addEventListener('click', () => this.reset());

        document.querySelectorAll('.timer-tab').forEach(tab => {
            tab.addEventListener('click', () => this.setType(tab.dataset.type));
        });

        // Bind a focused task from kanban if any
        const inProgress = MockDatabase.tasks.filter(t => t.status === 'progress');
        const taskDisplay = document.getElementById('timerActiveTaskText');
        if (taskDisplay && inProgress.length > 0) {
            taskDisplay.innerText = `Focusing on: ${inProgress[0].title}`;
        }
    }
}

// ============================================================
// ENTRYPOINT INITIALIZATION
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    ModalComponent.init();
    window.AppInstance = new AppCore();
    window.DashboardInstance = new DashboardModule();
    window.NotesInstance = new NotesModule();
    window.CalendarInstance = new CalendarModule();
    window.KanbanInstance = new KanbanModule();
    window.FocusInstance = new FocusModule();
});