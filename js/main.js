const STORAGE_KEY = 'bookshelf_apps' 
const SAVED_EVENT = 'saved-book' 
const RENDER_EVENT = 'render-book' 
const books = [] 

document.addEventListener('DOMContentLoaded', function() {
    const submitBookForm = document.getElementById('formInputBook')
    submitBookForm.addEventListener('submit', function(event) {
        event.preventDefault()
        addBook()
    })

    if (isLocalStorageExist()) {
        loadDataBookFromLocalStorage()
    }
})

function addBook() {
    const title = document.getElementById('inputBookTitle').value
    const author = document.getElementById('inputBookAuthor').value
    const year = document.getElementById('inputBookYear').value
    const isCompleted = document.getElementById('inputBookIsCompleted').checked
   
    const generatedID = generateId()
    const bookObject = generateBookObject(generatedID, title, author, year, isCompleted)
    books.push(bookObject)

    alert(`Buku ${title} yang ditulis oleh ${author}, berhasil dimasukkan ke rak!`)
   
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
    
    document.getElementById('formInputBook').reset()
}

function generateId() {
    return +new Date().getTime()
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title, 
        author, 
        year : parseInt(year),
        isCompleted
    }
}
  
document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList')
    incompleteBookshelfList.innerHTML = ''

    const completeBookList = document.getElementById('completeBookshelfList')
    completeBookList.innerHTML = ''
   
    for (const bookItem of books) {
        const bookElement = createBook(bookItem)
        if (!bookItem.isCompleted) {
            incompleteBookshelfList.append(bookElement)
        } else {
            completeBookList.append(bookElement)
        }
    }
})

function createBook(bookObject) {
    const  {id, title, author, year, isCompleted} = bookObject

    const titleBook = document.createElement('h3')
    titleBook.innerText = title

    const authorBook = document.createElement('p')
    authorBook.innerText = 'Penulis: ' + author

    const yearBook = document.createElement('p')
    yearBook.innerText = 'Tahun: ' + parseInt(year)

    const buttonBookItem = document.createElement('div')
    buttonBookItem.classList.add('action')

    const bookItem = document.createElement('article')
    bookItem.classList.add('book-item')
    bookItem.append(titleBook, authorBook, yearBook, buttonBookItem)

    if (isCompleted) {
        const undoButton = document.createElement('button')
        undoButton.classList.add('green')
        undoButton.innerText = 'Tandai belum selesai dibaca'

        undoButton.addEventListener('click', function() {
            undoBookFormCompleted(id)
        })

        const editButton = document.createElement('button')
        editButton.classList.add('yellow')
        editButton.innerText = 'Edit buku'

        editButton.addEventListener('click', function() {
            editBookFromBookshelf(id)
        })
        
        const trashButton = document.createElement('button')
        trashButton.classList.add('red')
        trashButton.innerText = 'Hapus'

        trashButton.addEventListener('click', function() {
            deleteBookFormCompleted(id)
        })

        buttonBookItem.append(undoButton, editButton, trashButton)
    } else {
        const addDoneButton = document.createElement('button')
        addDoneButton.classList.add('green')
        addDoneButton.innerText = 'Tandai sudah selesai dibaca'

        addDoneButton.addEventListener('click', function() {
            addDoneBookToCompleted(id)
        })

        const editButton = document.createElement('button')
        editButton.classList.add('yellow')
        editButton.innerText = 'Edit buku'

        editButton.addEventListener('click', function() {
            editBookFromBookshelf(id)
        })
        
        const trashButton = document.createElement('button')
        trashButton.classList.add('red')
        trashButton.innerText = 'Hapus'

        trashButton.addEventListener('click', function() {
            deleteBookFormCompleted(id)
        })

        buttonBookItem.append(addDoneButton, editButton, trashButton)
    }

    return bookItem
}

function addDoneBookToCompleted(bookId) {
    const bookTarget = findBook(bookId)
   
    if (bookTarget == null) return
   
    bookTarget.isCompleted = true
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id == bookId) return bookItem
    }
    return null
}

function deleteBookFormCompleted(bookId) {
    const bookTarget = findBookIndex(bookId)
    
    if (bookTarget === -1) return
    
    const bookToDelete = books[bookTarget]
    const isConfirmedToDelete = window.confirm(`Apakah kamu yakin ingin menghapus buku "${bookToDelete.title}"?`) 
    
    if (isConfirmedToDelete) {
        books.splice(bookTarget, 1)
        document.dispatchEvent(new Event(RENDER_EVENT))
        saveData()

        alert(`Buku "${bookToDelete.title}" telah berhasil dihapus!`)
    }
}
   
function undoBookFormCompleted(bookId) {
    const bookTarget = findBook(bookId)

    if (bookTarget == null) return
   
    bookTarget.isCompleted = false
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index 
        }
    }
   
    return -1 
}

function saveData() {
    if (isLocalStorageExist()) {
        const parsed = JSON.stringify(books) 
        localStorage.setItem(STORAGE_KEY, parsed) 
        document.dispatchEvent(new Event(SAVED_EVENT)) 
    }
}

function isLocalStorageExist() {
    if (typeof(Storage) === 'undefined') {
        alert('Aduh, browser kamu tidak mendukung local storage!')
        return false
    }
    return true
}

function loadDataBookFromLocalStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY)
    let dataBook = JSON.parse(serializedData)
   
    if (dataBook !== null) {
      for (const book of dataBook) {
        books.push(book)
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT))
}

function editBookFromBookshelf(bookId) {
    const book = findBook(bookId) 

    let editTitleBook = prompt('Masukkan judul baru:', book.title) 
    let editAuthorBook = prompt('Masukkan penulis baru:', book.author) 
    let editYearBook = prompt('Masukkan tahun baru:', book.year) 

    while (true) {
        if (editYearBook === null) {
            alert('Kamu tidak jadi edit buku.') 
            return 
        }

        editYearBook = parseInt(editYearBook) 
        if (!isNaN(editYearBook)) {
            break 
        } else {
            editYearBook = prompt('Tahun yang dimasukkan tidak valid. Masukkan tahun yang baru:') 
        }
    }

    while (true) {
        if (!editTitleBook) {
            editTitleBook = prompt('Judul tidak boleh kosong. Masukkan judul baru:') 
        } else if (!editAuthorBook) {
            editAuthorBook = prompt('Nama penulis tidak boleh kosong. Masukkan nama penulis baru:') 
        } else {
            const confirmationMessage = `Apakah kamu yakin ingin menyimpan perubahan untuk buku:\nJudul: ${editTitleBook}\nPenulis: ${editAuthorBook}\nTahun: ${editYearBook}` 
            const isConfirmed = window.confirm(confirmationMessage) 

            if (isConfirmed) {
                book.title = editTitleBook 
                book.author = editAuthorBook 
                book.year = editYearBook 

                saveData() 
                document.dispatchEvent(new Event(RENDER_EVENT)) 
            } else {
                alert('Perubahan tidak disimpan.') 
            }
            break 
        }
    }
}

const formSearchBook = document.getElementById('formSearchBook')
formSearchBook.addEventListener('submit', function(event) {
    event.preventDefault()
    const searchValue = document.getElementById('searchBook').value.toLowerCase()
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchValue) || 
        book.author.toLowerCase().includes(searchValue)
    )
    renderFilteredBooks(filteredBooks)
})

const searchBook = document.getElementById('searchBook')
searchBook.addEventListener('input', function(event) {
    const searchValue = event.target.value.trim().toLowerCase()
    if (!searchValue) {
        renderAllBooks()
    }
})

function renderFilteredBooks(filteredBooks) {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList')
    const completeBookshelfList = document.getElementById('completeBookshelfList')
    
    incompleteBookshelfList.innerHTML = ''
    completeBookshelfList.innerHTML = ''

    filteredBooks.forEach(book => {
        const bookElement = createBook(book)
        if (book.isCompleted) {
            completeBookshelfList.appendChild(bookElement)
        } else {
            incompleteBookshelfList.appendChild(bookElement)
        }
    })
}

function renderAllBooks() {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList')
    const completeBookshelfList = document.getElementById('completeBookshelfList')
    
    incompleteBookshelfList.innerHTML = ''
    completeBookshelfList.innerHTML = ''

    books.forEach(book => {
        const bookElement = createBook(book)
        if (book.isCompleted) {
            completeBookshelfList.appendChild(bookElement)
        } else {
            incompleteBookshelfList.appendChild(bookElement)
        }
    })
}