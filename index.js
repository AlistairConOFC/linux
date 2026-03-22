// ========== ЭМУЛЯЦИЯ ФАЙЛОВОЙ СИСТЕМЫ ==========
let currentPath = '/home/user/demo';
let currentDir = 'demo';
let homePath = '/home/user';

// Виртуальная файловая система
const fileSystem = {
    '/': {
        type: 'dir',
        content: {
            'home': { type: 'dir', content: {} },
            'etc': { type: 'dir', content: {} },
            'var': { type: 'dir', content: {} }
        }
    },
    '/home': {
        type: 'dir',
        content: {
            'user': { type: 'dir', content: {} }
        }
    },
    '/home/user': {
        type: 'dir',
        content: {
            'demo': { type: 'dir', content: {} },
            'Documents': { type: 'dir', content: {} },
            'Downloads': { type: 'dir', content: {} },
            'README.txt': { type: 'file', content: 'Добро пожаловать в демо-терминал Astra Linux!\nЭто эмуляция для ознакомления с интерфейсом.' }
        }
    },
    '/home/user/demo': {
        type: 'dir',
        content: {
            'example.txt': { type: 'file', content: 'Пример файла в демо-терминале' },
            'script.sh': { type: 'file', content: '#!/bin/bash\necho "Привет из демо-скрипта!"' }
        }
    },
    '/home/user/Documents': {
        type: 'dir',
        content: {
            'note.txt': { type: 'file', content: 'Важные заметки' }
        }
    },
    '/etc': {
        type: 'dir',
        content: {
            'os-release': { type: 'file', content: 'NAME="Astra Linux"\nVERSION="1.7 SE"\n' }
        }
    }
};

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

// Получение узла файловой системы по пути
function getNodeFromPath(path) {
    if (path === '/') return fileSystem['/'];
    let normalized = path.startsWith('/') ? path : '/' + path;
    let parts = normalized.split('/').filter(p => p);
    let current = fileSystem['/'];
    
    for (let part of parts) {
        if (!current.content || !current.content[part]) return null;
        current = current.content[part];
    }
    return current;
}

// Обновление приглашения командной строки
function updatePrompt() {
    let displayPath = currentPath === homePath ? '~' : currentPath.replace(homePath, '~');
    document.getElementById('prompt').textContent = `user@astra:${displayPath}$`;
}

// Добавление строки в вывод терминала
function addToOutput(text, type = 'output') {
    const outputDiv = document.getElementById('terminalOutput');
    const lineDiv = document.createElement('div');
    lineDiv.className = type === 'error' ? 'output-line error-line' : 'output-line';
    lineDiv.textContent = text;
    outputDiv.appendChild(lineDiv);
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// Добавление выполненной команды в вывод
function addCommandToOutput(command) {
    const outputDiv = document.getElementById('terminalOutput');
    const commandDiv = document.createElement('div');
    commandDiv.className = 'command-line';
    commandDiv.innerHTML = `<span class="command-prompt">${document.getElementById('prompt').textContent}</span><span class="command-text"> ${command}</span>`;
    outputDiv.appendChild(commandDiv);
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// ========== КОМАНДЫ ТЕРМИНАЛА ==========

// ls - показать содержимое директории
function listDirectory(path) {
    let targetPath = path || currentPath;
    let node = getNodeFromPath(targetPath);
    
    if (!node || node.type !== 'dir') {
        return `ls: cannot access '${targetPath}': No such file or directory`;
    }
    
    let items = Object.keys(node.content);
    if (items.length === 0) return '';
    return items.join('  ');
}

// cd - смена директории
function changeDirectory(newPath) {
    if (!newPath || newPath === '~') {
        currentPath = homePath;
        currentDir = currentPath.split('/').pop();
        updatePrompt();
        return true;
    }
    
    let targetPath;
    if (newPath.startsWith('/')) {
        targetPath = newPath;
    } else if (newPath === '..') {
        let parts = currentPath.split('/').filter(p => p);
        parts.pop();
        targetPath = '/' + parts.join('/');
        if (targetPath === '') targetPath = '/';
    } else {
        targetPath = currentPath + '/' + newPath;
    }
    
    let node = getNodeFromPath(targetPath);
    if (node && node.type === 'dir') {
        currentPath = targetPath;
        currentDir = currentPath.split('/').pop() || '/';
        updatePrompt();
        return true;
    } else {
        return `bash: cd: ${newPath}: No such file or directory`;
    }
}

// cat - показать содержимое файла
function catFile(filename) {
    let filePath = filename.startsWith('/') ? filename : currentPath + '/' + filename;
    let node = getNodeFromPath(filePath);
    if (node && node.type === 'file') {
        return node.content;
    } else {
        return `cat: ${filename}: No such file or directory`;
    }
}

// mkdir - создать директорию
function makeDirectory(dirname) {
    let fullDirPath = dirname.startsWith('/') ? dirname : currentPath + '/' + dirname;
    let parentPath = fullDirPath.substring(0, fullDirPath.lastIndexOf('/'));
    let dirName = fullDirPath.split('/').pop();
    let parent = getNodeFromPath(parentPath);
    
    if (parent && parent.type === 'dir' && !parent.content[dirName]) {
        parent.content[dirName] = { type: 'dir', content: {} };
        return `Каталог создан: ${dirname}`;
    } else {
        return `mkdir: cannot create directory '${dirname}': File exists`;
    }
}

// touch - создать файл
function touchFile(filename) {
    let fullFilePath = filename.startsWith('/') ? filename : currentPath + '/' + filename;
    let parentPath = fullFilePath.substring(0, fullFilePath.lastIndexOf('/'));
    let fileName = fullFilePath.split('/').pop();
    let parent = getNodeFromPath(parentPath);
    
    if (parent && parent.type === 'dir') {
        if (!parent.content[fileName]) {
            parent.content[fileName] = { type: 'file', content: '' };
        }
        return `Файл создан: ${filename}`;
    } else {
        return `touch: cannot touch '${filename}': No such file or directory`;
    }
}

// Демо-режим nano
function emulateNano(filename) {
    addToOutput('  GNU nano 5.4                    ' + filename);
    addToOutput('  ============================================');
    addToOutput('  [ Демо-режим редактора nano ]');
    addToOutput('  Редактирование файлов доступно только в');
    addToOutput('  полноценном терминале Astra Linux.');
    addToOutput('');
    addToOutput('  Для работы с реальным nano установите');
    addToOutput('  ttyd и подключитесь к серверу.');
    addToOutput('');
    addToOutput('  ^X  Выход');
    return true;
}

// Демо-режим neofetch
function showNeofetch() {
    addToOutput('       .-/+oossssoo+/-.       user@astra');
    addToOutput('   `:+ssssssssssssssssss+:`    -----------');
    addToOutput(' -+ssssssssssssssssssyyssss+-  OS: Astra Linux SE 1.7 x86_64');
    addToOutput(' .ossssssssssssssssssdMMMNysssso. Host: Demo Terminal');
    addToOutput('/ssssssssssshdmmNNmmyNMMMMhssssss/  Kernel: 5.4.0-astra (демо)');
    addToOutput('sssssssshNMMMMMMMMMMMMMNyssssssss  Uptime: демо-режим');
    addToOutput('ssssssshNMMMMMMMMMMMMMNyssssssss  Shell: bash 5.1');
    addToOutput('ssssssshNMMMMMMMMMMMMMNyssssssss  Terminal: Web Demo');
    addToOutput('.ssssssssshdmmNNmmyNMMMMhssssss. CPU: Эмуляция');
    addToOutput(' -+ssssssssssssssssssyyssss+-   Memory: Демо');
    addToOutput('   `:+ssssssssssssssssss+:`');
    addToOutput('       .-/+oossssoo+/-.');
}

// ========== ГЛАВНАЯ ФУНКЦИЯ ОБРАБОТКИ КОМАНД ==========
function processCommand(command) {
    command = command.trim();
    if (command === '') return true;
    
    let parts = command.split(' ');
    let cmd = parts[0];
    let args = parts.slice(1);
    
    switch(cmd) {
        case 'help':
            addToOutput('Доступные команды:');
            addToOutput('  help        - показать эту справку');
            addToOutput('  ls [path]   - показать содержимое каталога');
            addToOutput('  cd <dir>    - сменить каталог');
            addToOutput('  pwd         - показать текущий каталог');
            addToOutput('  echo <text> - вывести текст');
            addToOutput('  date        - показать дату и время');
            addToOutput('  whoami      - показать имя пользователя');
            addToOutput('  clear       - очистить экран');
            addToOutput('  neofetch    - показать информацию о системе');
            addToOutput('  nano <file> - открыть редактор (демо)');
            addToOutput('  sudo <cmd>  - выполнить с правами root (демо)');
            addToOutput('  cat <file>  - показать содержимое файла');
            addToOutput('  mkdir <dir> - создать каталог');
            addToOutput('  touch <file>- создать файл');
            break;
            
        case 'ls':
            let result = listDirectory(args[0]);
            addToOutput(result);
            break;
            
        case 'cd':
            if (args.length === 0) {
                changeDirectory('~');
            } else {
                let cdResult = changeDirectory(args[0]);
                if (cdResult !== true) addToOutput(cdResult, 'error');
            }
            break;
            
        case 'pwd':
            let displayPwd = currentPath === homePath ? homePath : currentPath;
            addToOutput(displayPwd);
            break;
            
        case 'echo':
            addToOutput(args.join(' '));
            break;
            
        case 'date':
            addToOutput(new Date().toString());
            break;
            
        case 'whoami':
            addToOutput('user');
            break;
            
        case 'clear':
            document.getElementById('terminalOutput').innerHTML = '';
            break;
            
        case 'neofetch':
            showNeofetch();
            break;
            
        case 'nano':
            if (args.length === 0) {
                addToOutput('Usage: nano <filename>', 'error');
            } else {
                emulateNano(args[0]);
            }
            break;
            
        case 'sudo':
            if (args.length === 0) {
                addToOutput('usage: sudo <command>', 'error');
            } else {
                addToOutput('[sudo] password for user: (демо-режим)');
                addToOutput('Демо-режим: sudo ' + args.join(' ') + ' выполняется с правами root');
                addToOutput('⚠️ В реальной системе sudo требует привилегий');
            }
            break;
            
        case 'cat':
            if (args.length === 0) {
                addToOutput('Usage: cat <filename>', 'error');
            } else {
                let catResult = catFile(args[0]);
                addToOutput(catResult);
            }
            break;
            
        case 'mkdir':
            if (args.length === 0) {
                addToOutput('Usage: mkdir <dirname>', 'error');
            } else {
                let mkdirResult = makeDirectory(args[0]);
                addToOutput(mkdirResult);
            }
            break;
            
        case 'touch':
            if (args.length === 0) {
                addToOutput('Usage: touch <filename>', 'error');
            } else {
                let touchResult = touchFile(args[0]);
                addToOutput(touchResult);
            }
            break;
            
        default:
            addToOutput(`bash: ${cmd}: command not found`, 'error');
            addToOutput(`Введите 'help' для списка доступных команд`, 'error');
            break;
    }
    return true;
}

// ========== ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ СОБЫТИЙ ==========
document.addEventListener('DOMContentLoaded', function() {
    const inputElement = document.getElementById('commandInput');
    
    // Обработка нажатия Enter
    inputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const command = this.value;
            if (command.trim() !== '') {
                addCommandToOutput(command);
                processCommand(command);
            }
            this.value = '';
        }
    });
    
    // Фокус на поле ввода при клике на терминал
    document.querySelector('.terminal-container').addEventListener('click', function() {
        inputElement.focus();
    });
    
    // Приветственное сообщение
    setTimeout(() => {
        addToOutput('Демо-терминал готов к работе.');
        addToOutput('Введите help для списка команд.');
        addToOutput('');
    }, 500);
});
