import React, { useState } from 'react';

// "Todo" 型の定義をコンポーネント外で行います
type Todo = {
  title: string; // プロパティ content は文字列型
  readonly id: number;
  completed_flg: boolean; // 今回の追加
};


// Todo コンポーネントの定義
const Todo: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]); // Todo配列として初期化
    const [text, setText] = useState(''); // テキスト入力用
    const [nextId, setNextId] = useState(1); // 次のTodoのIDを保持するステート



    // todos ステートを更新する関数
    const handleSubmit = () => {
      // 何も入力されていなかったらリターン
      if (!text) return;


      // 新しい Todo を作成
      const newTodo: Todo = {
        title: text,
        id: nextId,
        // 初期値は false
        completed_flg: false,
      };

      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      setNextId(nextId + 1); // 次の ID を更新

      // フォームへの入力をクリアする
      setText('');
    };

    const handleEdit = (id: number, value: string) => {
      setTodos((todos) => {
        const newTodos = todos.map((todo) => {
          if (todo.id === id) {
            // 新しいオブジェクトを作成して返す
            return { ...todo, title: value };
          }
          return todo;
        });


        // todos ステートが書き換えられていないかチェック
        console.log('=== Original todos ===');
        todos.map((todo) => {
          console.log(`id: ${todo.id}, title: ${todo.title}`);
        });


        return newTodos;
      });
    };

    const handleCheck = (id: number, completed_flg: boolean) => {
      setTodos((todos) => {
        const newTodos = todos.map((todo) => {
          if (todo.id === id) {
            return { ...todo, completed_flg };
          }
          return todo;
        });

        return newTodos;
      });
    };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // フォームのデフォルト動作を防ぐ
          handleSubmit(); // handleSubmit 関数を呼び出す
        }}
      >
        <input
          type="text"
          value={text} // フォームの入力値をステートにバインド
          onChange={(e) => setText(e.target.value)} // 入力値が変わった時にステートを更新
        />
         <button className="insert-btn" type="submit">追加</button> {/* ボタンをクリックしてもonSubmitをトリガーしない */}
      </form>
      <ul>
        {todos.map((todo) => {
          return (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.completed_flg}
                // 呼び出し側で checked フラグを反転させる
                onChange={() => handleCheck(todo.id, !todo.completed_flg)}
              />
              <input
                type="text"
                value={todo.title}
                disabled={todo.completed_flg}
                onChange={(e) => handleEdit(todo.id, e.target.value)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Todo;