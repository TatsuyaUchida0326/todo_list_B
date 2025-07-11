import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';

// Todo型に新しいプロパティを追加
// startDate, endDate, progress, showDetail
// "Todo" 型の定義をコンポーネント外で行います
type Todo = {
  title: string;
  readonly id: number;
  completed_flg: boolean;
  delete_flg: boolean;
  startDate: string; // yyyy-mm-dd 形式
  endDate: string;   // yyyy-mm-dd 形式
  progress: number;  // 0-100
  showDetail: boolean; // アコーディオン表示
  detail?: string; // 詳細自由入力欄
};

type Filter = 'all' | 'completed' | 'unchecked' | 'delete';


// Todo コンポーネントの定義
const Todo: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [nextId, setNextId] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const navigate = useNavigate();

  // 日付を表示用に整形
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // 日付を1日進める/戻す
  const changeDate = (diff: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + diff);
    setCurrentDate(d.toISOString().slice(0, 10));
  };

  // useEffect フックを使ってコンポーネントのマウント時にデータを取得
  useEffect(() => {
    localforage.getItem('todo-20240622').then((values) => {
      if (values) {
        setTodos(values as Todo[]);
      }
    });
  }, []);



  // useEffect フックを使って todos ステートが更新されるたびにデータを保存
  useEffect(() => {
    localforage.setItem('todo-20240622', todos);
  }, [todos]);



  // todos ステートを更新する関数
  const handleSubmit = () => {
    if (!text) return;
    const newTodo: Todo = {
      title: text,
      id: nextId,
      completed_flg: false,
      delete_flg: false,
      startDate: currentDate,
      endDate: currentDate,
      progress: 0,
      showDetail: false,
    };
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setNextId(nextId + 1);
    setText('');
  };



  // フィルタリングされたタスクリストを取得する関数
  const getFilteredTodos = () => {
    switch (filter) {
      case 'completed':
        return todos.filter((todo) => todo.completed_flg && !todo.delete_flg);
      case 'unchecked':
        return todos.filter((todo) => !todo.completed_flg && !todo.delete_flg);
      case 'delete':
        return todos.filter((todo) => todo.delete_flg);
      default:
        return todos.filter((todo) => !todo.delete_flg);
    }
  };
  const handleFilterChange = (filter: Filter) => {
    setFilter(filter);
  };

  // 共通の更新関数を拡張
  const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
    id: number,
    key: K,
    value: V
  ) => {
    setTodos((todos) => {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          // 進捗率100%ならcompleted_flgもtrueに
          if (key === 'progress' && value === 100) {
            return { ...todo, [key]: value, completed_flg: true };
          }
          // 進捗率100%未満ならcompleted_flgをfalseに
          if (key === 'progress' && value !== 100) {
            return { ...todo, [key]: value, completed_flg: false };
          }
          return { ...todo, [key]: value };
        } else {
          return todo;
        }
      });
      return newTodos;
    });
  };

  // 編集ボタンで詳細アコーディオン表示切替
  const handleToggleDetail = (id: number) => {
    setTodos((todos) => todos.map((todo) =>
      todo.id === id ? { ...todo, showDetail: !todo.showDetail } : todo
    ));
  };

  // 物理的に削除する関数
  const handleEmpty = () => {
    setTodos((todos) => todos.filter((todo) => !todo.delete_flg));
  };



 return (
    <div className="todo-container">
      {/* 日付表示・カレンダーに戻る・前/次の日ボタン */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1em' }}>
        <div style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '0.5em' }}>{formatDate(currentDate)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
          <button className="button-yellow" onClick={() => changeDate(-1)}>前の日</button>
          <button className="button-yellow long back-button" onClick={() => navigate('/')} title="カレンダーに戻る">カレンダーに戻る</button>
          <button className="button-yellow" onClick={() => changeDate(1)}>次の日</button>
        </div>
      </div>
      <select
        defaultValue="all"
        onChange={(e) => handleFilterChange(e.target.value as Filter)}
      >
        <option value="all">すべてのタスク</option>
        <option value="completed">完了したタスク</option>
        <option value="unchecked">現在のタスク</option>
        <option value="delete">ごみ箱</option>
      </select>
      {/* フィルターが `delete` のときは「ごみ箱を空にする」ボタンを表示 */}
      {filter === 'delete' ? (
        <button onClick={handleEmpty} className="button-yellow">ごみ箱を空にする</button>
      ) : (
        // フィルターが `completed` でなければ Todo 入力フォームを表示
        filter !== 'completed' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              type="text"
              value={text} // フォームの入力値をステートにバインド
              onChange={(e) => setText(e.target.value)} // 入力値が変わった時にステートを更新
            />
            <button type="submit" className="button-yellow">追加</button>
          </form>
        )
      )}
      <ul>
        {getFilteredTodos().map((todo) => {
          const isTitleDisabled = todo.progress === 100;
          return (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                flexDirection: 'column', // カード全体を縦並びに
                alignItems: 'stretch',
                position: 'relative',
                background: '#fff',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                margin: '1em 0',
                padding: '1em',
                minWidth: 0,
              }}
            >
              {/* 上部：タスク本体（横並び） */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* 進捗率ドロップリスト */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: '0.5em' }}>
                  <label style={{ fontSize: '0.95em', color: '#333', marginBottom: '0.1em' }}>進捗率</label>
                  <select
                    value={todo.progress}
                    onChange={e => handleTodo(todo.id, 'progress', Number(e.target.value))}
                    style={{ width: '70px', height: '38px', fontSize: '1em', lineHeight: '1.2', padding: '0 0.2em' }}
                    disabled={todo.delete_flg}
                  >
                    {[...Array(11)].map((_, i) => (
                      <option key={i * 10} value={i * 10}>{i * 10}%</option>
                    ))}
                  </select>
                </div>
                {/* 開始日・完了予定日 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: '1em' }}>
                  <label style={{ fontSize: '0.95em', color: '#333', marginBottom: '0.1em' }}>開始日</label>
                  <input
                    type="date"
                    value={todo.startDate}
                    onChange={e => handleTodo(todo.id, 'startDate', e.target.value)}
                    disabled={todo.delete_flg}
                    style={{ marginBottom: '0.5em', width: '120px', height: '30px' }}
                  />
                  <label style={{ fontSize: '0.95em', color: '#333', marginBottom: '0.1em' }}>完了予定日</label>
                  <input
                    type="date"
                    value={todo.endDate}
                    onChange={e => handleTodo(todo.id, 'endDate', e.target.value)}
                    disabled={todo.delete_flg}
                    style={{ width: '120px', height: '30px' }}
                  />
                </div>
                {/* タイトル入力欄（進捗率100%でグレースケール） */}
                <div style={{ flexGrow: 1, marginRight: '1em', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    disabled={todo.completed_flg || todo.delete_flg}
                    value={todo.title}
                    onChange={(e) => handleTodo(todo.id, 'title', e.target.value)}
                    style={isTitleDisabled ? {
                      width: '100%',
                      background: '#e0e0e0',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      outline: 'none',
                      fontSize: '1.1em',
                      padding: '0.5em 0.2em',
                      boxSizing: 'border-box',
                      filter: 'grayscale(1)',
                      opacity: 1,
                      pointerEvents: 'none',
                    } : {
                      width: '100%',
                      background: 'transparent',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      outline: 'none',
                      fontSize: '1.1em',
                      padding: '0.5em 0.2em',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {/* 編集・削除ボタン（編集を左、削除を右に） */}
                <button
                  onClick={() => handleToggleDetail(todo.id)}
                  style={{ marginRight: '0.5em', backgroundColor: '#43a047', color: '#fff', border: 'none', borderRadius: '5px', height: '38px', width: '80px', fontSize: '1em', cursor: 'pointer' }}
                >
                  {todo.showDetail ? '閉じる' : '編集'}
                </button>
                <button
                  onClick={() => handleTodo(todo.id, 'delete_flg', !todo.delete_flg)}
                  style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', height: '38px', width: '80px', fontSize: '1em', cursor: 'pointer' }}
                >
                  {todo.delete_flg ? '復元' : '削除'}
                </button>
              </div>
              {/* 下部：詳細アコーディオン */}
              {todo.showDetail && (
                <div style={{
                  marginTop: '1em',
                  padding: '1em',
                  background: '#fff', // 白で統一
                  borderRadius: '8px',
                  boxShadow: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid #e0e0e0',
                  alignSelf: 'stretch',
                }}>
                  <textarea
                    value={todo.detail || ''}
                    onChange={e => handleTodo(todo.id, 'detail', e.target.value)}
                    placeholder="詳細を入力..."
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      resize: 'both', // 右下からリサイズ可
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      fontSize: '1em',
                      padding: '0.5em',
                      background: '#fff',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Todo;