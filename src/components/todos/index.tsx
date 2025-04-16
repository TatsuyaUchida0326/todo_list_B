import React, { useState } from 'react';

// "Todo" 型の定義をコンポーネント外で行います
type Todo = {
  title: string; // プロパティ content は文字列型
};

// Todo コンポーネントの定義
const Todo: React.FC = () => {
  const [todo, setTodo] = useState('');


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // タスクの追加処理をここに追加します
    console.log('Todo added:', todo);
    setTodo(''); // フォームをリセット
  };


  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
        <input
          type="submit"
          value="追加"
        />
      </form>
      {/* ↓ DOM のリアクティブな反応を見るためのサンプル */}
      <p>{todo}</p>
      {/* ↑ あとで削除 */}
    </div>
  );
};


export default Todo;