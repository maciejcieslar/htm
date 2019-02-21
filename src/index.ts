import htm from 'htm';
import DOM from 'react-dom';
import React from 'react';
import { bind } from './html';

const ht = htm.bind(React.createElement);
const html = bind(React.createElement);

const Header = ({ name }: any) =>
  html`
    <h1>${name} List</h1>
  `;

const Footer = (props: any) =>
  html`
    <footer ...${props} />
  `;

const todos: string[] = ['todo1', 'todo2'];

const page = 'page1';

function addTodo() {
  console.log('todo added');
}

const test = { className: 'app' };

console.time('HTML!');

const h = html`
  <div ...${test}>
    <${Header} name="ToDo's (${page})" />
    <ul>
      ${todos.map(
        (todo, index) => html`
          <li key="${index}">${todo}</li>
        `,
      )}
    </ul>
    <button onClick=${() => addTodo()}>
      Add Todo
    </button>
    <${Footer}>footer content here<//>
  </div>
`;

console.timeEnd('HTML!');

console.time('HT!');

const d = ht`
  <div className="app">
    <${Header} name="ToDo's (${page})" />
    <ul>
      ${todos.map(
        (todo, index) => ht`
          <li key="${index}">${todo}</li>
        `,
      )}
    </ul>
    <button onClick=${() => addTodo()}>
      Add Todo
    </button>
    <${Footer}>footer content here<//>
  </div>
`;

console.timeEnd('HT!');

DOM.render(h, document.querySelector('#app'));
