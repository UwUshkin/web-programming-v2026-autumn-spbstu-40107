import React, {useState, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

const placeholderImage =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' fill='%23666666' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3EОбложка%3C/text%3E%3C/svg%3E";

const BOOKS = [
  {
    id: 1,
    title: 'Властелин колец',
    author: 'Дж. Р. Р. Толкин',
    cover: placeholderImage,
    description:
      'Эпический роман-эпопея в жанре фэнтези о походе Братства Кольца для уничтожения Кольца Всевластья.',
  },
  {
    id: 2,
    title: 'Хоббит, или Туда и обратно',
    author: 'Дж. Р. Р. Толкин',
    cover: placeholderImage,
    description:
      'Увлекательная повесть о путешествии хоббита Бильбо Бэггинса за сокровищами гномов к Одинокой Горе.',
  },
  {
    id: 3,
    title: 'Путешествие на Запад',
    author: 'У Чэнъэнь',
    cover: placeholderImage,
    description:
      'Классический китайский роман о паломничестве монаха в Индию и приключениях Царя обезьян Сунь Укуна.',
  },
];

function Modal({isOpen, onClose, book}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="modal-overlay"
      data-testid="book-modal"
      style={{display: isOpen ? 'flex' : 'none'}}
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          data-testid="modal-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          &times;
        </button>
        {book && (
          <div className="modal-body">
            <img
              src={book.cover}
              alt={`Обложка ${book.title}`}
              className="modal-cover"
            />
            <div className="modal-info">
              <h2>{book.title}</h2>
              <p className="modal-author">
                <strong>Автор:</strong> {book.author}
              </p>
              <p className="modal-desc">{book.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedBook(null), 200);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Книжный магазин</h1>
      </header>

      <main className="books-grid">
        {BOOKS.map((book) => (
          <article
            key={book.id}
            className="book-card"
            data-testid="book-card"
            onClick={() => openModal(book)}
          >
            <img src={book.cover} alt={book.title} className="book-cover" />
            <h3 className="book-title">{book.title}</h3>
          </article>
        ))}
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} book={selectedBook} />
    </div>
  );
}

const rootElement = document.querySelector('[data-testid="app"]');
if (!rootElement) {
  throw new Error('Корневой элемент приложения не найден.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
