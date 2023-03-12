const input = document.querySelector('.container_search input[type=text]');
const helpList = document.querySelector('.container_help');
const list = document.querySelector('.container_list');
const count = 5;
const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  };
};

let response = [];

input.addEventListener(
  'input',
  debounce(async e => {
    let value = e.target.value.trim();
    e.stopPropagation();
    if (value == '') {
      helpList.style.display = 'none';
      return;
    }
    response = await fetch(
      `https://api.github.com/search/repositories?q=${value}&per_page=${count}`
    )
      .then(data => data.json())
      .then(data => {
        const items = data.items;
        const fragment = new DocumentFragment();
        // console.log(data.items);

        let count = 0;
        for (const item of items) {
          const li = document.createElement('li');
          li.dataset.count = count++;
          li.textContent = `${item.name.toUpperCase()} forks:${item.forks}`;
          fragment.append(li);
        }

        helpList.replaceChildren(fragment);
        helpList.style.display = 'block';
        return items;
      });
  }, 1000)
);

function createItemContent(text, value) {
  const li = document.createElement('li');
  li.classList.add('container_list-attached_item');
  li.textContent = `${text}:${value}`;
  return li;
}
function deleteElem(el) {
  return () => {
    el.remove();
  };
}
function addItem(e) {
  let index = +e.target.dataset.count;
  const item = response[index];
  const id = response[index].id;
  let hasItem = false;
  if (list.children.length != 0) {
    hasItem = Array.from(list.children).some(el => el.getAttribute('id') == id);
  }
  if (hasItem) return;

  // e.stopPropagation();
  const fragmentList = new DocumentFragment();
  const li = document.createElement('li');
  li.classList.add('container_item');
  li.setAttribute('id', id);
  const ul = document.createElement('ul');
  ul.classList.add('container_list-attached');

  helpList.style.display = 'none';
  ul.append(createItemContent('Owner', item.owner.login));
  ul.append(createItemContent('Name', item.name));
  ul.append(createItemContent('Stars', item.forks));
  const liChildren = document.createElement('li');
  liChildren.classList.add('container_list-attached-button');
  const button = document.createElement('button');
  button.classList.add('container-button-delete');
  button.addEventListener('click', deleteElem(li), { once: true });
  button.textContent = 'x';
  liChildren.append(button);
  ul.append(liChildren);

  li.append(ul);
  fragmentList.append(li);
  list.append(fragmentList);
  input.value = '';
}
helpList.addEventListener('click', addItem);
