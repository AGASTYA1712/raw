document.addEventListener("DOMContentLoaded", () => {
    // This dashboard dynamically loads data from localStorage.
    const STORAGE_COMPLAINTS = "citycare_complaints_v1";
    const complaints = JSON.parse(localStorage.getItem(STORAGE_COMPLAINTS) || "[]");

    // --- 1. UPDATE STAT CARDS DYNAMICALLY ---
    const pendingCount = complaints.filter(c => c.status === "Pending").length;
    const totalCount = complaints.length;
    const resolvedCount = totalCount - pendingCount;
    
    document.getElementById("pendingCount").innerText = pendingCount;
    document.getElementById("resolvedCount").innerText = resolvedCount; 
    document.getElementById("totalCount").innerText = totalCount;

    // --- 2. PREPARE DYNAMIC CHART DATA ---
    const categoryCounts = complaints.reduce((acc, c) => ({...acc, [c.category]: (acc[c.category] || 0) + 1}), {});
    const constituencyCounts = complaints.reduce((acc, c) => ({...acc, [c.constituency]: (acc[c.constituency] || 0) + 1}), {});

    // --- 3. RENDER CHARTS ---
    new Chart(document.getElementById("categoryChart"), {
      type: 'pie',
      data: {
        labels: Object.keys(categoryCounts).length > 0 ? Object.keys(categoryCounts) : ['No Data'],
        datasets: [{
          data: Object.values(categoryCounts).length > 0 ? Object.values(categoryCounts) : [1],
          backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40']
        }]
      },
      options: { plugins: { title: { display: true, text: 'Complaints by Category', color: '#fff', font: { size: 16 } }, legend: { labels: { color: '#fff' } } } }
    });

    new Chart(document.getElementById("districtChart"), {
      type: 'bar',
      data: {
        labels: Object.keys(constituencyCounts).length > 0 ? Object.keys(constituencyCounts) : ['No Data'],
        datasets: [{ label: 'No. of Complaints', data: Object.values(constituencyCounts), backgroundColor: '#36a2eb' }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Complaints by Constituency', color: '#fff', font: { size: 16 } }, legend: { display: false } },
        scales: { x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.2)' } }, y: { beginAtZero: true, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.2)' } } }
      }
    });
});
