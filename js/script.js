// const BACKEND_API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000"; 
const BACKEND_API_BASE_URL =  "http://localhost:5000"; 

// console.log("website is there")

// Call load functions on page load
if (document.title === "Librarian Dashboard") {
    if (checkAuthentication('LIBRARIAN')) {
   loadBooks("LIBRARIAN");
   loadMembers();
    }
} else if (document.title === "Member Dashboard") {
  //  console.log("Member '")
    if (checkAuthentication('MEMBER')) {
        
   loadBooks("MEMBER");
   booksBorrowedByMe()
    }
}



// Function to check authentication and role
function checkAuthentication(requiredRole) {
    const token = localStorage.getItem('token');
  //  console.log("token 1: ",token);
    
    if (!token) {
        // No token found, redirect to login
        window.location.href = 'login.html';
        return false;
    }

    // Decode the token to get user info (you may need a library like jwt-decode)
    const payload = JSON.parse(atob(token.split('.')[1])); // Simple decode (not secure)
    // console.log("payload : ",payload);
    
    if (payload.role !== requiredRole) {
        // Role does not match, redirect to login
        window.location.href = 'login.html';
        return false;
    }

    return true; // User is authenticated and has the correct role
}


document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, role })
    });

    const data = await response.json();
    
    if (response.ok) {
        alert('Sign up successful! Please log in.');
        window.location.href = 'login.html';
    } else {
        alert(data.message || 'Error signing up');
    }
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

  //  console.log("loginForm : ",document.getElementById('loginForm'));

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    // console.log("data : ",data);


    if (response.ok) {
        localStorage.setItem('token', data.token); // Store JWT token
            const payload = JSON.parse(atob(data.token.split('.')[1])); // Simple decode (not secure)
            // console.log("payload : ",payload);
        
        // Redirect based on role or show appropriate dashboard
        window.location.href = payload.role === 'LIBRARIAN' ? 'librarian.html' : 'member.html';
    } else {
        alert(data.message || 'Error logging in');
    }
});


// script.js

// Logout function
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token'); // Clear JWT token
    window.location.href = 'login.html'; // Redirect to login page
});

// Add Book Functionality (for librarian)
document.getElementById('addBookForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const status = document.getElementById('bookStatus').value;

    const token = localStorage.getItem('token');

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/librarian/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, author, status })
    });

    const data = await response.json();

    if (response.ok) {
        alert('Book added successfully!');
        loadBooks("LIBRARIAN"); // Refresh the book list
        document.getElementById('addBookForm').reset(); // Reset form fields
    } else {
        alert(data.message || 'Error adding book');
    }
});

// Function to open the update modal and populate it with current book data
function openBookUpdateModal(book) {
    // console.log("data : ", data);
    // console.log("data : ", typeof(data));
    // const book = JSON.parse(data);

    document.getElementById('updateBookId').value = book._id;
    document.getElementById('updateBookTitle').value = book.title;
    document.getElementById('updateBookAuthor').value = book.author;
    document.getElementById('updateBookStatus').value = book.status;

    // Show the modal
    document.getElementById('updateBookModal').style.display = 'block';
}

// Load Books Functionality (for librarian)
async function loadBooks(role="MEMBER") {
    const token = localStorage.getItem('token');
  //  console.log("token : ",token);
    
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/librarian/books`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const books = await response.json();
    // console.log("books : ",books);
    
   
    if (role === 'LIBRARIAN') {
        const tbody = document.querySelector('#booksTable tbody');
        tbody.innerHTML = ''; // Clear existing rows
    
    books.forEach(book => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.status}</td>
            <td>
            <button onclick='openBookUpdateModal(${JSON.stringify(book)})' class='btn btn-primary'>Update</button>
            <button onclick='removeBook("${book._id}")' class='btn btn-danger'>Remove</button>
            </td>`;
        
        tbody.appendChild(row);
    });
} else {
    const tbody = document.querySelector('#memberBooksTable tbody');
    // console.log("tbody :", tbody)
    tbody.innerHTML = ''; // Clear existing rows

    books.forEach(book => {
        const row = document.createElement('tr');
        // console.log("book : ",book);
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.status}</td>
            <td>
            <button onclick='userBorrowBook(${JSON.stringify(book)})' class='btn btn-primary'>Borrow</button>
            </td>
            `
        tbody.appendChild(row);
        });

    }
};

async function booksBorrowedByMe() {
    const token = localStorage.getItem('token');

  //  console.log("booksBorrowedByMe : ", token);
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/member/books/borrowed`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const books = await response.json();
    // console.log("books1 : ",books);
    const tbody = document.querySelector('#memberBooksBorrowedTable tbody');

    tbody.innerHTML = ''; // Clear existing rows

    books.forEach(book => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.status}</td>
            <td>
            <button onclick='userReturnBook("${book._id}")' class='btn btn-warning'>Return</button>
            </td>
            `
        tbody.appendChild(row);
    });
}


// Function to load available books
async function loadAvailableBooks() {
    const token = localStorage.getItem('token');

    const response = await fetch(`${BACKEND_API_BASE_URL}/books/available`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const books = await response.json();
    
    const tbody = document.querySelector('#availableBooksTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    books.forEach(book => {
        const row = document.createElement('tr');
        
      //  console.log("book 0 : ", book);
        if (book.status === 'AVAILABLE') {
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.status}</td> 
                <td><button onclick='borrowBook("${book.id}")' class='btn btn-primary'>Borrow</button></td>`;
            
            tbody.appendChild(row);
        }
        else{
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.status}</td> 
                <td><button class='btn btn-disabled btn-secondary' disabled>Borrow</button></td>`;
            
            tbody.appendChild(row);
        }

    });
}

// Function to borrow and load borrowed books
async function userBorrowBook(book) {
    const token = localStorage.getItem('token');
  //  console.log("book debug : ",book);

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/member/book/borrow/${book._id}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        alert('Book borrowed successfully!');
        loadBooks("MEMBER"); // Refresh available books list
        booksBorrowedByMe();
    } else {
        alert('Error borrowing book');
    }
}

// Return Book Functionality (for member)
async function userReturnBook(bookId) {
  //  console.log("bookId here : ",bookId); 
    const token = localStorage.getItem('token');

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/member/book/return/${bookId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        alert('Book returned successfully!');
        loadBooks("MEMBER");
        booksBorrowedByMe(); // Refresh borrowed books list
        
    } else {
        alert('Error returning book');
    }
}


// Function to close the Book modal
document.getElementById('closeBookModal').addEventListener('click', function() {
    document.getElementById('updateBookModal').style.display = 'none';
});

// Function to close the Member modal
document.getElementById('closeMemberModal').addEventListener('click', function() {
    document.getElementById('updateMemberModal').style.display = 'none';
});

// Event listener for updating a book
document.getElementById('updateBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookId = document.getElementById('updateBookId').value;
    const title = document.getElementById('updateBookTitle').value;
    const author = document.getElementById('updateBookAuthor').value;
    const status = document.getElementById('updateBookStatus').value;

  //  console.log("status : ",status);

    const token = localStorage.getItem('token'); // Get JWT token

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/librarian/books/${bookId}`, {
        method: 'PUT', // or 'PATCH' depending on your API design
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, author, status })
    });

  //  console.log("response : ",response);
    const data = await response.json();

  //  console.log("data : ",data);
    if (response.ok) {
        alert('Book updated successfully!');
        document.getElementById('updateBookForm').reset(); // Reset form fields
        document.getElementById('updateBookModal').style.display = 'none'; // Close modal
        // $('#updateBookModal').modal('hide'); // Close modal

        loadBooks("LIBRARIAN"); // Refresh the books list
    } else {
        alert(data.message || 'Error updating book');
    }
});

// Function to open the update modal and populate it with current member data
function openMemberUpdateModal(member) {
    document.getElementById('updateMemberId').value = member._id;
    document.getElementById('updateMemberUsername').value = member.username;
    document.getElementById('updateMemberRole').value = member.role;

    // Show the modal
    document.getElementById('updateMemberModal').style.display = 'block';
}

// Load Members Functionality (for librarian)
async function loadMembers() {
    const token = localStorage.getItem('token');

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/member`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const members = await response.json();
    // console.log("members : ",members);
    
    const tbody = document.querySelector('#membersTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    members.forEach(member => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${member.username}</td>
            <td>${member.role}</td>
            <td>
            <button onclick='openMemberUpdateModal(${JSON.stringify(member)})' class='btn btn-primary'>Update</button>
            <button onclick='removeMember("${member._id}")' class='btn btn-danger'>Remove</button></td>`;
        
        tbody.appendChild(row);
    });
}

// Event listener for updating a member
document.getElementById('updateMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const memberId = document.getElementById('updateMemberId').value;
    const username = document.getElementById('updateMemberUsername').value;
    const role = document.getElementById('updateMemberRole').value;

    const token = localStorage.getItem('token'); // Get JWT token

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/member/${memberId}`, {
        method: 'PUT', // or 'PATCH' depending on your API design
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, role })
    });

    const data = await response.json();
    // console.log("data : ", data);

    if (response.ok) {
        alert('Member updated successfully!');
        document.getElementById('updateMemberForm').reset(); // Reset form fields
        document.getElementById('updateMemberModal').style.display = 'none'; // Close modal
        // $('#updateMemberModal').modal('hide'); // Close modal

        loadMembers(); // Refresh the members list
    } else {
        alert(data.message || 'Error updating member');
    }
});

// Remove Book Functionality (for librarian)
async function removeBook(bookId) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${BACKEND_API_BASE_URL}/librarian/books/${bookId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        alert('Book removed successfully!');
        loadBooks("LIBRARIAN"); // Refresh the book list
    } else {
        alert('Error removing book');
    }
}

// Load Available Books (for member)
async function loadAvailableBooks() {
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/librarian/books`); // Adjust endpoint as necessary
    const books = await response.json();
    
    const tbody = document.querySelector('#availableBooksTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    books.forEach(book => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td><button onclick='borrowBook("${book.id}")' class='btn btn-primary'>Borrow</button></td>`;
        
        tbody.appendChild(row);
    });
}

// Borrow Book Functionality (for member)
async function borrowBook(bookId) {
   const token = localStorage.getItem('token');

   const response = await fetch(`${BACKEND_API_BASE_URL}/api/books/borrow/${bookId}`, {
       method: 'POST',
       headers: {
           'Authorization': `Bearer ${token}`
       }
   });

   if (response.ok) {
       alert('Book borrowed successfully!');
       loadAvailableBooks(); // Refresh available books list
       loadBorrowedBooks()
   } else {
       alert('Error borrowing book');
   }
}


async function bookBoorrowedByUser(bookId) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/book/borrowed/${bookId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
       const data = await response.json();
       return data.username;

    } else {
        alert('Error Getting Book Borrowed By');
    }
}

// get Borrowed Books
async function loadBorrowedBooks() {
    const token = localStorage.getItem('token');

    const response = await fetch(`${BACKEND_API_BASE_URL}/api/member/books/borrowerd`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const books = await response.json();
    
    const tbody = document.querySelector('#availableBooksTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    books.forEach(book => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td><button onclick='returnBook("${book.id}")' class='btn btn-primary'>Borrow</button></td>`;
        
        tbody.appendChild(row);
    });

}

console.log("js accepted")

