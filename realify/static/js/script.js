document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');

    if (themeToggle && themeIcon) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // --- Scroll Reveal Animation ---
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 100;
            if (elementTop < windowHeight - elementVisible) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // --- Demo Interactivity ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const videoPreview = document.getElementById('video-preview');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    const confidenceScore = document.getElementById('confidence-score');
    const progressFill = document.getElementById('progress-fill');
    const scanningAnim = document.querySelector('.scanning-animation');
    const statusText = document.getElementById('status-text');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    ['dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, () => dropZone.classList.remove('drag-over'));
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (file.type.startsWith('image/')) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                videoPreview.style.display = 'none';
            } else if (file.type.startsWith('video/')) {
                videoPreview.src = e.target.result;
                videoPreview.style.display = 'block';
                imagePreview.style.display = 'none';
            }
            previewContainer.style.display = 'block';
            dropZone.style.display = 'none';
            resultContainer.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    analyzeBtn.addEventListener('click', async () => {
        const file = fileInput.files[0] || (await getFileFromDropZone());
        if (!file) return;

        analyzeBtn.disabled = true;
        analyzeBtn.style.opacity = '0.5';
        scanningAnim.style.display = 'block';
        resultContainer.style.display = 'block';
        
        let progress = 0;
        const statusSteps = [
            "Uploading media to secure server...",
            "Extracting CNN features...",
            "Analyzing manipulation artifacts...",
            "Running Transformer global analysis...",
            "Finalizing prediction..."
        ];

        const formData = new FormData();
        formData.append('file', file);

        const progressInterval = setInterval(() => {
            progress += Math.random() * 5;
            if (progress > 90) progress = 90; // Hold at 90 until fetch returns
            progressFill.style.width = `${progress}%`;
            const stepIndex = Math.min(Math.floor(progress / 20), statusSteps.length - 1);
            statusText.innerText = statusSteps[stepIndex];
        }, 300);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                clearInterval(progressInterval);
                progressFill.style.width = '100%';
                
                if (data.success) {
                    setTimeout(() => showFinalResult(data), 500);
                } else {
                    alert('Analysis failed: ' + (data.error || data.message || 'Unknown error'));
                    resetUI();
                }
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                clearInterval(progressInterval);
                alert('Server returned an unexpected response. Please check server logs.');
                resetUI();
            }
        } catch (error) {
            clearInterval(progressInterval);
            console.error('Error:', error);
            alert('Connection error or server unreachable.');
            resetUI();
        }
    });

    async function getFileFromDropZone() {
        // Helper to get file if it was dropped
        return fileInput.files[0]; 
    }

    function showFinalResult(data) {
        scanningAnim.style.display = 'none';
        analyzeBtn.style.display = 'none';
        
        const isReal = data.prediction === 'Real';
        const confidence = data.confidence;
        
        resultText.innerText = isReal ? 'RESULT: AUTHENTIC' : 'RESULT: MANIPULATED';
        resultText.style.color = isReal ? 'var(--primary)' : '#ff3e3e';
        confidenceScore.innerText = `Confidence Level: ${confidence}%`;
        statusText.innerText = isReal ? "No significant artifacts detected." : "Deepfake patterns identified in pixel consistency.";
        
        const card = resultContainer.querySelector('.result-card');
        card.style.borderColor = isReal ? 'var(--primary)' : '#ff3e3e';
        card.style.boxShadow = isReal 
            ? '0 0 30px rgba(0, 242, 255, 0.15)' 
            : '0 0 30px rgba(255, 62, 62, 0.15)';
    }

    function resetUI() {
        analyzeBtn.disabled = false;
        analyzeBtn.style.opacity = '1';
        scanningAnim.style.display = 'none';
        progressFill.style.width = '0%';
    }

    resetBtn.addEventListener('click', () => {
        dropZone.style.display = 'block';
        previewContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.style.display = 'inline-block';
        analyzeBtn.style.opacity = '1';
        progressFill.style.width = '0%';
        fileInput.value = '';
    });

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
