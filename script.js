const api_base = 'http://localhost:3000';
const container = document.querySelector('.expenses-container');
let totalAmount = 0;


const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};
const fetchBody = async (method, body, id) => {
  const URL = id ? `${api_base}/${id}` : api_base;
  return fetch(URL, {
      method,
      headers,
      body: JSON.stringify(body),
  });
};

const fetchWithoutBody = async (method, id) => {
  const URL = id ? `${api_base}/${id}` : api_base;
  return fetch(URL, {
      method,
      headers,
  });
};

//GET METHOD

const fetchAPI = async () => {
  const url = await fetchWithoutBody("GET");
  const res = await url.json();
  res.forEach((element) => {
    const listEl = render(element);
    container.append(listEl);
  });
}

const render = (data) => {
  const { id, shop, cost, createdAt } = data;
  const list = document.createElement('div');
  list.setAttribute('class', 'list');
  list.innerHTML = `
  <p class="shop"> Shop '${shop}'</p>
  <p class="date">${createdAt}</p>
  <p class="amount">$ ${cost}</p>
  <img src="https://img.icons8.com/ios-glyphs/30/000000/edit--v1.png" alt="" class="edit">
  <img src="https://img.icons8.com/ios-glyphs/30/000000/filled-trash.png" alt="" class="delete">
  `;

  list.querySelector('.delete').addEventListener('click', () => deleteExpense(id))

const editBtn = list.querySelector('.edit');
    editBtn.addEventListener('click', () => {
    const shopField = list.querySelector('.shop')
    const shop = shopField.innerText.substr(6).slice(0,-1);
    const costField = list.querySelector('.amount')
    const cost = costField.innerText.substring(2);
    updateValues = { id, shop, cost, shopField, costField, editBtn };
    updateInstanceById(updateValues);
});

  totalAmount += Number(cost);
  document.getElementById('total-amount').innerText = totalAmount;
  return list;
};

window.onload = () => {
  fetchAPI();
}

// DELETE METHOD

const deleteExpense = async (id) => {
  try {
  const fetchedData = await fetchWithoutBody('DELETE',id)
  const response = await fetchedData.json();

  if (response.length) {
    totalAmount = 0;
    container.innerHTML = "";
    response.forEach((element) => {
    const listElement = render(element);
    container.append(listElement);
    });
  }
 }
 catch(error) {
  return errorValue.innerHTML = error;
 }
};

//POST METHOD

const addExpense = async () => {
    const shopValue = document.getElementById('shop-input').value;
    const costValue = document.getElementById('amount-input').value;
    const errorValue = document.getElementById('error-message');
    const successValue = document.getElementById('success-message');
  
    try {
      if(!shopValue || !costValue) {
        errorValue.style.display = 'block';
        return errorValue.innerText = 'Shop name or cost is not defined';
      }
      if(costValue < 0 || typeof costValue == 'number') {
        errorValue.style.display = 'block';
        return errorValue.innerHTML = 'Cost should be a positive number';
      }
const fetchResponse = await fetchBody('POST', {
         shop: shopValue,
          cost: costValue,
      });
  
const res = await fetchResponse.json();
      if (res.length) {
        totalAmount = 0;
        container.innerHTML = '';
        res.forEach(element => {
          const listElement = render(element);
          container.append(listElement);
        });
  
        errorValue.style.display = 'none';
        successValue.style.display = 'block';
        successValue.innerText = 'New instance has been added.';
        document.getElementById('shop-input').value = null;
        document.getElementById('amount-input').value = null;
      }
  } catch (error) { 
      return errorValue.innerHTML = error;
     }
  }
const addBtn = document.getElementById('add');
addBtn.addEventListener('click', addExpense);

// PATCH METHOD

const updateInstanceById = async (updateValues) => {
    const { id, shop, cost, shopField, costField, editBtn } = updateValues
    const errorValue = document.getElementById('error-message');
    const successValue = document.getElementById('success-message');
    const shopInput = document.createElement('input');
    const costInput = document.createElement('input');
    const checkBtn = document.createElement('img');
    const valuesToUpdate = {};
  
    shopField.parentNode.replaceChild(shopInput, shopField);
    costField.parentNode.replaceChild(costInput, costField);
    editBtn.parentNode.replaceChild(checkBtn, editBtn)
    checkBtn.src = 'https://img.icons8.com/emoji/48/000000/check-mark-button-emoji.png';
    shopInput.value = shop;
    costInput.value = cost;
    shopInput.classList.add('edit-input-shop');
    costInput.classList.add('edit-input-cost');
    
    let editedShopValue = shop;
    let editedCostValue = cost;

    shopInput.addEventListener('change', ({target}) => {
      editedShopValue = target.value.trim();
    });
    costInput.addEventListener('change', ({target}) => {
      editedCostValue = target.value;
    });

const update = async () => {
    try {
      if (!editedShopValue && !editedCostValue) {
        errorValue.style.display = 'block';
        return errorValue.innerHTML = 'You must change at least one input should be changed';
      } 
      if(editedCostValue < 0 || isNaN(editedCostValue)) {
        errorValue.style.display = 'block';
        return errorValue.innerHTML = 'Cost must be a positive number.';
      }
      if (editedShopValue !== shop) {
        valuesToUpdate.shop = editedShopValue;
      }
      if (editedCostValue !== cost) {
        valuesToUpdate.cost = editedCostValue;
      }
      if (Object.keys(valuesToUpdate).length === 0) {
        errorValue.style.display = 'block';
        return errorValue.innerHTML = 'Invalid input, nothing  changed';
      }
      if (Object.keys(valuesToUpdate).length === 1) {
        if (valuesToUpdate.shop === "" || valuesToUpdate.cost === "") {
        errorValue.style.display = 'block';
        return errorValue.innerHTML = 'Invalid input,nothing  changed';
        }
      }
      container.innerHTML = '';    
      const fetchedData = await fetchBody('PATCH', valuesToUpdate ,id);
      const res = await fetchedData.json();
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
     catch(error) {
      errorValue.style.display = 'block';
      return errorValue.innerHTML = error;
     }
    }
    checkBtn.addEventListener('click', update);
}