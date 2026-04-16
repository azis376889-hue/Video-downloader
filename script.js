document.addEventListener('DOMContentLoaded', function() {
    const platformSelect = document.getElementById('platform');
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');

    downloadBtn.addEventListener('click', handleDownload);

    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });

    async function handleDownload() {
        const platform = platformSelect.value;
        const url = videoUrlInput.value.trim();

        if (!platform || !url) {
            showError('Pilih platform dan masukkan URL video!');
            return;
        }

        if (!isValidUrl(url)) {
            showError('URL tidak valid!');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ platform, url })
            });

            const data = await response.json();

            if (response.ok) {
                showResult(data);
            } else {
                showError(data.message || 'Gagal mengambil video');
            }
        } catch (error) {
            showError('Terjadi kesalahan koneksi');
        } finally {
            setLoading(false);
        }
    }

    function setLoading(show) {
        loading.style.display = show ? 'block' : 'none';
        result.style.display = 'none';
        downloadBtn.disabled = show;
    }

    function showResult(data) {
        result.innerHTML = `
            <h3><i class="fas fa-check-circle"></i> Video ditemukan!</h3>
            <p>Ukuran: ${formatFileSize(data.size)}</p>
            <div class="download-links">
                ${data.links.map(link => 
                    `<a href="${link.url}" download="${link.quality}"><i class="fas fa-download"></i> ${link.quality}</a>`
                ).join('')}
            </div>
            <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.7;">
                <i class="fas fa-info-circle"></i> Klik kanan pada link untuk save as
            </p>
        `;
        result.className = 'result success';
        result.style.display = 'block';
    }

    function showError(message) {
        result.innerHTML = `
            <h3><i class="fas fa-exclamation-triangle"></i> Error</h3>
            <p>${message}</p>
        `;
        result.className = 'result error';
        result.style.display = 'block';
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
