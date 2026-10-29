import {
  User,
  groupUsersByFriendCount,
  getUniqueFriends,
  getUsersWithCommonFriend,
  getUsersWithFriendsMoreThan,
  getUsersWithoutFriends,
} from './model.js';

const STORAGE_KEY = 'users_lab4_storage';

let users = [];

function asyncAddUser(id, name) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exists = users.some((u) => u.id === id);
      if (exists) {
        reject(new Error(`Пользователь с ID ${id} уже существует`));
        return;
      }
      try {
        const newUser = new User(id, name);
        users.push(newUser);
        resolve(newUser);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function asyncRemoveUser(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      users = users.filter((u) => u.id !== userId);
      users.forEach((u) => u.removeFriend(userId));
      resolve();
    }, 100);
  });
}

function asyncAddFriend(userId, friendId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        reject(new Error('Пользователь не найден'));
        return;
      }
      user.addFriend(friendId);
      resolve(user);
    }, 100);
  });
}

function asyncRemoveFriend(userId, friendId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        reject(new Error('Пользователь не найден'));
        return;
      }
      user.removeFriend(friendId);
      resolve(user);
    }, 100);
  });
}

function saveToStorage() {
  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    friends: u.friends,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
}

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [
      new User(1, 'Алиса', [2, 3]),
      new User(2, 'Борис', [1]),
      new User(3, 'Виктория', [1]),
      new User(4, 'Григорий', []),
    ];
  }
  try {
    const parsed = JSON.parse(saved);
    return parsed.map((item) => new User(item.id, item.name, item.friends));
  } catch {
    return [];
  }
}

function renderSelectOptions() {
  const select = document.getElementById('user-select-id');
  if (!select) {
    return;
  }
  select.innerHTML = '';
  users.forEach((u) => {
    const opt = document.createElement('option');
    opt.value = String(u.id);
    opt.textContent = `${u.name} (ID: ${u.id})`;
    select.appendChild(opt);
  });
}

function renderUserList(listToRender = users) {
  const container = document.getElementById('entity-list-container');
  if (!container) {
    return;
  }
  container.innerHTML = '';

  if (listToRender.length === 0) {
    const emptyNotice = document.createElement('p');
    emptyNotice.textContent = 'Пользователи не найдены.';
    container.appendChild(emptyNotice);
    return;
  }

  listToRender.forEach((user) => {
    const card = document.createElement('article');
    card.className = 'user-card';

    const title = document.createElement('h3');
    title.textContent = user.name;

    const idMeta = document.createElement('p');
    idMeta.className = 'user-meta';
    idMeta.textContent = `ID: ${user.id} | Друзей: ${user.friendCount}`;

    const friendsBlock = document.createElement('div');
    friendsBlock.className = 'user-friends';

    const friendsLabel = document.createElement('strong');
    friendsLabel.textContent = 'Друзья: ';
    friendsBlock.appendChild(friendsLabel);

    if (user.friends.length === 0) {
      const noFriends = document.createElement('span');
      noFriends.textContent = 'нет';
      friendsBlock.appendChild(noFriends);
    } else {
      user.friends.forEach((fId) => {
        const tag = document.createElement('span');
        tag.className = 'friend-tag';
        tag.textContent = `ID ${fId} `;

        const btnRemoveF = document.createElement('button');
        btnRemoveF.type = 'button';
        btnRemoveF.className = 'btn-delete-friend';
        btnRemoveF.textContent = '×';
        btnRemoveF.setAttribute(
          'aria-label',
          `Удалить друга ${fId} у пользователя ${user.name}`,
        );
        btnRemoveF.addEventListener('click', async () => {
          await asyncRemoveFriend(user.id, fId);
          saveToStorage();
          updateUI();
        });

        tag.appendChild(btnRemoveF);
        friendsBlock.appendChild(tag);
      });
    }

    const btnDeleteUser = document.createElement('button');
    btnDeleteUser.type = 'button';
    btnDeleteUser.className = 'btn-danger';
    btnDeleteUser.textContent = 'Удалить пользователя';
    btnDeleteUser.addEventListener('click', async () => {
      await asyncRemoveUser(user.id);
      saveToStorage();
      updateUI();
    });

    card.appendChild(title);
    card.appendChild(idMeta);
    card.appendChild(friendsBlock);
    card.appendChild(btnDeleteUser);

    container.appendChild(card);
  });
}

function updateUI() {
  renderUserList();
  renderSelectOptions();
}

function setupListeners() {
  const createForm = document.getElementById('create-user-form');
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('new-user-id');
    const nameInput = document.getElementById('new-user-name');
    const idVal = Number.parseInt(idInput.value, 10);
    const nameVal = nameInput.value.trim();

    try {
      await asyncAddUser(idVal, nameVal);
      saveToStorage();
      updateUI();
      idInput.value = '';
      nameInput.value = '';
    } catch (err) {
      alert(err.message);
    }
  });

  const addFriendForm = document.getElementById('add-friend-form');
  addFriendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const select = document.getElementById('user-select-id');
    const friendInput = document.getElementById('friend-input-id');
    const userId = Number.parseInt(select.value, 10);
    const friendId = Number.parseInt(friendInput.value, 10);

    try {
      await asyncAddFriend(userId, friendId);
      saveToStorage();
      updateUI();
      friendInput.value = '';
    } catch (err) {
      alert(err.message);
    }
  });

  const resultLabel = document.getElementById('analytics-result');

  document
    .getElementById('btn-group-by-friends')
    .addEventListener('click', () => {
      const groups = groupUsersByFriendCount(users);
      const textParts = Object.entries(groups).map(
        ([count, list]) =>
          `Друзей ${count}: ${list.map((u) => u.name).join(', ')}`,
      );
      resultLabel.textContent = textParts.join(' | ') || 'Список пуст';
    });

  document
    .getElementById('btn-show-unique-friends')
    .addEventListener('click', () => {
      const unique = getUniqueFriends(users);
      resultLabel.textContent = `Уникальные ID друзей: [ ${unique.join(', ')} ]`;
    });

  document
    .getElementById('btn-filter-no-friends')
    .addEventListener('click', () => {
      const lonely = getUsersWithoutFriends(users);
      renderUserList(lonely);
      resultLabel.textContent = `Пользователи без друзей (найдено: ${lonely.length})`;
    });

  document
    .getElementById('btn-filter-common-friend')
    .addEventListener('click', () => {
      const input = document.getElementById('filter-common-friend-id');
      const friendId = Number.parseInt(input.value, 10);
      if (Number.isNaN(friendId)) {
        alert('Введите корректный ID друга');
        return;
      }
      const withFriend = getUsersWithCommonFriend(users, friendId);
      renderUserList(withFriend);
      resultLabel.textContent = `Пользователи с общим другом ID ${friendId} (найдено: ${withFriend.length})`;
    });

  document
    .getElementById('btn-filter-more-than')
    .addEventListener('click', () => {
      const input = document.getElementById('filter-min-friends-count');
      const minCount = Number.parseInt(input.value, 10);
      if (Number.isNaN(minCount)) {
        alert('Введите число');
        return;
      }
      const filtered = getUsersWithFriendsMoreThan(users, minCount);
      renderUserList(filtered);
      resultLabel.textContent = `Пользователи с количеством друзей > ${minCount} (найдено: ${filtered.length})`;
    });

  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    updateUI();
    resultLabel.textContent = '';
    document.getElementById('filter-common-friend-id').value = '';
    document.getElementById('filter-min-friends-count').value = '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  users = loadFromStorage();
  updateUI();
  setupListeners();
});
