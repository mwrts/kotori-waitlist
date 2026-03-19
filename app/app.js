/** JS Application Logic */

let tokenizer = null;

kuromoji.builder({ dicPath: "dict/" }).build((err, _tokenizer) => {
    if (err) {
        console.error("Kuromoji initialization failed:", err);
        return;
    }
    tokenizer = _tokenizer;
    const readyStatus = document.getElementById('ready-status');
    const readyIndicator = document.getElementById('ready-indicator');
    if (readyStatus) readyStatus.innerText = "ready to parse";
    if (readyIndicator) readyIndicator.classList.replace('bg-primary/40', 'bg-primary');
});

function kKataToHira(str) {
    return str.replace(/[\u30a1-\u30f6]/g, function(match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}

function extractFurigana(surface, reading) {
    if (!reading) return [];
    const hiraReading = kKataToHira(reading);
    if (/^[ぁ-んァ-ンー]+$/.test(surface)) return [{ text: surface, rt: '' }];
    if (!/[\u4e00-\u9faf]/.test(surface)) return [{ text: surface, rt: '' }];

    let i = surface.length - 1; let j = hiraReading.length - 1;
    let okurigana = '';
    while (i >= 0 && j >= 0 && surface[i] === hiraReading[j]) {
        okurigana = surface[i] + okurigana;
        i--; j--;
    }
    let preI = 0; let preJ = 0;
    let prefix = '';
    while (preI <= i && preJ <= j && surface[preI] === hiraReading[preJ]) {
        prefix += surface[preI];
        preI++; preJ++;
    }
    const kanjiPart = surface.substring(preI, i + 1);
    const readingPart = hiraReading.substring(preJ, j + 1);
    const parts = [];
    if (prefix) parts.push({ text: prefix, rt: ''});
    if (kanjiPart) parts.push({ text: kanjiPart, rt: readingPart});
    if (okurigana) parts.push({ text: okurigana, rt: ''});
    return parts;
}

function segmentText(text) {
    if (!tokenizer) return [];
    const tokens = tokenizer.tokenize(text);
    const blocks = [];
    let currentBlock = null;

    for (let token of tokens) {
        const prevToken = currentBlock ? currentBlock.tokens[currentBlock.tokens.length-1] : null;
        const isDependent = 
            token.pos === '助動詞' || 
            token.pos_detail_1 === '非自立' || 
            token.pos_detail_1 === '接尾' || 
            (token.pos === '助詞' && prevToken && prevToken.pos !== '名詞') ||
            (prevToken && prevToken.pos === '接頭詞');

        if (currentBlock && isDependent && token.surface_form !== '。' && token.surface_form !== '、' && token.surface_form !== '\n') {
            currentBlock.surface += token.surface_form;
            currentBlock.reading += token.reading || '';
            currentBlock.tokens.push(token);
        } else {
            if (token.surface_form === '\n' || token.surface_form === '。' || token.surface_form === '、') {
                blocks.push({ surface: token.surface_form, reading: token.reading||'', tokens: [token], isPunct: true });
                currentBlock = null;
            } else {
                currentBlock = { surface: token.surface_form, reading: token.reading || '', tokens: [token], isPunct: false };
                blocks.push(currentBlock);
            }
        }
    }
    return blocks;
}

const PARTICLE_DICT = {
    'は': {pos: 'particle', meaning: 'topic marker'},
    'が': {pos: 'particle', meaning: 'subject marker'},
    'を': {pos: 'particle', meaning: 'object marker'},
    'に': {pos: 'particle', meaning: 'destination, direction, time, indirect object'},
    'で': {pos: 'particle', meaning: 'by means of, at (location of action)'},
    'へ': {pos: 'particle', meaning: 'towards, to (direction)'},
    'から': {pos: 'particle', meaning: 'from (source)'},
    'まで': {pos: 'particle', meaning: 'until, to (extent)'},
    'と': {pos: 'particle', meaning: 'and (exhaustive), with (person), quote marker'},
    'や': {pos: 'particle', meaning: 'and (inexhaustive, such as)'},
    'の': {pos: 'particle', meaning: 'possessive marker (of, \'s), nominalizer'},
    'も': {pos: 'particle', meaning: 'also, too'},
    'ね': {pos: 'particle', meaning: 'isn\'t it? right? (sentence ending)'},
    'よ': {pos: 'particle', meaning: 'you know! (emphasis at sentence ending)'},
    'か': {pos: 'particle', meaning: 'question marker or "or"'},
    'て': {pos: 'particle', meaning: 'conjunctive (linking verbs/actions)'}
};

// removed googleTranslate API function

async function lookupWord(keyword) {
    if (PARTICLE_DICT[keyword]) {
        return {
            senses: [{ english_definitions: [PARTICLE_DICT[keyword].meaning], parts_of_speech: [PARTICLE_DICT[keyword].pos] }],
            japanese: [{ word: keyword, reading: keyword }],
            is_common: true,
            jlpt: ['jlpt-n5']
        };
    }
    
    let jishoResponse = null;
    const targetUrl = 'https://jisho.org/api/v1/search/words?keyword=' + encodeURIComponent(keyword);
    const fallbackProxies = [
        `https://api.codetabs.com/v1/proxy?quest=${targetUrl}`,
        `https://thingproxy.freeboard.io/fetch/${targetUrl}`
    ];

    for (let proxy of fallbackProxies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            
            const res = await fetch(proxy, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!res.ok) continue;
            let parsed = await res.json();
            
            if (parsed && parsed.data && parsed.data.length > 0) {
                const item = parsed.data[0];
                jishoResponse = {
                    senses: item.senses.slice(0, 2).map(s => ({ english_definitions: s.english_definitions, parts_of_speech: s.parts_of_speech })),
                    japanese: item.japanese.slice(0, 3).map(j => ({ word: j.word, reading: j.reading })),
                    is_common: item.is_common,
                    jlpt: item.jlpt
                };
                break;
            }
        } catch (e) {
            console.warn(`Jisho API timeout/error via proxy, attempting next...`);
        }
    }
    
    // No fallback if Jisho fails
    
    return jishoResponse;
}

// App State
let appState = {
    view: 'home',
    profile: { name: 'student', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcyAYeh5WiUYCKCdLXODPFYVuwCXVK3cSZTgYUtMsth14BYA-M1vD-Ame9MmN5MBC1qXotcMmuiNL5ZSyhwbHOwm-KY_DpbowC0aD-zfj-nfhTyy5e4kyGyI1M1cAMR7XjjYSi8eekJnwN-YasGnyD0BCtoYBNGYflecTASXZTQM20CGi6XBjBflMCTzyljMG53J6kJdkdm0M3lM0P4eSIOrcReqT_IMR7aPSyqbUqluSNxQJ4I9LT54BrRZTwf2MRGaSeZfgVXbcz' },
    docs: [],
    folders: [{id: 'default', name: 'general'}],
    activeDocId: null,
    savedWords: [],
    
    // Editor/Reader specific
    parsedBlocks: [],
    selectedBlockIndex: null,
    defCache: {},
    
    // Practice
    practiceMode: 'list',
    currentFlashcardIndex: 0,
    isFlashcardFlipped: false
};

function generateId() { return Math.random().toString(36).substr(2, 9); }

function loadData() {
    const data = localStorage.getItem('kotori_data');
    if (data) {
        const parsed = JSON.parse(data);
        appState.docs = parsed.docs || [];
        appState.folders = parsed.folders || [{id: 'default', name: 'general'}];
        appState.savedWords = parsed.savedWords || [];
        appState.profile = parsed.profile || appState.profile;
        if (appState.profile.name === 'zen editorial') appState.profile.name = 'student';
        if (appState.docs.length > 0) appState.activeDocId = appState.docs[0].id;
    }
    
    const cache = localStorage.getItem('kotori_dict_cache');
    if (cache) {
        try { appState.defCache = JSON.parse(cache); } catch(e){}
    }
}

function saveCache() {
    try {
        localStorage.setItem('kotori_dict_cache', JSON.stringify(appState.defCache));
    } catch(e) {
        console.warn("Storage full, resetting dict cache...");
        appState.defCache = {};
        localStorage.setItem('kotori_dict_cache', '{}');
    }
}

function saveData() {
    localStorage.setItem('kotori_data', JSON.stringify({
        docs: appState.docs,
        folders: appState.folders,
        savedWords: appState.savedWords,
        profile: appState.profile
    }));
}

function switchView(view) {
    appState.view = view;
    render();
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupListeners();
    render();
});

function setupListeners() {
    // Nav 
    const navItems = ['home', 'documents', 'reader', 'practice'];
    navItems.forEach(n => {
        const el = document.getElementById(`nav-${n}`);
        if(el) el.addEventListener('click', (e) => { e.preventDefault(); switchView(n); });
    });

    // Profile Click
    const profileBtn = document.getElementById('profile-btn');
    if(profileBtn) profileBtn.addEventListener('click', () => switchView('profile'));

    // Credits Modal
    const creditsBtn = document.getElementById('btn-credits');
    const creditsModal = document.getElementById('credits-modal');
    if(creditsBtn && creditsModal) {
        creditsBtn.addEventListener('click', () => creditsModal.classList.remove('hidden-view'));
        document.getElementById('btn-close-credits').addEventListener('click', () => creditsModal.classList.add('hidden-view'));
    }
    
    // Profile Save
    const profileSave = document.getElementById('btn-save-profile');
    if(profileSave) profileSave.addEventListener('click', () => {
        appState.profile.name = document.getElementById('input-profile-name').value || 'student';
        appState.profile.avatar = document.getElementById('input-profile-avatar').value || appState.profile.avatar;
        saveData();
        render(); // update all nav items
    });

    // Create Doc
    const createBtn = document.getElementById('btn-create-doc');
    if(createBtn) createBtn.addEventListener('click', () => {
        if(!tokenizer) { alert('Still loading dictionary...'); return; }
        const text = document.getElementById('input-text').value;
        const title = document.getElementById('input-title').value || 'Untitled Document';
        if(!text.trim()) return;
        
        if (appState.activeDocId) {
            const doc = appState.docs.find(d => d.id === appState.activeDocId);
            if (doc) {
                doc.title = title;
                doc.text = text;
                doc.date = Date.now();
            }
        } else {
            const newDoc = { id: generateId(), title, text, date: Date.now() };
            appState.docs.push(newDoc);
            appState.activeDocId = newDoc.id;
        }
        
        saveData();
        loadActiveDoc();
        switchView('reader');
    });

    // Practice controls
    const flipBtn = document.getElementById('btn-flip');
    if(flipBtn) flipBtn.addEventListener('click', () => {
        appState.isFlashcardFlipped = !appState.isFlashcardFlipped;
        renderPracticeCard();
    });
    
    const nextBtn = document.getElementById('btn-next-card');
    if(nextBtn) nextBtn.addEventListener('click', () => {
        if(appState.savedWords.length === 0) return;
        appState.currentFlashcardIndex = (appState.currentFlashcardIndex + 1) % appState.savedWords.length;
        appState.isFlashcardFlipped = false;
        renderPracticeCard();
    });
    
    const masterBtn = document.getElementById('btn-master-card');
    if(masterBtn) masterBtn.addEventListener('click', () => {
        const words = getFilteredPracticeWords();
        if(words.length === 0) return;
        
        // Find the original word in savedWords array to update it
        const originalWordIndex = appState.savedWords.findIndex(w => w.word === words[appState.currentFlashcardIndex].word);
        if(originalWordIndex > -1) {
            appState.savedWords[originalWordIndex].status = 'mastered';
        }
        
        if(appState.currentFlashcardIndex >= words.length - 1) appState.currentFlashcardIndex = 0;
        appState.isFlashcardFlipped = false;
        saveData();
        renderPracticeCard();
    });

    const newFolderBtn = document.getElementById('btn-new-folder');
    if(newFolderBtn) newFolderBtn.addEventListener('click', () => {
        const name = window.prompt("Enter new folder name:");
        if (name && name.trim()) {
            const newFolder = { id: generateId(), name: name.trim().toLowerCase() };
            appState.folders.push(newFolder);
            saveData();
            renderFolderSelects();
            document.getElementById('select-folder').value = newFolder.id;
        }
    });

    // Practice filter change
    const practiceSelect = document.getElementById('practice-select-folder');
    if(practiceSelect) practiceSelect.addEventListener('change', () => {
        appState.currentFlashcardIndex = 0;
        appState.isFlashcardFlipped = false;
        renderPracticeCard();
    });

    const practiceSelectList = document.getElementById('practice-select-folder-list');
    if(practiceSelectList) practiceSelectList.addEventListener('change', () => {
        renderPracticeList();
    });

    document.getElementById('btn-practice-list-mode')?.addEventListener('click', () => {
        appState.practiceMode = 'list'; renderPracticeSwitch();
    });
    document.getElementById('btn-practice-flash-mode')?.addEventListener('click', () => {
        appState.practiceMode = 'flashcards'; renderPracticeSwitch();
    });

    // New Document button from Home/Docs lists
    document.querySelectorAll('.btn-new-doc').forEach(b => b.addEventListener('click', () => {
        appState.activeDocId = null;
        document.getElementById('input-title').value = '';
        document.getElementById('input-text').value = '';
        document.getElementById('char-count').innerText = '0';
        switchView('creator');
    }));

    // Save vocab in reader
    function saveVocab(statusStr) {
        if (appState.selectedBlockIndex !== null) {
            const block = appState.parsedBlocks[appState.selectedBlockIndex];
            const lookupQuery = block.surface;
            
            let defText = document.getElementById('def-meaning').innerText;
            if(defText.includes('\n')) defText = defText.split('\n')[1]; // safely get meaning if it has pos span
            
            const folderId = document.getElementById('select-folder').value || 'default';
            
            const existing = appState.savedWords.find(w => w.word === lookupQuery);
            if(existing) {
                existing.status = statusStr;
                existing.folderId = folderId;
            } else {
                appState.savedWords.push({ 
                    word: lookupQuery, 
                    reading: kKataToHira(block.reading) || lookupQuery, 
                    meaning: defText,
                    folderId: folderId,
                    status: statusStr
                });
            }
            saveData();
            renderReader(); // updates the yellow underline
            
            const btn = document.getElementById(statusStr === 'learning' ? 'btn-save-learning' : 'btn-save-mastered');
            if(btn) {
                const ogHtml = btn.innerHTML;
                btn.innerHTML = `<span class="material-symbols-outlined text-sm mb-1">check</span> saved!`;
                setTimeout(() => { btn.innerHTML = ogHtml; }, 2000);
            }
        }
    }
    
    document.getElementById('btn-save-learning')?.addEventListener('click', () => saveVocab('learning'));
    document.getElementById('btn-save-mastered')?.addEventListener('click', () => saveVocab('mastered'));
    
    // Jisho
    const jishoBtn = document.getElementById('btn-jisho');
    if (jishoBtn) {
        jishoBtn.addEventListener('click', () => {
            if (appState.selectedBlockIndex !== null) {
                const block = appState.parsedBlocks[appState.selectedBlockIndex];
                window.open(`https://jisho.org/search/${encodeURIComponent(block.surface)}`, '_blank');
            }
        });
    }

    // Deselect word in reader when clicking outside
    const readerSect = document.querySelector('#reader-view section');
    if (readerSect) {
        readerSect.addEventListener('click', (e) => {
            if (!e.target.closest('.interactive-word')) {
                if (appState.selectedBlockIndex !== null) {
                    appState.selectedBlockIndex = null;
                    renderReader();
                    document.getElementById('def-word').innerText = '-';
                    document.getElementById('def-reading').innerText = '-';
                    document.getElementById('def-meaning').innerText = 'select a word to view info';
                    document.getElementById('def-context').parentElement.style.display = 'none';
                }
            }
        });
    }

    const inputArea = document.getElementById('input-text');
    if (inputArea) {
        inputArea.addEventListener('input', (e) => {
            document.getElementById('char-count').innerText = e.target.value.length;
        });
    }
}

function loadActiveDoc() {
    const doc = appState.docs.find(d => d.id === appState.activeDocId);
    if(doc && tokenizer) {
        appState.parsedBlocks = segmentText(doc.text);
    } else {
        appState.parsedBlocks = [];
    }
    appState.selectedBlockIndex = null;
}

function render() {
    // Nav 
    const views = ['home', 'documents', 'creator', 'reader', 'practice', 'profile'];
    views.forEach(v => {
        const el = document.getElementById(`${v}-view`);
        if(el) {
            el.classList.toggle('hidden-view', appState.view !== v);
        }
    });

    const activeClass = 'bg-[#292b26] text-[#aed18f] rounded-r-full ml-[-24px] pl-[24px] font-bold';
    const inactiveClass = 'text-[#aed18f]/50 hover:bg-[#292b26]/50 hover:text-[#aed18f] rounded-full group';
    
    ['home', 'documents', 'reader', 'practice'].forEach(n => {
        const navEl = document.getElementById(`nav-${n}`);
        if(navEl) {
            // handle "creator" counting as "documents" for nav
            let isActive = appState.view === n || (appState.view === 'creator' && n === 'documents');
            navEl.className = `flex items-center gap-4 py-3 px-6 transition-all ${isActive ? activeClass : inactiveClass}`;
        }
    });

    // Profile UI everywhere
    document.querySelectorAll('.profile-name-display').forEach(el => el.innerText = appState.profile.name);
    document.querySelectorAll('.profile-avatar-display').forEach(el => el.src = appState.profile.avatar);

    renderFolderSelects();

    if(appState.view === 'home') renderHome();
    else if(appState.view === 'documents') renderDocumentsList();
    else if(appState.view === 'creator') {
         document.getElementById('btn-create-doc-text').innerText = appState.activeDocId ? 'save changes' : 'create document';
    }
    else if(appState.view === 'reader') {
        if(appState.parsedBlocks.length === 0 && appState.activeDocId && tokenizer) loadActiveDoc();
        renderReader();
    }
    else if(appState.view === 'practice') renderPracticeSwitch();
    else if(appState.view === 'profile') renderProfilePage();
}

function renderHome() {
    document.getElementById('home-stats-docs').innerText = appState.docs.length;
    document.getElementById('home-stats-words').innerText = appState.savedWords.length;
    const recentList = document.getElementById('home-recent-docs');
    recentList.innerHTML = '';
    appState.docs.slice().reverse().slice(0, 3).forEach(doc => {
        const div = document.createElement('div');
        div.className = 'p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer flex justify-between items-center';
        div.innerHTML = `<span class="lowercase font-medium">${doc.title}</span><span class="material-symbols-outlined text-sm text-primary">arrow_forward</span>`;
        div.onclick = () => { appState.activeDocId = doc.id; loadActiveDoc(); switchView('reader'); };
        recentList.appendChild(div);
    });
}

function renderDocumentsList() {
    const list = document.getElementById('docs-list-container');
    list.innerHTML = '';
    if(appState.docs.length === 0) {
        list.innerHTML = '<div class="p-8 text-center text-on-surface-variant/50 lowercase">no documents found.</div>';
    } else {
        appState.docs.slice().reverse().forEach(doc => {
            const div = document.createElement('div');
            div.className = 'p-6 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex items-center justify-between border border-transparent hover:border-primary/20 shadow-sm';
            div.innerHTML = `
                <div class="flex-grow cursor-pointer" onclick="appState.activeDocId = '${doc.id}'; loadActiveDoc(); switchView('reader');">
                   <h3 class="text-xl font-bold font-headline mb-1">${doc.title}</h3>
                   <p class="text-xs text-on-surface-variant lowercase">${new Date(doc.date).toLocaleDateString()}</p>
                </div>
                <div class="flex gap-2">
                    <button class="bg-surface-container-highest hover:bg-surface-bright text-primary p-3 rounded-lg transition-colors btn-edit-doc cursor-pointer shadow-sm border border-outline-variant/10" data-id="${doc.id}"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                    <button class="bg-surface-container-highest hover:bg-surface-bright text-primary p-3 rounded-lg transition-colors btn-read-doc cursor-pointer shadow-sm border border-outline-variant/10" data-id="${doc.id}"><span class="material-symbols-outlined text-[18px]">menu_book</span></button>
                    <button class="bg-error/10 hover:bg-error/20 text-error p-3 rounded-lg transition-colors btn-del-doc cursor-pointer shadow-sm" data-id="${doc.id}"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
            `;
            list.appendChild(div);
        });
        
        list.querySelectorAll('.btn-read-doc').forEach(btn => btn.addEventListener('click', (e) => {
             e.stopPropagation();
             appState.activeDocId = e.currentTarget.getAttribute('data-id');
             loadActiveDoc(); switchView('reader');
        }));
        
        list.querySelectorAll('.btn-del-doc').forEach(btn => btn.addEventListener('click', (e) => {
             e.stopPropagation();
             const ids = e.currentTarget.getAttribute('data-id');
             if(confirm('Delete document?')) {
                 appState.docs = appState.docs.filter(d => d.id !== ids);
                 if(appState.activeDocId === ids) appState.activeDocId = null;
                 saveData(); renderDocumentsList();
             }
        }));

        list.querySelectorAll('.btn-edit-doc').forEach(btn => btn.addEventListener('click', (e) => {
             e.stopPropagation();
             const ids = e.currentTarget.getAttribute('data-id');
             const doc = appState.docs.find(d => d.id === ids);
             if(doc) {
                 appState.activeDocId = doc.id;
                 document.getElementById('input-title').value = doc.title;
                 document.getElementById('input-text').value = doc.text;
                 switchView('creator');
             }
        }));
    }
}

function renderProfilePage() {
    document.getElementById('input-profile-name').value = appState.profile.name;
    document.getElementById('input-profile-avatar').value = appState.profile.avatar;
}

function renderFolderSelects() {
    const selFolder = document.getElementById('select-folder');
    const pracFolder = document.getElementById('practice-select-folder');
    const pracListFolder = document.getElementById('practice-select-folder-list');
    
    if(selFolder) {
        const val = selFolder.value;
        selFolder.innerHTML = '';
        appState.folders.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id; opt.innerText = f.name;
            selFolder.appendChild(opt);
        });
        if(val && appState.folders.some(f=>f.id===val)) selFolder.value = val;
    }
    
    if(pracFolder) {
        const val = pracFolder.value;
        pracFolder.innerHTML = '<option value="all">all folders</option>';
        appState.folders.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id; opt.innerText = f.name;
            pracFolder.appendChild(opt);
        });
        if(val && (val === 'all' || appState.folders.some(f=>f.id===val))) pracFolder.value = val;
    }
    
    if(pracListFolder) {
        const val = pracListFolder.value;
        pracListFolder.innerHTML = '<option value="all">all folders</option>';
        appState.folders.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id; opt.innerText = f.name;
            pracListFolder.appendChild(opt);
        });
        if(val && (val === 'all' || appState.folders.some(f=>f.id===val))) pracListFolder.value = val;
    }
}

function getFilteredPracticeWords() {
    const folderId = document.getElementById('practice-select-folder').value;
    let words = appState.savedWords.filter(w => w.status !== 'mastered'); // only practice learning words
    if(folderId !== 'all') {
        words = words.filter(w => w.folderId === folderId);
    }
    return words;
}

function renderPracticeSwitch() {
    const listBtn = document.getElementById('btn-practice-list-mode');
    const flashBtn = document.getElementById('btn-practice-flash-mode');
    const listMode = document.getElementById('practice-mode-list');
    const flashMode = document.getElementById('practice-mode-flashcards');
    
    if(appState.practiceMode === 'list') {
        if(listBtn) listBtn.className = 'px-4 py-2 rounded-lg bg-surface text-primary font-bold text-sm transition-colors shadow-sm';
        if(flashBtn) flashBtn.className = 'px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest font-bold text-sm transition-colors';
        if(listMode) listMode.classList.remove('hidden-view');
        if(flashMode) flashMode.classList.add('hidden-view');
        renderPracticeList();
    } else {
        if(flashBtn) flashBtn.className = 'px-4 py-2 rounded-lg bg-surface text-primary font-bold text-sm transition-colors shadow-sm';
        if(listBtn) listBtn.className = 'px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest font-bold text-sm transition-colors';
        if(flashMode) flashMode.classList.remove('hidden-view');
        if(listMode) listMode.classList.add('hidden-view');
        renderPracticeCard();
    }
}

function renderPracticeList() {
    const folderId = document.getElementById('practice-select-folder-list').value;
    let words = appState.savedWords;
    if(folderId !== 'all') words = words.filter(w => w.folderId === folderId);
    
    document.getElementById('practice-list-count').innerText = `${words.length} items`;
    
    const container = document.getElementById('practice-full-list');
    container.innerHTML = '';
    words.forEach(w => {
        const div = document.createElement('div');
        div.className = 'grid grid-cols-12 gap-4 p-4 items-center border-b border-outline-variant/5 hover:bg-surface-bright transition-colors text-sm';
        div.innerHTML = `
            <div class="col-span-3 flex flex-col"><span class="font-japanese font-bold text-lg">${w.word}</span><span class="text-[10px] text-on-surface-variant lowercase">${w.reading}</span></div>
            <div class="col-span-5 text-on-surface-variant pr-4 truncate font-medium lowercase leading-tight">${w.meaning}</div>
            <div class="col-span-2">
                <span class="px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${w.status === 'mastered' ? 'bg-[#aed18f]/10 text-[#aed18f]' : 'bg-primary-container text-on-primary-container'}">${w.status}</span>
            </div>
            <div class="col-span-2 text-right">
                <button class="btn-del-word text-error/70 hover:text-error transition-colors p-2 bg-error/5 hover:bg-error/10 rounded-lg" data-word="${w.word}"><span class="material-symbols-outlined text-[18px]">delete</span></button>
            </div>
        `;
        container.appendChild(div);
    });
    
    container.querySelectorAll('.btn-del-word').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ww = e.currentTarget.getAttribute('data-word');
            if(confirm(`Delete ${ww}?`)) {
                appState.savedWords = appState.savedWords.filter(x => x.word !== ww);
                saveData();
                renderPracticeList();
            }
        });
    });
}

function renderPracticeCard() {
    const container = document.getElementById('flashcard-container');
    const title = document.getElementById('flashcard-title');
    const subtitle = document.getElementById('flashcard-subtitle');
    const sideList = document.getElementById('practice-side-list');
    
    const words = getFilteredPracticeWords();
    const totalWords = appState.savedWords.length;
    const masteredWords = appState.savedWords.filter(w => w.status==='mastered').length;
    
    document.getElementById('practice-word-count').innerHTML = `learning: ${words.length} &middot; master: ${masteredWords}`;
    
    // Sidebar list
    sideList.innerHTML = '';
    words.forEach((w, i) => {
        const div = document.createElement('div');
        div.className = `p-4 flex flex-col gap-1 rounded-2xl bg-surface-container-low transition-all cursor-pointer group border-l-2 ${i === appState.currentFlashcardIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'}`;
        div.innerHTML = `<span class="text-xl font-japanese text-on-surface group-hover:text-primary transition-colors">${w.word}</span><p class="text-xs text-on-surface-variant lowercase truncate">${w.meaning}</p>`;
        div.onclick = () => { appState.currentFlashcardIndex = i; appState.isFlashcardFlipped = false; renderPracticeCard(); };
        sideList.appendChild(div);
    });

    if(words.length === 0) {
        title.innerText = "No Words";
        subtitle.innerText = "Save words from reader";
        // removed container class access to not throw since container was btn-flip
        return;
    }
    
    if(appState.currentFlashcardIndex >= words.length) appState.currentFlashcardIndex = 0;
    
    const word = words[appState.currentFlashcardIndex];
    if(appState.isFlashcardFlipped) {
        title.innerText = word.meaning;
        title.className = "text-4xl font-headline text-primary mb-4 text-center px-4";
        subtitle.innerText = word.reading;
    } else {
        title.innerText = word.word;
        title.className = "text-8xl font-japanese text-primary mb-4";
        subtitle.innerText = "tap flip to see meaning";
    }
}

function renderReader() {
    const doc = appState.docs.find(d => d.id === appState.activeDocId);
    document.getElementById('reader-title').innerText = doc ? doc.title : 'No Document';
    const article = document.getElementById('reader-content');
    article.innerHTML = '';
    
    if(!doc) return;

    let p = document.createElement('p');
    appState.parsedBlocks.forEach((block, index) => {
        if (block.surface === '\n') {
            article.appendChild(p);
            p = document.createElement('p');
            return;
        }

        const span = document.createElement('span');
        if (block.isPunct) {
            span.innerText = block.surface;
        } else {
            span.className = 'interactive-word inline-block';
            if (appState.selectedBlockIndex === index) span.classList.add('active-word');
            
            // Yellow underline if word is in 'learning' status
            const isLearning = appState.savedWords.some(w => w.word === block.surface && w.status === 'learning');
            if (isLearning) {
                span.classList.add('underline', 'decoration-yellow-400/50', 'decoration-2', 'underline-offset-4');
            }
            
            const furiParts = extractFurigana(block.surface, block.reading);
            let resultHtml = '';
            furiParts.forEach(part => {
                if (part.rt) resultHtml += `<ruby>${part.text}<rt class="text-[0.4em] select-none text-primary/80">${part.rt}</rt></ruby>`;
                else resultHtml += part.text;
            });
            span.innerHTML = resultHtml;

            span.addEventListener('click', async () => {
                appState.selectedBlockIndex = index;
                renderReader();
                
                const lookupQuery = block.surface;
                document.getElementById('def-word').innerText = block.surface;
                document.getElementById('def-reading').innerText = kKataToHira(block.reading) || block.surface;
                document.getElementById('def-meaning').innerText = 'Loading definition...';
                
                // Show which folder it's in or context
                const existingWord = appState.savedWords.find(w => w.word === block.surface);
                const folderName = existingWord ? (appState.folders.find(f => f.id === existingWord.folderId)?.name || 'general') : '-';
                document.getElementById('def-context').innerText = existingWord ? `Status: ${existingWord.status} (${folderName})` : '-';

                let def = appState.defCache[lookupQuery];
                if (!def) {
                    def = await lookupWord(lookupQuery);
                    // Fallback to basic forms if surface fails
                    const baseQuery = block.tokens.map(t => t.basic_form !== '*' ? t.basic_form : t.surface_form).join('');
                    if(!def && block.tokens.length > 0) {
                        if (baseQuery !== lookupQuery) def = await lookupWord(baseQuery);
                    }
                    if (def) {
                        appState.defCache[lookupQuery] = def;
                        saveCache();
                    }
                }

                if (def && appState.selectedBlockIndex === index) { 
                    const mainSense = def.senses && def.senses.length > 0 ? def.senses[0] : null;
                    if (mainSense) {
                        const meaningText = mainSense.english_definitions[0].toLowerCase();
                        const posText = mainSense.parts_of_speech && mainSense.parts_of_speech.length > 0 
                                      ? mainSense.parts_of_speech.join(', ').toLowerCase() : '';
                                      
                        if (posText) {
                            document.getElementById('def-meaning').innerHTML = `<span class="text-primary/60 text-[10px] uppercase font-bold tracking-widest block mb-1">${posText}</span>${meaningText}`;
                        } else {
                            document.getElementById('def-meaning').innerText = meaningText;
                        }
                    } else {
                        document.getElementById('def-meaning').innerText = 'No exact meaning found.';
                    }
                    
                    const baseContent = block.tokens.map(t => t.basic_form !== '*' ? t.basic_form : t.surface_form).join('');
                    const ctxParent = document.getElementById('def-context').parentElement;
                    if (baseContent !== lookupQuery && baseContent) {
                        ctxParent.style.display = 'block';
                        document.getElementById('def-context').innerText = baseContent;
                    } else {
                        ctxParent.style.display = 'none';
                    }
                    if (def.is_common) {
                         const jlptSpan = document.createElement('span');
                         jlptSpan.className = 'px-3 py-1 bg-[#aed18f]/20 text-[#aed18f] rounded ml-2 text-xs uppercase font-bold align-middle';
                         const jlptStr = (def.jlpt && def.jlpt.length > 0) ? def.jlpt[0].toUpperCase().replace('-','') : 'COMMON';
                         jlptSpan.innerText = jlptStr;
                         document.getElementById('def-word').appendChild(jlptSpan);
                    }
                } else if (!def && appState.selectedBlockIndex === index) {
                    document.getElementById('def-meaning').innerHTML = `
                        <div class="flex flex-col gap-3 mt-2">
                            <span class="text-error text-sm">failed to load definition from dictionary.</span>
                            <div class="flex gap-2">
                                <button id="btn-retry-def" class="px-3 py-1.5 bg-surface-container-high border border-outline-variant/20 rounded-lg text-xs font-bold hover:bg-surface-bright transition-colors text-on-surface">retry</button>
                                <a href="mailto:violet@usekotori.com?subject=Dictionary%20Lookup%20Failed&body=Word:%20${encodeURIComponent(lookupQuery)}" class="px-3 py-1.5 bg-error/10 border border-error/20 rounded-lg text-xs font-bold hover:bg-error/20 transition-colors text-error flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">mail</span> report issue</a>
                            </div>
                        </div>
                    `;
                    document.getElementById('btn-retry-def').addEventListener('click', () => {
                        span.click();
                    });
                }

            });
        }
        p.appendChild(span);
    });
    
    if (p.childNodes.length > 0) article.appendChild(p);
    
    const validBlocks = appState.parsedBlocks.filter(b => !b.isPunct);
    document.getElementById('stats-words').innerText = validBlocks.length;
    
    let mCount = 0; let lCount = 0;
    validBlocks.forEach(b => {
        const sw = appState.savedWords.find(w => w.word === b.surface);
        if(sw) {
            if(sw.status === 'mastered') mCount++;
            else if(sw.status === 'learning') lCount++;
        }
    });
    
    const pbMastered = document.getElementById('pb-mastered');
    const pbLearning = document.getElementById('pb-learning');
    if(validBlocks.length > 0 && pbMastered && pbLearning) {
        pbMastered.style.width = `${(mCount / validBlocks.length) * 100}%`;
        pbLearning.style.width = `${(lCount / validBlocks.length) * 100}%`;
    }
}
