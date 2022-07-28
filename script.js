/* eslint-disable no-undef */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
const apiBase = 'http://localhost:3000';
const container = document.querySelector('.expenses-container');
let totalAmount = 0;
let arr = [];

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};
const fetchBody = async (method, body, id) => {
  const URL = id ? `${apiBase}/${id}` : apiBase;
  return fetch(URL, {
    method,
    headers,
    body: JSON.stringify(body),
  });
};

const fetchWithoutBody = async (method, id) => {
  const URL = id ? `${apiBase}/${id}` : apiBase;
  return fetch(URL, {
    method,
    headers,
  });
};

let updateValues;
const fetchAPI = async () => {
  const url = await fetchWithoutBody('GET');
  const res = await url.json();
  res.forEach((element) => {
    const listEl = render(element);
    container.append(listEl);
    arr.push(element);
  });
};

// GET METHOD

const render = (data) => {
  const {
    id, shop, cost, createdAt,
  } = data;
  const list = document.createElement('div');
  list.setAttribute('class', 'list');
  list.innerHTML = `
  <p class="shop"> Shop '${shop}'</p>
  <p class="date">${createdAt}</p>
  <p class="amount">$ ${cost}</p>
  <img src="https://img.icons8.com/ios-glyphs/30/000000/edit--v1.png" alt="" class="edit">
  <img src="https://img.icons8.com/ios-glyphs/30/000000/filled-trash.png" alt="" class="delete">
  `;

  list.querySelector('.delete').addEventListener('click', () => deleteExpense(id));

  const editBtn = list.querySelector('.edit');
  editBtn.addEventListener('click', () => {
    const shopField = list.querySelector('.shop');
    const shop = shopField.innerText.substr(6).slice(0, -1);
    const costField = list.querySelector('.amount');
    const cost = costField.innerText.substring(2);
    updateValues = {
      id, shop, cost, shopField, costField, editBtn,
    };
    updateInstanceById(updateValues);
  });

  totalAmount += Number(cost);
  document.getElementById('total-amount').innerText = totalAmount;
  return list;
};

window.onload = () => {
  fetchAPI();
};

// POST METHOD

const addExpense = async () => {
  const shopValue = document.getElementById('shop-input').value;
  const costValue = document.getElementById('amount-input').value;
  const erorValue = document.getElementById('error-message');
  const successValue = document.getElementById('success-message');

  try {
    if (!shopValue || !costValue) {
      erorValue.style.display = 'block';
      erorValue.innerText = 'Shop name or cost is not defined';
    }
    if (costValue < 0 || typeof costValue === 'number') {
      erorValue.style.display = 'block';
      erorValue.innerHTML = 'Cost should be a positive number';
    }
    const fetchResponse = await fetchBody('POST', {
      shop: shopValue,
      cost: costValue,
    });
    const res = await fetchResponse.json();
    arr = res;
    if (res.length) {
      totalAmount = 0;
      container.innerHTML = '';
      res.forEach((element) => {
        const listElement = render(element);
        container.append(listElement);
      });

      erorValue.style.display = 'none';
      successValue.style.display = 'block';
      successValue.innerText = 'New instance has been added.';
      document.getElementById('shop-input').value = null;
      document.getElementById('amount-input').value = null;
    }
  } catch (error) {
    erorValue.innerHTML = error;
  }
};
const addBtn = document.getElementById('add');
addBtn.addEventListener('click', addExpense);

// DELETE METHOD

const deleteExpense = async (id) => {
  try {
    const fetchedData = await fetchWithoutBody('DELETE', id);
    const response = await fetchedData.json();
    arr = response;
    if (response.length) {
      totalAmount = 0;
      container.innerHTML = '';
      response.forEach((element) => {
        const listElement = render(element);
        container.append(listElement);
      });
    }
  } catch (error) {
    erorValue.innerHTML = error;
  }
};

// PATCH METHOD

const updateInstanceById = async (updateValues) => {
  const {
    id, shop, cost, shopField, costField, editBtn,
  } = updateValues;
  const errorValue = document.getElementById('error-message');
  const successValue = document.getElementById('success-message');
  const shopInput = document.createElement('input');
  const costInput = document.createElement('input');
  const checkBtn = document.createElement('img');
  const valuesToUpdate = {};

  shopField.parentNode.replaceChild(shopInput, shopField);
  costField.parentNode.replaceChild(costInput, costField);
  editBtn.parentNode.replaceChild(checkBtn, editBtn);
  checkBtn.src = 'https://img.icons8.com/emoji/48/000000/check-mark-button-emoji.png';
  shopInput.value = shop;
  costInput.value = cost;
  shopInput.classList.add('edit-input-shop');
  costInput.classList.add('edit-input-cost');

  let editedShopValue = shop;
  let editedCostValue = cost;

  shopInput.addEventListener('change', ({ target }) => {
    editedShopValue = target.value.trim();
  });
  costInput.addEventListener('change', ({ target }) => {
    editedCostValue = target.value;
  });

  const update = async () => {
    if (!editedShopValue && !editedCostValue) {
      errorValue.style.display = 'block';
      errorValue.innerHTML = 'You must change at least one input should be changed';
    }
    if (editedCostValue < 0 || Number.isNaN(editedCostValue)) {
      errorValue.style.display = 'block';
      errorValue.innerHTML = 'Cost must be a positive number.';
    }
    if (editedShopValue !== shop) {
      valuesToUpdate.shop = editedShopValue;
    }
    if (editedCostValue !== cost) {
      valuesToUpdate.cost = editedCostValue;
    }

    if (!Object.keys(valuesToUpdate).length) {
      totalAmount = 0;
      container.innerHTML = '';
      arr.forEach((element) => {
        const listElement = render(element);
        container.append(listElement);
      });
    } else {
      container.innerHTML = '';
      const fetchedData = await fetchBody('PATCH', valuesToUpdate, id);
      const res = await fetchedData.json();
      arr = res;
      if (res.length) {
        totalAmount = 0;
        res.forEach((element) => {
          const listElement = render(element);
          container.append(listElement);
          errorValue.style.display = 'none';
          successValue.style.display = 'block';
          successValue.innerText = 'Your expense has changed.';
        });
      }
    }
  };
  checkBtn.addEventListener('click', update);
};
