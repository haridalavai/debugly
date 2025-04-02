async function fetchErrors() {
    const response = await fetch('/api/errors');
    const errors = await response.json();

    const tableBody = document.querySelector('#errorTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    errors.forEach(({ id, error, suggestion }) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${id}</td>
            <td>${error}</td>
            <td>${suggestion}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Fetch errors every 5 seconds
setInterval(fetchErrors, 5000);
fetchErrors();