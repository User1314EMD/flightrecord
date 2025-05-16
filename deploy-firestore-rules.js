/**
 * Скрипт для загрузки правил безопасности Firestore
 * Запускается командой: node deploy-firestore-rules.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Проверяем, установлен ли Firebase CLI
try {
  execSync('firebase --version', { stdio: 'ignore' });
  console.log('Firebase CLI найден');
} catch (error) {
  console.error('Firebase CLI не установлен. Установите его с помощью команды:');
  console.error('npm install -g firebase-tools');
  process.exit(1);
}

// Проверяем, авторизован ли пользователь
try {
  execSync('firebase login:list', { stdio: 'ignore' });
  console.log('Пользователь авторизован в Firebase CLI');
} catch (error) {
  console.error('Пользователь не авторизован в Firebase CLI. Авторизуйтесь с помощью команды:');
  console.error('firebase login');
  process.exit(1);
}

// Создаем временный файл firebase.json
const firebaseConfig = {
  firestore: {
    rules: 'firestore.rules',
    indexes: 'firestore.indexes.json'
  }
};

// Проверяем, существует ли файл с правилами
if (!fs.existsSync('firestore.rules')) {
  console.error('Файл firestore.rules не найден');
  process.exit(1);
}

// Создаем файл с индексами, если его нет
if (!fs.existsSync('firestore.indexes.json')) {
  const defaultIndexes = {
    indexes: [],
    fieldOverrides: []
  };
  fs.writeFileSync('firestore.indexes.json', JSON.stringify(defaultIndexes, null, 2));
  console.log('Создан файл firestore.indexes.json');
}

// Записываем конфигурацию в файл
fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
console.log('Создан временный файл firebase.json');

// Загружаем правила безопасности
try {
  console.log('Загрузка правил безопасности...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('Правила безопасности успешно загружены');
} catch (error) {
  console.error('Ошибка при загрузке правил безопасности:', error.message);
}

// Удаляем временный файл
fs.unlinkSync('firebase.json');
console.log('Временный файл firebase.json удален');

console.log('Готово!');
