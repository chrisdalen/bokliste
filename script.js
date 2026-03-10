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

    // Legg til event listeners
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const index = e.target.dataset.index;
            const field = e.target.dataset.field;

            // Oppdater i minnet
            books[index][field] = e.target.checked ? "TRUE" : "FALSE";

            // Lagre til backend
            await saveCSV();
        });
    });
}


// Filtrering
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = books.filter(b =>
        b.tittel.toLowerCase().includes(query) || b.forfatter.toLowerCase().includes(query)
    );
    renderBooks(filtered);
});

// Hent CSV direkte fra prosjektet
Papa.parse('books.csv', {
    download: true,
    header: true,      // gir deg objekter med feltnavn
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
    // Konverter books[] tilbake til CSV
    const header = "tittel,forfatter,serie,nummer,har_lest,har_boka,kommentar\n";
    const rows = books.map(b =>
        `${b.tittel},${b.forfatter},${b.serie || ""},${b.nummer || ""},${b.har_lest},${b.har_boka},${b.kommentar || ""}`
    ).join("\n");

    const csv = header + rows;

    await fetch("https://bokliste-backend.onrender.com/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv })
    });
}