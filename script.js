const api_base = 'http://localhost:3000';
const container = document.querySelector('.expenses-container');

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
  let totalAmount = 0;
  totalAmount += Number(cost);
  document.getElementById('total-amount').innerText =totalAmount;
  const list = document.createElement('div');
  list.setAttribute('class', 'list');
  list.innerHTML = `
  <p class="shop"> Shop '${shop}'</p>
  <p class="date">${createdAt}</p>
  <p class="amount">$ ${cost}</p>
  <img src="https://img.icons8.com/ios-glyphs/30/000000/edit--v1.png" alt="edit" class="edit">
  <img src="https://img.icons8.com/ios-glyphs/30/000000/filled-trash.png" alt="delete" class="delete">`;

  list.querySelector('.delete').addEventListener('click', () => deleteExpense(id))

  const editBtn = list.querySelector('.edit');
  editBtn.addEventListener('click', () => {
    const shopField = list.querySelector('.shop')
    const shop = shopField.innerText.substr(6).slice(0,-1);
    const costField = list.querySelector('.amount')
    const cost = costField.innerText.substring(2);
    updateValues = { id, shop, cost, shopField, costField, editBtn };
    updateInstanceById(updateValues);
  })
  return list;
};

window.onload = () => {
  fetchAPI();
}

const deleteExpense = async (id) => {
    try {
    container.innerHTML = '';
    const fetchedData = await fetchWithoutBody('DELETE',id)
    const response = await fetchedData.json();
  
    if (response && response.length > 0) {
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