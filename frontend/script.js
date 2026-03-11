const searchInput = document.getElementById('searchInput');
const bookList = document.getElementById('bookList');

let books = [];

function renderBooks(list) {
    bookList.innerHTML = '';
    list.forEach((book, index) => {
        const div = document.createElement('div');
        div.className = 'book';

        div.innerHTML = `
            <strong>${book.tittel}</strong><br>
            Forfatter: ${book.forfatter} <br>
            Serie: ${book.serie || '-'} ${book.nummer || ''} <br>

            Har lest:
            <input type="checkbox" data-index="${index}" data-field="har_lest"
                ${book.har_lest === "TRUE" ? "checked" : ""}>

            | Har boka:
            <input type="checkbox" data-index="${index}" data-field="har_boka"
                ${book.har_boka === "TRUE" ? "checked" : ""}>

            <br>
            Kommentar: ${book.kommentar || '-'}
        `;

        bookList.appendChild(div);
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const index = e.target.dataset.index;
            const field = e.target.dataset.field;

            books[index][field] = e.target.checked ? "TRUE" : "FALSE";

            await saveCSV();
        });
    });
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = books.filter(b =>
        b.tittel.toLowerCase().includes(query) || b.forfatter.toLowerCase().includes(query)
    );
    renderBooks(filtered);
});

// 🚀 Hent CSV fra backend, ikke lokalt
Papa.parse('https://bokliste.onrender.com/books', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        books = results.data;
        renderBooks(books);
    },
    error: function(err) {
        console.error('Kunne ikke laste CSV:', err);
    }
});

async function saveCSV() {
    // Bruk Papa til å lage korrekt CSV med header + quoting
    const csv = Papa.unparse(books, {
        header: true
    });

    await fetch("https://bokliste.onrender.com/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv })
    });
}

document.getElementById("addBookBtn").addEventListener("click", async () => {
    const tittel = document.getElementById("newTitle").value.trim();
    const forfatter = document.getElementById("newAuthor").value.trim();
    const serie = document.getElementById("newSeries").value.trim();
    const nummer = document.getElementById("newNumber").value.trim();
    const har_lest = document.getElementById("newRead").checked ? "TRUE" : "FALSE";
    const har_boka = document.getElementById("newOwned").checked ? "TRUE" : "FALSE";
    const kommentar = document.getElementById("newComment").value.trim();

    // Enkel validering
    if (!tittel || !forfatter) {
        alert("Tittel og forfatter må fylles ut");
        return;
    }

    // Legg til ny bok i arrayet
    books.push({
        tittel,
        forfatter,
        serie: serie || "",
        nummer: nummer || "",
        har_lest,
        har_boka,
        kommentar: kommentar || ""
    });

    // Lagre CSV og oppdater visningen
    await saveCSV();
    renderBooks(books);

    // Tøm feltene
    document.getElementById("newTitle").value = "";
    document.getElementById("newAuthor").value = "";
    document.getElementById("newSeries").value = "";
    document.getElementById("newNumber").value = "";
    document.getElementById("newRead").checked = false;
    document.getElementById("newOwned").checked = false;
    document.getElementById("newComment").value = "";
});

document.getElementById("toggleAddBook").addEventListener("click", () => {
    const box = document.getElementById("addBook");
    const btn = document.getElementById("toggleAddBook");

    if (box.style.display === "none" || box.style.display === "") {
        box.style.display = "block";
        btn.textContent = "−"; // minus når åpen
    } else {
        box.style.display = "none";
        btn.textContent = "+"; // plus når lukket
    }
});

